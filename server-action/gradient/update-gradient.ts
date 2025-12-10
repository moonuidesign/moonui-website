'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentGradients } from '@/db/migration/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ContentGradientSchema } from './gradient-validator';

type ActionResponse = { success: string } | { error: string };

export async function updateContentGradient(
  id: string,
  formData: FormData,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  const rawData = formData.get('data');
  if (!rawData || typeof rawData !== 'string') return { error: 'Invalid Data' };

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawData);
  } catch (e) {
    return { error: 'JSON Parse Error' };
  }

  const validated = ContentGradientSchema.safeParse(parsedJson);
  if (!validated.success) return { error: 'Validasi gagal.' };
  const values = validated.data;

  // Handle Image Update (Optional)
  const imageFile = formData.get('image');
  let imageUrl = undefined;

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `gradients/${Date.now()}-${crypto.randomUUID()}.${ext}`;
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
      return { error: 'Gagal upload thumbnail baru.' };
    }
  }

  try {
    await db
      .update(contentGradients)
      .set({
        name: values.name,
        colors: values.colors,
        slug: values.slug, // New Field
        typeGradient: values.typeGradient,
        categoryGradientsId: values.categoryGradientsId,
        tier: values.tier,
        updatedAt: new Date(),
        ...(imageUrl ? { image: imageUrl } : {}),
      })
      .where(eq(contentGradients.id, id));

    revalidatePath('/dashboard/gradients');
    return { success: 'Gradient berhasil diperbarui!' };
  } catch (error) {
    return { error: 'Gagal update database.' };
  }
}
