'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentGradients } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy'; // Pastikan path import benar
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ContentGradientSchema } from './gradient-validator';

type ActionResponse = { success: string } | { error: string };

export async function updateContentGradient(
  id: string,
  formData: FormData,
): Promise<ActionResponse> {
  console.log('[UpdateGradient] Started for ID:', id);
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

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

  const validated = ContentGradientSchema.safeParse(parsedJson);
  if (!validated.success) {
    return { error: 'Validasi gagal.' };
  }
  const values = validated.data;

  // Handle Image Update (Optional)
  const imageFile = formData.get('image');
  let imageUrl = undefined;
  let fileSize = '';
  let fileFormat = '';

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      console.log('[UpdateGradient] Uploading New Image:', imageFile.name);
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
      imageUrl = `${fileName}`;

      fileSize = (imageFile.size / 1024 / 1024).toFixed(2) + ' MB';
      fileFormat = ext?.toUpperCase() || 'IMG';
    } catch (e) {
      console.error('[UpdateGradient] Image Upload Failed:', e);
      return { error: 'Gagal upload thumbnail baru.' };
    }
  }

  // Handle Source File Update
  const sourceFile = formData.get('sourceFile');
  let linkDownload = undefined;

  if (sourceFile instanceof File && sourceFile.size > 0) {
    try {
      console.log(
        '[UpdateGradient] Uploading New Source File:',
        sourceFile.name,
      );
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

      // --- PERBAIKAN DI SINI (Gunakan Domain CDN) ---
      linkDownload = `${fileName}`;

      fileSize = (sourceFile.size / 1024 / 1024).toFixed(2) + ' MB';
      fileFormat = ext?.toUpperCase() || 'FILE';
    } catch (e) {
      console.error('[UpdateGradient] Source Upload Failed:', e);
      return { error: 'Gagal upload source file baru.' };
    }
  } else if (imageUrl) {
    // Jika update gambar tapi tidak update source file, update metadata size/format dari gambar
    if (imageFile instanceof File) {
      fileSize = (imageFile.size / 1024 / 1024).toFixed(2) + ' MB';
      fileFormat = imageFile.name.split('.').pop()?.toUpperCase() || 'IMG';
    }
  }

  try {
    const updateData = {
      name: values.name,
      colors: values.colors,
      slug: values.slug,
      description: values.description,
      typeGradient: values.typeGradient,
      categoryGradientsId: values.categoryGradientsId,
      tier: values.tier,
      urlBuyOneTime: values.urlBuyOneTime,
      updatedAt: new Date(),
      ...(imageUrl ? { image: imageUrl } : {}),
      ...(linkDownload
        ? { linkDownload, size: fileSize, format: fileFormat }
        : {}),
    };

    await db
      .update(contentGradients)
      .set(updateData)
      .where(eq(contentGradients.id, id));

    revalidatePath('/dashboard/gradients');
    return { success: 'Gradient berhasil diperbarui!' };
  } catch (error) {
    console.error('[UpdateGradient] DB Update Error:', error);
    return { error: 'Gagal update database.' };
  }
}
