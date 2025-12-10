'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration/schema';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { desc } from 'drizzle-orm';
import { ContentDesignSchema } from './validator';

type ActionResponse = { success: string } | { error: string };

export async function createContentDesign(
  formData: FormData,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized: Harap login.' };
  const userId = session.user.id;

  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Data form rusak atau tidak valid.' };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
  } catch (e) {
    return { error: 'Format JSON tidak valid.' };
  }

  const validated = ContentDesignSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error('Validation Error:', validated.error.flatten());
    return { error: 'Input tidak valid. Periksa kembali form anda.' };
  }

  const values = validated.data;

  // Handle Single Image Upload
  const imageFile = formData.get('image');
  let imageUrl = '';

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `designs/${Date.now()}-${crypto.randomUUID()}.${ext}`;

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
      console.error('Upload Failed:', e);
      return { error: 'Gagal mengupload gambar ke server.' };
    }
  } else {
     // Optional: if image is required, return error here.
     // For now, let's say it's required for new design.
     return { error: 'Gambar design wajib diupload.' };
  }

  const lastItem = await db
    .select({ number: contentDesigns.number })
    .from(contentDesigns)
    .orderBy(desc(contentDesigns.number))
    .limit(1);

  const nextNumber = (lastItem[0]?.number ?? 0) + 1;

  try {
    await db.insert(contentDesigns).values({
      userId,
      title: values.title,
      slug: values.slug, // JSONB
      description: values.description,
      imageUrl: imageUrl, 
      categoryDesignsId: values.categoryDesignsId,
      tier: values.tier,
      statusContent: values.statusContent,
      number: nextNumber,
      viewCount: 0,
      downloadCount: 0,
    });

    revalidatePath('/dashboard/designs');
    return { success: 'Design berhasil dibuat!' };
  } catch (error) {
    console.error('DB Insert Error:', error);
    return { error: 'Gagal menyimpan data ke database.' };
  }
}