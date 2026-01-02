'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration';
import { auth } from '@/libs/auth';
import { AssetItem, ContentTemplateSchema } from './validator';
import { asc } from 'drizzle-orm';

// Definisikan tipe return yang spesifik (Strict)
type ActionResponse = { success: string } | { error: string };

export async function createContentTemplate(formData: FormData): Promise<ActionResponse> {
  console.log('[CreateTemplate] Started');
  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) {
    console.error('[CreateTemplate] Unauthorized');
    return { error: 'Unauthorized: Please login.' };
  }
  const userId = session.user.id;
  console.log('[CreateTemplate] UserId:', userId);

  // 2. Parse JSON Data dari FormData
  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') {
    console.error('[CreateTemplate] Invalid Data');
    return { error: 'Form data corrupt or invalid.' };
  }

  // 3. Validasi Zod
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(rawData);
    console.log('[CreateTemplate] Parsed JSON:', parsedJson);
  } catch (e) {
    console.error('[CreateTemplate] JSON Parse Error:', e);
    return { error: 'Invalid JSON format.' };
  }

  // Inject 'newImages' from formData for validation
  const newImages = formData.getAll('images');
  if (newImages.length > 0) {
    parsedJson.newImages = newImages.filter((f) => f instanceof File);
  }
  // Inject 'sourceFile' if needed (though validator for sourceFile checks File vs String)
  const sourceFile = formData.get('sourceFile');
  if (sourceFile instanceof File) {
    parsedJson.sourceFile = sourceFile;
  }

  const validated = ContentTemplateSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error('[CreateTemplate] Validation Error:', validated.error.flatten());
    const errorDetails = validated.error.issues.map((i) => i.message).join('\n');
    return { error: errorDetails || 'Invalid input. Please check your form.' };
  }

  const values = validated.data;
  console.log('[CreateTemplate] Validated Values:', values);

  // 4. Handle File Upload (Images)
  // Logic upload dipindahkan ke Client-Side untuk menghindari limit Vercel (4.5MB).
  // Data 'imagesUrl' di dalam 'values' sekarang sudah berisi URL hasil upload client.
  const finalAssets: AssetItem[] = values.imagesUrl || [];

  // Handle Main File
  // Sama, 'sourceFile' di values/payload sudah string URL/Key.
  // Kita pastikan linkDownloadUrl mengambil dari situ.
  const linkDownloadUrl = typeof values.sourceFile === 'string' ? values.sourceFile : '';

  // NOTE: Ukuran/Format file dikirim dari client (values.size & values.format)
  // Ini hasil kalkulasi di FE sebelum upload.
  const fileSize = values.size || 'Unknown';
  const fileFormat =
    values.format ||
    (linkDownloadUrl ? linkDownloadUrl.split('.').pop()?.toUpperCase() : 'FILE') ||
    'FILE';

  // 6. Insert ke Database
  try {
    // Gap-Filling Number Logic
    const existingNumbers = await db
      .select({ number: contentTemplates.number })
      .from(contentTemplates)
      .orderBy(asc(contentTemplates.number));

    let nextNumber = 1;
    for (const item of existingNumbers) {
      if (item.number === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    const insertData = {
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description,
      typeContent: values.typeContent,
      linkTemplate: values.linkTemplate,
      categoryTemplatesId: values.categoryTemplatesId,
      tier: values.tier,
      statusContent: values.statusContent,
      urlBuyOneTime: values.urlBuyOneTime,
      slug: values.slug,
      linkDonwload: linkDownloadUrl,
      userId: session.user.id,
      assetUrl: finalAssets,
      format: fileFormat,
      size: fileSize,
      createdAt: new Date(),
      updatedAt: new Date(),
      copyCount: 0,
      downloadCount: 0,

      imagesUrl: finalAssets, // Simpan juga di kolom imagesUrl jika schema DB mendukung
      number: nextNumber,
    };
    console.log('[CreateTemplate] Inserting DB:', insertData);

    await db.insert(contentTemplates).values(insertData);

    console.log('[CreateTemplate] DB Insert Success');
    revalidatePath('/dashboard/templates');
    return { success: 'Template created successfully!' };
  } catch (error) {
    console.error('[CreateTemplate] DB Insert Error:', error);
    return { error: 'Failed to save data to database.' };
  }
}
