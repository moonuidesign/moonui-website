'use server';

import { contentComponents } from '@/db/migration';
import { db } from '@/libs/drizzle';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function incrementcopycount(componentid: string) {
  if (!componentid) {
    return { error: 'id komponen tidak valid.' };
  }

  try {
    await db
      .update(contentComponents)
      .set({
        // menggunakan sql`...` dari drizzle untuk penambahan atomik
        copyCount: sql`${contentComponents.copyCount} + 1`,
      })
      .where(eq(contentComponents.id, componentid));

    // revalidasi halaman tempat card ditampilkan (ganti dengan path anda)
    revalidatePath('/components');

    return { success: true };
  } catch (error) {
    console.error('database_update_error', error);
    return { error: 'gagal memperbarui jumlah salinan.' };
  }
}
