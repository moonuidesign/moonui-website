'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ContentDesignSchema } from './validator';
import { AssetItem } from '../templates/validator';

type ActionResponse = { success: string } | { error: string };

export async function createContentDesign(formData: FormData): Promise<ActionResponse> {
  console.log('[CreateDesign] Started');
  const session = await auth();
  if (!session?.user?.id) {
    console.error('[CreateDesign] Unauthorized: No session or user ID');
    return { error: 'Unauthorized: Harap login.' };
  }
  const userId = session.user.id;
  console.log('[CreateDesign] UserId:', userId);

  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    console.error('[CreateDesign] Invalid Data: data field missing or not string');
    return { error: 'Data form rusak atau tidak valid.' };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
    console.log('[CreateDesign] Parsed JSON:', parsedJson);
  } catch (e) {
    console.error('[CreateDesign] JSON Parse Error:', e);
    return { error: 'Format JSON tidak valid.' };
  }

  // Inject 'newImages' from formData for validation
  const newImages = formData.getAll('images');
  if (newImages.length > 0) {
    // @ts-expect-error: parsedJson is typed as unknown/any but we are injecting a property for validation
    parsedJson.newImages = newImages.filter((f) => f instanceof File);
  }

  // Inject 'sourceFile' if needed
  const sourceFile = formData.get('sourceFile');
  if (sourceFile instanceof File) {
    // @ts-expect-error: parsedJson is typed as unknown/any but we are injecting a property for validation
    parsedJson.sourceFile = sourceFile;
  }

  const validated = ContentDesignSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error('[CreateDesign] Validation Error:', validated.error.flatten());
    return { error: 'Input tidak valid. Periksa kembali form anda.' };
  }

  const values = validated.data;
  console.log('[CreateDesign] Validated Values:', values);

  // Handle Multiple Image Upload
  const imageFiles = formData.getAll('images');
  const uploadedImageUrls: AssetItem[] = [];

  if (imageFiles && imageFiles.length > 0) {
    for (const imageFile of imageFiles) {
      if (imageFile instanceof File && imageFile.size > 0) {
        try {
          console.log('[CreateDesign] Uploading Image:', imageFile.name);
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
          uploadedImageUrls.push({ url: assetUrl });
          console.log('[CreateDesign] Image Uploaded:', assetUrl);
        } catch (e) {
          console.error('[CreateDesign] Upload Failed for file:', imageFile.name, e);
        }
      }
    }
  }

  if (uploadedImageUrls.length === 0) {
    console.error('[CreateDesign] No Image Files Provided or Upload Failed');
    return { error: 'Minimal satu gambar design wajib diupload.' };
  }

  let linkDownload = '';
  let fileSize = '';
  let fileFormat = '';

  if (sourceFile instanceof File && sourceFile.size > 0) {
    try {
      console.log('[CreateDesign] Uploading Source File:', sourceFile.name);
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
      console.log('[CreateDesign] Source File Uploaded:', linkDownload);
    } catch (e) {
      console.error('[CreateDesign] Source File Upload Failed:', e);
      return { error: 'Gagal mengupload source file.' };
    }
  } else {
    // Fallback to first imageUrl if sourceFile not provided.
    console.log('[CreateDesign] No Source File, using first Image URL as fallback');
    const firstImage = imageFiles[0] instanceof File ? imageFiles[0] : null;
    fileSize = (firstImage ? firstImage.size / 1024 / 1024 : 0).toFixed(2) + ' MB';
    fileFormat = (firstImage ? firstImage.name.split('.').pop()?.toUpperCase() : 'IMG') || 'IMG';
  }

  try {
    const insertData = {
      userId,
      title: values.title,
      slug: values.slug, // JSONB
      description: values.description,
      imagesUrl: uploadedImageUrls, // Store as JSON array
      linkDownload: linkDownload,
      urlBuyOneTime: values.urlBuyOneTime,
      size: fileSize,
      format: fileFormat,
      categoryDesignsId: values.categoryDesignsId,
      tier: values.tier,
      statusContent: values.statusContent,
    };
    console.log('[CreateDesign] Inserting DB:', insertData);
    await db.insert(contentDesigns).values(insertData);

    console.log('[CreateDesign] DB Insert Success');
    revalidatePath('/dashboard/designs');
    return { success: 'Design berhasil dibuat!' };
  } catch (error) {
    console.error('[CreateDesign] DB Insert Error:', error);
    return { error: 'Gagal menyimpan data ke database.' };
  }
}
