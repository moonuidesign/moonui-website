'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration/schema';
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
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  // 1. Parse JSON
  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string')
    return { error: 'Data tidak valid' };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
  } catch (e) {
    return { error: 'JSON Parse Error' };
  }

  // 2. Validasi
  const validated = ContentTemplateSchema.safeParse(parsedJson);
  if (!validated.success) {
    return { error: 'Validasi form gagal.' };
  }
  const values = validated.data;

  // 3. Handle File Uploads (Gambar Baru)
  const imageFiles = formData.getAll('images');
  const newUploadedAssets: AssetItem[] = [];

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

        newUploadedAssets.push({
          url: `https://${process.env.ACCOUNT_CLOUDFLARE}.r2.dev/${fileName}`,
          type: 'image_preview',
        });
      } catch (e) {
        return { error: 'Gagal upload gambar baru.' };
      }
    }
  }

  // 4. Merge Assets
  // values.assetUrls: berisi URL lama yang user pertahankan + URL manual baru
  // newUploadedAssets: berisi hasil upload file fisik saat ini
  const finalAssets: AssetItem[] = [
    ...(values.assetUrls || []),
    ...newUploadedAssets,
  ];

  try {
    await db
      .update(contentTemplates)
      .set({
        title: values.title,
        description: values.description,
        typeContent: values.typeContent,
        linkTemplate: values.linkTemplate,
        linkDonwload: '', // Mapping ke kolom DB (typo)
        categoryTemplatesId: values.categoryTemplatesId,
        slug: values.slug, // New Field
        assetUrl: finalAssets,
        tier: values.tier,
        platform: values.platform,
        statusContent: values.statusContent,
        updatedAt: new Date(),
      })
      .where(eq(contentTemplates.id, id));

    revalidatePath('/dashboard/templates');
    return { success: 'Template berhasil diperbarui!' };
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Gagal mengupdate database.' };
  }
}
