'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentGradients } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
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

  // Handle Image Update
  // values.image is string (URL/Key) from client
  const imageUrl = typeof values.image === 'string' ? values.image : undefined;
  // If we have a new image URL (or strictly if it changed, but we update if provided)
  // For gradients, simple update if string is present.

  // Metadata
  // Check if we effectively have a new file to update metadata

  // Note: Client sends Full Payload usually.

  try {
    const updateData: any = {
      name: values.name,
      colors: values.colors,
      slug: values.slug,
      description: values.description,
      typeGradient: values.typeGradient,
      categoryGradientsId: values.categoryGradientsId,
      tier: values.tier,
      urlBuyOneTime: values.urlBuyOneTime,
      updatedAt: new Date(),
    };

    if (imageUrl) {
      updateData.image = imageUrl;
      updateData.linkDownload = imageUrl; // Gradient download is the image

      if (values.size) updateData.size = values.size;
      if (values.format) updateData.format = values.format;
      else if (imageUrl) updateData.format = imageUrl.split('.').pop()?.toUpperCase() || 'IMG';
    }

    await db.update(contentGradients).set(updateData).where(eq(contentGradients.id, id));

    revalidatePath('/dashboard/gradients');
    return { success: 'Gradient berhasil diperbarui!' };
  } catch (error) {
    console.error('[UpdateGradient] DB Update Error:', error);
    return { error: 'Gagal update database.' };
  }
}
