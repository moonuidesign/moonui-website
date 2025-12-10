'use server';

import { db } from '@/libs/drizzle';
import { categoryComponents } from '@/db/migration/schema';
import { asc } from 'drizzle-orm';

// Definisikan tipe agar bisa digunakan di komponen client
export type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

export async function getCategoriesWithSubCategories(): Promise<Category[]> {
  try {
    const categories = await db
      .select({
        id: categoryComponents.id,
        name: categoryComponents.name,
        parentId: categoryComponents.parentId,
      })
      .from(categoryComponents)
      .orderBy(asc(categoryComponents.createdAt)); // Urutkan sesuai keinginan

    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
