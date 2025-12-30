'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
import { auth } from '@/libs/auth';
import { ContentDesignSchema } from './validator';

type ActionResponse = { success: string } | { error: string };

export async function updateContentDesign(id: string, formData: FormData): Promise<ActionResponse> {
  console.log('[UpdateDesign] Started for ID:', id);
  const session = await auth();
  if (!session?.user?.id) {
    console.error('[UpdateDesign] Unauthorized');
    return { error: 'Unauthorized' };
  }

  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    console.error('[UpdateDesign] Invalid Data');
    return { error: 'Data tidak valid' };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
    console.log('[UpdateDesign] Parsed JSON:', parsedJson);
  } catch (e) {
    console.error('[UpdateDesign] JSON Parse Error:', e);
    return { error: 'JSON Parse Error' };
  }

  // Inject 'newImages' from formData for validation
  const newImages = formData.getAll('images');
  if (newImages.length > 0) {
    // @ts-expect-error: Injecting newImages for validation
    parsedJson.newImages = newImages.filter((f) => f instanceof File);
  }

  // Inject 'sourceFile' if needed
  const sourceFile = formData.get('sourceFile');
  if (sourceFile instanceof File) {
    // @ts-expect-error: Injecting sourceFile for validation
    parsedJson.sourceFile = sourceFile;
  }

  const validated = ContentDesignSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error('[UpdateDesign] Validation Error:', validated.error.flatten());
    return { error: 'Validasi form gagal.' };
  }
  const values = validated.data;
  console.log('[UpdateDesign] Validated Values:', values);

  // Handle Main File
  const linkDownloadUrl = typeof values.sourceFile === 'string' ? values.sourceFile : '';
  const hasNewMainFile = !!linkDownloadUrl;

  // Metadata from Client
  const fileSize = values.size;
  const fileFormat = values.format;

  // Handle Images
  // Client sends `imagesUrl` which contains ALL valid images (existing + new) as strings.
  // We just use that list directly.
  const finalImagesUrl = values.imagesUrl || [];

  try {
    const updateData: any = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      categoryDesignsId: values.categoryDesignsId,
      tier: values.tier,
      statusContent: values.statusContent,
      urlBuyOneTime: values.urlBuyOneTime,
      updatedAt: new Date(),
      imagesUrl: finalImagesUrl, // Always update imagesUrl with the final list
    };

    if (hasNewMainFile) {
      updateData.linkDownload = linkDownloadUrl;

      // Update Metadata if provided by client (new file uploaded)
      if (fileSize) updateData.size = fileSize;
      // Logic format: Use client format, or guess from URL, or default FILE
      const finalFormat = fileFormat || linkDownloadUrl.split('.').pop()?.toUpperCase() || 'FILE';
      updateData.format = finalFormat;
    }

    console.log('[UpdateDesign] Updating DB with:', updateData);

    await db.update(contentDesigns).set(updateData).where(eq(contentDesigns.id, id));

    console.log('[UpdateDesign] DB Update Success');
    revalidatePath('/dashboard/designs');
    return { success: 'Design berhasil diperbarui!' };
  } catch (error) {
    console.error('[UpdateDesign] Update Error:', error);
    return { error: 'Gagal mengupdate database.' };
  }
}
