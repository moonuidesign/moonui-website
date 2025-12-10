'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration/schema';
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
  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized: Harap login.' };
  const userId = session.user.id;

  // 2. Parse JSON Data dari FormData
  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    return { error: 'Data form rusak atau tidak valid.' };
  }

  // 3. Validasi Zod
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
  } catch (e) {
    return { error: 'Format JSON tidak valid.' };
  }

  const validated = ContentTemplateSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error('Validation Error:', validated.error.flatten());
    return { error: 'Input tidak valid. Periksa kembali form anda.' };
  }

  const values = validated.data;

  // 4. Handle File Upload (Images)
  const imageFiles = formData.getAll('images');
  const uploadedAssets: AssetItem[] = [];

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

        uploadedAssets.push({
          url: `https://${process.env.ACCOUNT_CLOUDFLARE}.r2.dev/${fileName}`,
          type: 'image_preview',
        });
      } catch (e) {
        console.error('Upload Failed:', e);
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

  // 6. Insert ke Database
  try {
    await db.insert(contentTemplates).values({
      userId,
      title: values.title,
      description: values.description,
      typeContent: values.typeContent,
      linkTemplate: values.linkTemplate,
      linkDonwload: '', // Mapping: linkDownload (Form) -> linkDonwload (DB Typo)
      categoryTemplatesId: values.categoryTemplatesId,
      slug: values.slug, // New Field
      assetUrl: finalAssets, // Drizzle akan otomatis stringify JSONB
      tier: values.tier,
      platform: values.platform,
      statusContent: values.statusContent,
      number: nextNumber,
      viewCount: 0,
      downloadCount: 0,
    });

    revalidatePath('/dashboard/templates');
    return { success: 'Template berhasil dibuat!' };
  } catch (error) {
    console.error('DB Insert Error:', error);
    return { error: 'Gagal menyimpan data ke database.' };
  }
}
