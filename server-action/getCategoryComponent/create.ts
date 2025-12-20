'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import {
  categoryComponents,
  categoryDesigns,
  categoryTemplates,
  categoryGradients,
} from '@/db/migration';
import { auth } from '@/libs/auth';
import { Category } from '.';
import {
  CategoryComponentFormValues,
  CategoryComponentSchema,
  CategoryDesignFormValues,
  CategoryDesignSchema,
  CategoryTemplateFormValues,
  CategoryTemplateSchema,
  CategoryGradientFormValues,
  CategoryGradientSchema,
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
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized: Anda harus login untuk membuat kategori.' };
  }
  const userId = session.user.id;

  const validatedFields = CategoryComponentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Data yang dikirim tidak valid.' };
  }

  const { name, parentId } = validatedFields.data;

  try {
    const newCategoryArray = await db
      .insert(categoryComponents)
      .values({
        name,
        // slug, // Removed slug as it's not in the categoryComponents schema
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

    revalidatePath('/dashboard/components');

    return { success: 'Kategori berhasil ditambahkan!', category: newCategory };
  } catch (error) {
    console.error('DATABASE_INSERTION_ERROR', error);
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return { error: 'Slug sudah digunakan. Harap gunakan slug lain.' };
    }
    return { error: 'Gagal menyimpan kategori ke database.' };
  }
}

export async function createCategoryDesign(
  values: CategoryDesignFormValues,
): Promise<SuccessResponse | ErrorResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized: Anda harus login untuk membuat kategori.' };
  }
  const userId = session.user.id;
  const validatedFields = CategoryDesignSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Data yang dikirim tidak valid.' };
  }

  const { name, imageUrl, parentId } = validatedFields.data;

  try {
    const newCategoryArray = await db
      .insert(categoryDesigns)
      .values({
        name,

        imageUrl,
        userId,
        parentId: parentId || null,
      })
      .returning({
        id: categoryDesigns.id,
        name: categoryDesigns.name,
        parentId: categoryDesigns.parentId,
      });

    if (newCategoryArray.length === 0) {
      return { error: 'Gagal membuat kategori di database.' };
    }

    const newCategory = newCategoryArray[0];

    revalidatePath('/dashboard/designs');

    return { success: 'Kategori berhasil ditambahkan!', category: newCategory };
  } catch (error) {
    console.error('DATABASE_INSERTION_ERROR', error);
    return { error: 'Gagal menyimpan kategori ke database.' };
  }
}

export async function createCategoryTemplate(
  values: CategoryTemplateFormValues,
): Promise<SuccessResponse | ErrorResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized: Anda harus login untuk membuat kategori.' };
  }
  const userId = session.user.id;

  const validatedFields = CategoryTemplateSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Data yang dikirim tidak valid.' };
  }

  const { name, imageUrl, parentId } = validatedFields.data;

  try {
    const newCategoryArray = await db
      .insert(categoryTemplates)
      .values({
        name,

        imageUrl,
        userId,
        parentId: parentId || null,
      })
      .returning({
        id: categoryTemplates.id,
        name: categoryTemplates.name,
        parentId: categoryTemplates.parentId,
      });

    if (newCategoryArray.length === 0) {
      return { error: 'Gagal membuat kategori di database.' };
    }

    const newCategory = newCategoryArray[0];

    revalidatePath('/dashboard/templates');

    return { success: 'Kategori berhasil ditambahkan!', category: newCategory };
  } catch (error) {
    console.error('DATABASE_INSERTION_ERROR', error);
    return { error: 'Gagal menyimpan kategori ke database.' };
  }
}

export async function createCategoryGradient(
  values: CategoryGradientFormValues,
): Promise<SuccessResponse | ErrorResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized: Anda harus login untuk membuat kategori.' };
  }
  const userId = session.user.id;

  const validatedFields = CategoryGradientSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Data yang dikirim tidak valid.' };
  }

  const { name, imageUrl, parentId } = validatedFields.data;

  try {
    const newCategoryArray = await db
      .insert(categoryGradients)
      .values({
        name,
        imageUrl,
        userId,
        parentId: parentId || null,
      })
      .returning({
        id: categoryGradients.id,
        name: categoryGradients.name,
        parentId: categoryGradients.parentId,
      });

    if (newCategoryArray.length === 0) {
      return { error: 'Gagal membuat kategori di database.' };
    }

    const newCategory = newCategoryArray[0];

    revalidatePath('/dashboard/gradients');

    return { success: 'Kategori berhasil ditambahkan!', category: newCategory };
  } catch (error) {
    console.error('DATABASE_INSERTION_ERROR', error);
    return { error: 'Gagal menyimpan kategori ke database.' };
  }
}
