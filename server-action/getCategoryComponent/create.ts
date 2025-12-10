'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { categoryComponents } from '@/db/migration/schema';
import { auth } from '@/libs/auth';
import { Category } from '.';
import {
  CategoryComponentFormValues,
  CategoryComponentSchema,
} from './validator';

// Tipe untuk nilai balik yang sukses
type SuccessResponse = {
  success: string;
  category: Category; // Kembalikan objek kategori yang baru dibuat
};

// Tipe untuk nilai balik yang gagal
type ErrorResponse = {
  error: string;
};

export async function createCategoryComponent(
  values: CategoryComponentFormValues,
): Promise<SuccessResponse | ErrorResponse> {
  // Perbarui tipe return
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized: Anda harus login untuk membuat kategori.' };
  }
  const userId = session.user.id;

  const validatedFields = CategoryComponentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Data yang dikirim tidak valid.' };
  }

  const { name, slug, parentId } = validatedFields.data;

  try {
    // --- PERUBAHAN PENTING DI SINI ---
    // Gunakan .returning() untuk mendapatkan data yang baru saja dimasukkan
    const newCategoryArray = await db
      .insert(categoryComponents)
      .values({
        name,
        slug,
        userId,
        parentId: parentId || null,
      })
      .returning({
        id: categoryComponents.id,
        name: categoryComponents.name,
        parentId: categoryComponents.parentId,
      });

    if (newCategoryArray.length === 0) {
      return { error: 'Gagal membuat kategori di database.' };
    }

    const newCategory = newCategoryArray[0];
    // ------------------------------------

    revalidatePath('/dashboard/components');

    // Kembalikan pesan sukses BERSAMA dengan data kategori baru
    return { success: 'Kategori berhasil ditambahkan!', category: newCategory };
  } catch (error) {
    console.error('DATABASE_INSERTION_ERROR', error);
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return { error: 'Slug sudah digunakan. Harap gunakan slug lain.' };
    }
    return { error: 'Gagal menyimpan kategori ke database.' };
  }
}
