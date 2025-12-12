'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ContentDesignSchema } from './validator';

type ActionResponse = { success: string } | { error: string };

export async function updateContentDesign(
  id: string,
  formData: FormData,
): Promise<ActionResponse> {
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

  const validated = ContentDesignSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error(
      '[UpdateDesign] Validation Error:',
      validated.error.flatten(),
    );
    return { error: 'Validasi form gagal.' };
  }
  const values = validated.data;
  console.log('[UpdateDesign] Validated Values:', values);

  // Handle Image Update
  const imageFile = formData.get('image');
  let imageUrl: string | undefined = undefined;

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

      imageUrl = `${fileName}`;
      console.log('[UpdateDesign] New Image URL:', imageUrl);
    } catch (e) {
      console.error('[UpdateDesign] Image Upload Failed:', e);
      return { error: 'Gagal upload gambar baru.' };
    }
  }

  // Handle Source File Update
  const sourceFile = formData.get('sourceFile');
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
      ...(imageUrl ? { imagesUrl: [imageUrl] } : {}),
      ...(linkDownload
        ? { linkDownload, size: fileSize, format: fileFormat }
        : {}),
    };

    console.log('[UpdateDesign] Updating DB with:', updateData);

    await db
      .update(contentDesigns)
      .set(updateData)
      .where(eq(contentDesigns.id, id));

    console.log('[UpdateDesign] DB Update Success');
    revalidatePath('/dashboard/designs');
    return { success: 'Design berhasil diperbarui!' };
  } catch (error) {
    console.error('[UpdateDesign] Update Error:', error);
    return { error: 'Gagal mengupdate database.' };
  }
}
