'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentGradients } from '@/db/migration';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy'; // Pastikan path import ini benar
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { desc } from 'drizzle-orm';
import { ContentGradientSchema } from './gradient-validator';
import { cookies } from 'next/headers';

type ActionResponse = { success: string } | { error: string };

export async function createContentGradient(
  formData: FormData,
): Promise<ActionResponse> {
  console.log('[CreateGradient] START');

  try {
    const c = await cookies();
    const hasToken =
      c.has('authjs.session-token') || c.has('next-auth.session-token');
    console.log('[CreateGradient] Has Session Cookie:', hasToken);
  } catch (e) {
    console.error('[CreateGradient] Cookie Error:', e);
  }

  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Unauthorized: No Session' };
  }
  const userId = session.user.id;

  // 1. Parse JSON Data
  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Invalid Data' };
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawData);
  } catch (e) {
    return { error: 'JSON Parse Error' };
  }

  // 2. Prepare Data for Validation
  // Karena 'File' tidak bisa di-stringify, kita perlu masukkan manual File dari formData ke object
  const imageFile = formData.get('image');
  if (imageFile instanceof File) {
    parsedJson.image = imageFile;
  }

  // 3. Validasi
  const validated = ContentGradientSchema.safeParse(parsedJson);
  if (!validated.success) {
    // Return detailed error message joined by newline or similar, or keep array if frontend handles it.
    // User complaint "kenapa tidak detail errornya Invalid input".
    // "Invalid input" often comes from Zod's default error map for unions or generic types if not refined.
    // By passing the File object, the union type validation should pass or give better error.
    const errorMessages = validated.error.issues.map((issue) => issue.message).join('\n');
    return {
      error: errorMessages,
    };
  }
  const values = validated.data;

  let imageUrl = '';
  let fileSize = '';
  let fileFormat = '';
  let linkDownload = '';
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      console.log('[CreateGradient] Uploading Image:', imageFile.name);
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
      imageUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
      linkDownload = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
      fileSize = (imageFile.size / 1024 / 1024).toFixed(2) + ' MB';
      fileFormat = ext?.toUpperCase() || 'IMG';
      console.log('[CreateGradient] Image Uploaded:', imageUrl);
    } catch (e) {
      console.error('[CreateGradient] Image Upload Failed:', e);
      return { error: 'Gagal upload thumbnail.' };
    }
  } else {
    return { error: 'Thumbnail gradient wajib diupload.' };
  }


  const lastItem = await db
    .select({ number: contentGradients.number })
    .from(contentGradients)
    .orderBy(desc(contentGradients.number))
    .limit(1);
  const nextNumber = (lastItem[0]?.number ?? 0) + 1;

  // 5. Insert DB
  try {
    const insertData = {
      userId,
      name: values.name,
      colors: values.colors,
      slug: values.slug,
      description: values.description,
      typeGradient: values.typeGradient,
      image: imageUrl,
      linkDownload: linkDownload,
      urlBuyOneTime: values.urlBuyOneTime,
      size: fileSize,
      format: fileFormat,
      categoryGradientsId: values.categoryGradientsId,
      tier: values.tier,
      number: nextNumber,
      downloadCount: 0,
    };

    await db.insert(contentGradients).values(insertData);

    revalidatePath('/dashboard/gradients');
    return { success: 'Gradient berhasil dibuat!' };
  } catch (error) {
    console.error('[CreateGradient] DB Insert Failed:', error);
    return { error: 'Gagal menyimpan ke database.' };
  }
}
