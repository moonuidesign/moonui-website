'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { AssetItem, ContentTemplateSchema } from './validator';

type ActionResponse = { success: string } | { error: string };

export async function updateContentTemplate(
  id: string,
  formData: FormData,
): Promise<ActionResponse> {
  console.log('[UpdateTemplate] Started for ID:', id);
  const session = await auth();
  if (!session?.user?.id) {
    console.error('[UpdateTemplate] Unauthorized');
    return { error: 'Unauthorized' };
  }

  // 1. Parse JSON
  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    console.error('[UpdateTemplate] Invalid Data');
    return { error: 'Data tidak valid' };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
    console.log('[UpdateTemplate] Parsed JSON:', parsedJson);
  } catch (e) {
    console.error('[UpdateTemplate] JSON Parse Error:', e);
    return { error: 'JSON Parse Error' };
  }

  // 2. Validasi
  const validated = ContentTemplateSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error(
      '[UpdateTemplate] Validation Error:',
      validated.error.flatten(),
    );
    return { error: 'Validasi form gagal.' };
  }
  const values = validated.data;
  console.log('[UpdateTemplate] Validated Values:', values);

  // Handle Main File Update
  const mainFile = formData.get('mainFile');
  let linkDownloadUrl = '';
  let fileSize = '';
  let fileFormat = '';
  let hasNewMainFile = false;

  if (mainFile instanceof File && mainFile.size > 0) {
    try {
      console.log('[UpdateTemplate] Uploading New Main File:', mainFile.name);
      const ext = mainFile.name.split('.').pop();
      const fileName = `downloads/templates/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: fileName,
          Body: Buffer.from(await mainFile.arrayBuffer()),
          ContentType: mainFile.type,
        }),
      );

      linkDownloadUrl = `${fileName}`;
      fileSize = (mainFile.size / 1024 / 1024).toFixed(2) + ' MB';
      fileFormat = ext?.toUpperCase() || 'FILE';
      hasNewMainFile = true;
      console.log('[UpdateTemplate] New Main File Uploaded:', linkDownloadUrl);
    } catch (e) {
      console.error('[UpdateTemplate] Main File Upload Failed:', e);
      return { error: 'Gagal upload file template utama.' };
    }
  }

  // 3. Handle File Uploads (Gambar Baru)
  const imageFiles = formData.getAll('images');
  const newUploadedAssets: AssetItem[] = [];
  console.log(`[UpdateTemplate] Found ${imageFiles.length} new images`);

  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0) {
      try {
        const ext = file.name.split('.').pop();
        const fileName = `templates/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME!,
            Key: fileName,
            Body: Buffer.from(await file.arrayBuffer()),
            ContentType: file.type,
          }),
        );

        const assetUrl = `${fileName}`;
        newUploadedAssets.push({
          url: assetUrl,
        });
        console.log('[UpdateTemplate] Uploaded Asset:', assetUrl);
      } catch (e) {
        console.error('[UpdateTemplate] Asset Upload Failed:', e);
        return { error: 'Gagal upload gambar baru.' };
      }
    }
  }

  // 4. Merge Assets
  // values.assetUrls: berisi URL lama yang user pertahankan + URL manual baru
  // newUploadedAssets: berisi hasil upload file fisik saat ini
  const finalAssets: AssetItem[] = [
    ...(values.imagesUrl || []),
    ...newUploadedAssets,
  ];

  try {
    const updateData = {
      title: values.title,
      description: values.description,
      typeContent: values.typeContent,
      linkTemplate: values.linkTemplate,
      categoryTemplatesId: values.categoryTemplatesId,
      slug: values.slug,
      assetUrl: finalAssets,
      tier: values.tier,
      statusContent: values.statusContent,
      urlBuyOneTime: values.urlBuyOneTime,
      updatedAt: new Date(),
      ...(hasNewMainFile
        ? { linkDonwload: linkDownloadUrl, size: fileSize, format: fileFormat }
        : {}),
    };

    console.log('[UpdateTemplate] Updating DB with:', updateData);

    await db
      .update(contentTemplates)
      .set(updateData)
      .where(eq(contentTemplates.id, id));

    console.log('[UpdateTemplate] DB Update Success');
    revalidatePath('/dashboard/templates');
    return { success: 'Template berhasil diperbarui!' };
  } catch (error) {
    console.error('[UpdateTemplate] Update Error:', error);
    return { error: 'Gagal mengupdate database.' };
  }
}
