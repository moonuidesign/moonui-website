'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration';
import { auth } from '@/libs/auth';
import { auth } from '@/libs/auth';
import { ContentDesignSchema } from './validator';

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

  // Handle Multiple Image Upload (Managed by Client)
  // Server-side, `imagesUrl` in parsedJson should contain both existing and new keys.
  // We use `uploadedImageUrls` to map to the DB structure if needed, but here `imagesUrl` is just string[].
  // But wait, schema says imagesUrl: string[].
  // DB scheme: imagesUrl: Type which? designs table -> imagesUrl text[] ?? or json?
  // Checking migration or inference from entity: `imagesUrl: string[]`.
  // So we just take values.imagesUrl.

  const finalImageUrls = values.imagesUrl || [];

  // Handle Source File (Client Uploaded)
  const linkDownload = typeof values.sourceFile === 'string' ? values.sourceFile : '';

  // Metadata from Client
  const fileSize = values.size || 'Unknown';
  const fileFormat =
    values.format ||
    (linkDownload ? linkDownload.split('.').pop()?.toUpperCase() || 'FILE' : 'FILE');

  try {
    const insertData = {
      id: crypto.randomUUID(),
      userId,
      title: values.title,
      slug: values.slug, // JSONB
      description: values.description,
      imagesUrl: finalImageUrls, // Store as string array (Postgres text[] or json)
      linkDownload: linkDownload,
      urlBuyOneTime: values.urlBuyOneTime,
      size: fileSize,
      format: fileFormat,
      categoryDesignsId: values.categoryDesignsId,
      tier: values.tier,
      statusContent: values.statusContent,
      createdAt: new Date(),
      updatedAt: new Date(),
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
