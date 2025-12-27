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

  // Inject image file from formData into parsedJson for validation
  const imageFileForValidation = formData.get('image');
  if (imageFileForValidation instanceof File) {
    // If new file upload, use it for validation
    parsedJson.image = imageFileForValidation;
  }

  const validated = ContentGradientSchema.safeParse(parsedJson);
  if (!validated.success) {
    const errorMessages = validated.error.issues.map((issue) => issue.message).join('\n');
    return {
      error: errorMessages,
    };
  }
  const values = validated.data;

  // Handle Image Update (Optional)
  const imageFile = formData.get('image');
  let imageUrl = undefined;
  let fileSize = '';
  let fileFormat = '';
  let linkDownload = undefined;
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
      imageUrl = `${fileName}`;
      linkDownload = `${fileName}`;
      fileSize = (imageFile.size / 1024 / 1024).toFixed(2) + ' MB';
      fileFormat = ext?.toUpperCase() || 'IMG';
    } catch (e) {
      console.error('[UpdateGradient] Image Upload Failed:', e);
      return { error: 'Gagal upload thumbnail baru.' };
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
