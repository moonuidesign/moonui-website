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

  // 2. Validasi
  const validated = ContentGradientSchema.safeParse(parsedJson);
  if (!validated.success) {
    return { error: 'Validasi gagal. Cek input warna atau nama.' };
  }
  const values = validated.data;

  // 3. Handle Image Upload (Thumbnail Gradient)
  const imageFile = formData.get('image');
  let imageUrl = '';
  let fileSize = '';
  let fileFormat = '';

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

      // --- PERBAIKAN DI SINI (Gunakan Domain CDN) ---
      imageUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;

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

  // Handle Source File Upload (for linkDownload)
  const sourceFile = formData.get('sourceFile');
  let linkDownload = '';

  if (sourceFile instanceof File && sourceFile.size > 0) {
    try {
      console.log('[CreateGradient] Uploading Source File:', sourceFile.name);
      const ext = sourceFile.name.split('.').pop();
      const fileName = `gradients/source/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: fileName,
          Body: Buffer.from(await sourceFile.arrayBuffer()),
          ContentType: sourceFile.type,
        }),
      );

      linkDownload = `${fileName}`;

      fileSize = (sourceFile.size / 1024 / 1024).toFixed(2) + ' MB';
      fileFormat = ext?.toUpperCase() || 'FILE';
      console.log('[CreateGradient] Source File Uploaded:', linkDownload);
    } catch (e) {
      console.error('[CreateGradient] Source File Upload Failed:', e);
      return { error: 'Gagal mengupload source file.' };
    }
  } else {
    // Fallback to imageUrl
    linkDownload = imageUrl;
    fileSize =
      (imageFile instanceof File ? imageFile.size / 1024 / 1024 : 0).toFixed(
        2,
      ) + ' MB';
    fileFormat =
      (imageFile instanceof File
        ? imageFile.name.split('.').pop()?.toUpperCase()
        : 'IMG') || 'IMG';
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
