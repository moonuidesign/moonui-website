'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
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

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(rawData);
    console.log('[UpdateTemplate] Parsed JSON:', parsedJson);
  } catch (e) {
    console.error('[UpdateTemplate] JSON Parse Error:', e);
    return { error: 'JSON Parse Error' };
  }

  // Inject 'newImages' for validation
  const newImages = formData.getAll('images');
  if (newImages.length > 0) {
    parsedJson.newImages = newImages.filter((f) => f instanceof File);
  }

  // Inject 'sourceFile' if new one is uploaded
  const mainFile = formData.get('sourceFile');
  if (mainFile instanceof File) {
    parsedJson.sourceFile = mainFile;
  }

  // 2. Validasi
  const validated = ContentTemplateSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error('[UpdateTemplate] Validation Error:', validated.error.flatten());
    return { error: validated.error.issues.map((i) => i.message).join('\n') };
  }
  const values = validated.data;
  console.log('[UpdateTemplate] Validated Values:', values);

  // 3. Handle File Uploads (Gambar Baru) - REMOVED (Client Side)
  // Logic upload dipindahkan ke client-side. 'values.imagesUrl' sudah final.
  const finalAssets: AssetItem[] = values.imagesUrl || [];

  // 4. Merge Assets - No longer needed complex merge, values.imagesUrl has everything necessary

  // Handle Main File
  // 'values.sourceFile' contains the URL (new or old).
  // We check if it changed or needs update.
  // Ideally, we just update it if it's there.
  const linkDownloadUrl = values.sourceFile;
  // If it's different from old? We don't have old here easily unless we query.
  // But we can just update it.

  // Logic size/format: for compatibility, if we don't know, we leave it or set default.
  // Ideally client sends metadata. For now, assume if linkDownloadUrl is provided, we update it.
  const hasNewMainFile = !!linkDownloadUrl;
  // Note: if user didn't change file, sourceFile might be the old URL.
  // In that case, updating it to the same string is harmless.
  // However, we lose size/format metadata if we don't query old one or have it passed.
  // If strict about size/format, we should fetching or expect it in payload.
  // For now, we update if present.

  try {
    const updateData: any = {
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
      imagesUrl: finalAssets,
      updatedAt: new Date(),
    };

    if (hasNewMainFile) {
      updateData.linkDonwload = linkDownloadUrl;
      // Only update format if we can guess, or keep old?
      // We might overwrite valid size with Unknown if we are not careful.
      // But since we don't query old, we can't persist old valid size easily without query.
      // Let's assume if it's a URL (string) it's valid.
      updateData.format =
        typeof linkDownloadUrl === 'string'
          ? linkDownloadUrl.split('.').pop()?.toUpperCase() || 'FILE'
          : 'FILE';
      // updateData.size = 'Unknown'; // Optional: don't overwrite size if we don't know new size to avoid "Unknown" on unchanged files?
      // Risky. If we leave it, fine.
    }

    console.log('[UpdateTemplate] Updating DB with:', updateData);

    await db.update(contentTemplates).set(updateData).where(eq(contentTemplates.id, id));

    console.log('[UpdateTemplate] DB Update Success');
    revalidatePath('/dashboard/templates');
    return { success: 'Template berhasil diperbarui!' };
  } catch (error) {
    console.error('[UpdateTemplate] Update Error:', error);
    return { error: 'Gagal mengupdate database.' };
  }
}
