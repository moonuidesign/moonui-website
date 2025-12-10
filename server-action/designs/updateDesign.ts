'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration/schema';
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
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string')
    return { error: 'Data tidak valid' };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawData);
  } catch (e) {
    return { error: 'JSON Parse Error' };
  }

  const validated = ContentDesignSchema.safeParse(parsedJson);
  if (!validated.success) {
    return { error: 'Validasi form gagal.' };
  }
  const values = validated.data;

  // Handle Image Update
  const imageFile = formData.get('image');
  let imageUrl: string | undefined = undefined;

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
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

      imageUrl = `https://${process.env.ACCOUNT_CLOUDFLARE}.r2.dev/${fileName}`;
    } catch (e) {
      return { error: 'Gagal upload gambar baru.' };
    }
  }

  try {
    await db
      .update(contentDesigns)
      .set({
        title: values.title,
        slug: values.slug,
        description: values.description,
        categoryDesignsId: values.categoryDesignsId,
        tier: values.tier,
        statusContent: values.statusContent,
        updatedAt: new Date(),
        ...(imageUrl ? { imageUrl: imageUrl } : {}),
      })
      .where(eq(contentDesigns.id, id));

    revalidatePath('/dashboard/designs');
    return { success: 'Design berhasil diperbarui!' };
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Gagal mengupdate database.' };
  }
}