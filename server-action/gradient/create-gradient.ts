'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentGradients } from '@/db/migration/schema';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { desc } from 'drizzle-orm';
import { ContentGradientSchema } from './gradient-validator';

type ActionResponse = { success: string } | { error: string };

export async function createContentGradient(
  formData: FormData,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };
  const userId = session.user.id;

  // 1. Parse JSON Data
  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') return { error: 'Invalid Data' };

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawData);
  } catch (e) {
    return { error: 'JSON Parse Error' };
  }

  // 2. Validasi
  const validated = ContentGradientSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error(validated.error.flatten());
    return { error: 'Validasi gagal. Cek input warna atau nama.' };
  }
  const values = validated.data;

  // 3. Handle Image Upload (Thumbnail Gradient)
  const imageFile = formData.get('image');
  let imageUrl = '';

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `gradients/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: fileName,
          Body: Buffer.from(await imageFile.arrayBuffer()),
          ContentType: imageFile.type,
        }),
      );

      imageUrl = `https://${process.env.ACCOUNT_CLOUDFLARE}.r2.dev/${fileName}`;
    } catch (e) {
      return { error: 'Gagal upload thumbnail.' };
    }
  } else {
    return { error: 'Thumbnail gradient wajib diupload.' };
  }

  // 4. Generate Number
  const lastItem = await db
    .select({ number: contentGradients.number })
    .from(contentGradients)
    .orderBy(desc(contentGradients.number))
    .limit(1);
  const nextNumber = (lastItem[0]?.number ?? 0) + 1;

  // 5. Insert DB
  try {
    await db.insert(contentGradients).values({
      userId,
      name: values.name,
      colors: values.colors, // Disimpan sebagai JSONB
      slug: values.slug, // New Field
      typeGradient: values.typeGradient,
      image: imageUrl,
      linkDownload: imageUrl, // Default download link ke gambar jika kosong
      categoryGradientsId: values.categoryGradientsId,
      tier: values.tier,
      number: nextNumber,
      downloadCount: 0,
    });

    revalidatePath('/dashboard/gradients');
    return { success: 'Gradient berhasil dibuat!' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal menyimpan ke database.' };
  }
}
