'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration';
import { auth } from '@/libs/auth';
import { AssetItem, ContentTemplateSchema } from './validator';

// Definisikan tipe return yang spesifik (Strict)
type ActionResponse = { success: string } | { error: string };

export async function createContentTemplate(formData: FormData): Promise<ActionResponse> {
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
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(rawData);
    console.log('[CreateTemplate] Parsed JSON:', parsedJson);
  } catch (e) {
    console.error('[CreateTemplate] JSON Parse Error:', e);
    return { error: 'Format JSON tidak valid.' };
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
    return { error: errorDetails || 'Input tidak valid. Periksa kembali form anda.' };
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

  // NOTE: Ukuran/Format file idealnya dikirim juga dari client jika diperlukan untuk DB,
  // tapi untuk sekarang kita bisa default atau biarkan kosong/minimal.
  // Jika ingin data akurat, client harus kirim metadata size/format di payload JSON.
  // Untuk compatibility, kita set default jika kosong.
  const fileSize = 'Unknown';
  const fileFormat = linkDownloadUrl
    ? linkDownloadUrl.split('.').pop()?.toUpperCase() || 'FILE'
    : 'FILE';

  // 6. Insert ke Database
  try {
    const insertData = {
      userId,
      title: values.title,
      description: values.description,
      typeContent: values.typeContent,
      urlPreview: values.linkTemplate,
      linkDonwload: linkDownloadUrl,
      size: fileSize,
      format: fileFormat,
      categoryTemplatesId: values.categoryTemplatesId,
      slug: values.slug,
      assetUrl: finalAssets,
      tier: values.tier,
      statusContent: values.statusContent,
      urlBuyOneTime: values.urlBuyOneTime,
      imagesUrl: finalAssets,
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
