'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { desc } from 'drizzle-orm';
import { AssetItem, ContentTemplateSchema } from './validator';

// Definisikan tipe return yang spesifik (Strict)
type ActionResponse = { success: string } | { error: string };

export async function createContentTemplate(
  formData: FormData,
): Promise<ActionResponse> {
  console.log('[CreateTemplate] Started');
  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) {
    console.error('[CreateTemplate] Unauthorized');
    return { error: 'Unauthorized: Harap login.' };
  }
  const userId = session.user.id;
  console.log('[CreateTemplate] UserId:', userId);

  // 2. Parse JSON Data dari FormData
  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    console.error('[CreateTemplate] Invalid Data');
    return { error: 'Data form rusak atau tidak valid.' };
  }

  // 3. Validasi Zod
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
    console.log('[CreateTemplate] Parsed JSON:', parsedJson);
  } catch (e) {
    console.error('[CreateTemplate] JSON Parse Error:', e);
    return { error: 'Format JSON tidak valid.' };
  }

  const validated = ContentTemplateSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error(
      '[CreateTemplate] Validation Error:',
      validated.error.flatten(),
    );
    return { error: 'Input tidak valid. Periksa kembali form anda.' };
  }

  const values = validated.data;
  console.log('[CreateTemplate] Validated Values:', values);

  // Handle Main File Upload
  const mainFile = formData.get('mainFile');
  let linkDownloadUrl = '';
  let fileSize = '';
  let fileFormat = '';

  if (mainFile instanceof File && mainFile.size > 0) {
    try {
      console.log('[CreateTemplate] Uploading Main File:', mainFile.name);
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
      console.log('[CreateTemplate] Main File Uploaded:', linkDownloadUrl);
    } catch (e) {
      console.error('[CreateTemplate] Upload Main File Failed:', e);
      return { error: 'Gagal mengupload file template utama.' };
    }
  }

  // 4. Handle File Upload (Images)
  const imageFiles = formData.getAll('images');
  const uploadedAssets: AssetItem[] = [];
  console.log(`[CreateTemplate] Found ${imageFiles.length} images to upload`);

  // Validasi manual untuk items di FormData agar Type-Safe
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
        uploadedAssets.push({
          url: assetUrl,
          type: 'image_preview',
        });
        console.log('[CreateTemplate] Uploaded Asset:', assetUrl);
      } catch (e) {
        console.error('[CreateTemplate] Asset Upload Failed:', e);
        return { error: 'Gagal mengupload gambar ke server.' };
      }
    }
  }

  // Gabungkan asset manual + hasil upload
  const finalAssets: AssetItem[] = [
    ...(values.assetUrls || []),
    ...uploadedAssets,
  ];

  // 5. Generate Number (Auto Increment Logic)
  const lastItem = await db
    .select({ number: contentTemplates.number })
    .from(contentTemplates)
    .orderBy(desc(contentTemplates.number))
    .limit(1);

  const nextNumber = (lastItem[0]?.number ?? 0) + 1;
  console.log('[CreateTemplate] Next Number:', nextNumber);

  // 6. Insert ke Database
  try {
    const insertData = {
      userId,
      title: values.title,
      description: values.description,
      typeContent: values.typeContent,
      linkTemplate: values.linkTemplate,
      linkDonwload: linkDownloadUrl, // Typo fixed in schema, but keeping for now
      size: fileSize,
      format: fileFormat,
      categoryTemplatesId: values.categoryTemplatesId,
      slug: values.slug, // New Field
      assetUrl: finalAssets, // Drizzle akan otomatis stringify JSONB
      tier: values.tier,
      // platform: values.platform, // Removed not in schema
      statusContent: values.statusContent,
      urlBuyOneTime: values.urlBuyOneTime,
      number: nextNumber,
      imagesUrl: finalAssets, // Add imagesUrl to the insertData
      viewCount: 0,
      downloadCount: 0,
    };
    console.log('[CreateTemplate] Inserting DB:', insertData);

    await db.insert(contentTemplates).values(insertData);

    console.log('[CreateTemplate] DB Insert Success');
    revalidatePath('/dashboard/templates');
    return { success: 'Template berhasil dibuat!' };
  } catch (error) {
    console.error('[CreateTemplate] DB Insert Error:', error);
    return { error: 'Gagal menyimpan data ke database.' };
  }
}
