'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ContentDesignSchema } from './validator';
import { AssetItem } from '../templates/validator';

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

  // Handle Multiple Image Upload (New Files)
  const imageFiles = formData.getAll('images');
  const newImageUrls: AssetItem[] = [];

  if (imageFiles && imageFiles.length > 0) {
    for (const imageFile of imageFiles) {
      if (imageFile instanceof File && imageFile.size > 0) {
        try {
          console.log('[UpdateDesign] Uploading New Image:', imageFile.name);
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

          const assetUrl = `${fileName}`;
          newImageUrls.push({
            url: assetUrl,
          });
          console.log('[UpdateDesign] New Image URL:', assetUrl);
        } catch (e) {
          console.error('[UpdateDesign] Image Upload Failed for:', imageFile.name, e);
        }
      }
    }
  }

  // Combine existing images (from values.imagesUrl) with new uploaded images
  // values.imagesUrl comes from the client, containing URLs of images that were NOT deleted.
  const existingImages = values.imagesUrl || [];
  const finalImagesUrl = [...existingImages, ...newImageUrls];

  let linkDownload: string | undefined = undefined;
  let fileSize = '';
  let fileFormat = '';

  if (sourceFile instanceof File && sourceFile.size > 0) {
    try {
      console.log('[UpdateDesign] Uploading New Source File:', sourceFile.name);
      const ext = sourceFile.name.split('.').pop();
      const fileName = `designs/source/${Date.now()}-${crypto.randomUUID()}.${ext}`;

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
      console.log('[UpdateDesign] New Source Link:', linkDownload);
    } catch (e) {
      console.error('[UpdateDesign] Source Upload Failed:', e);
      return { error: 'Gagal upload source file baru.' };
    }
  }

  try {
    const updateData = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      categoryDesignsId: values.categoryDesignsId,
      tier: values.tier,
      statusContent: values.statusContent,
      urlBuyOneTime: values.urlBuyOneTime,
      updatedAt: new Date(),
      imagesUrl: finalImagesUrl, // Always update imagesUrl with the final list
      ...(linkDownload ? { linkDownload, size: fileSize, format: fileFormat } : {}),
    };

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
