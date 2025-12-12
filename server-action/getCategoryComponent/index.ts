'use server';

import { db } from '@/libs/drizzle';
import {
  categoryComponents,
  categoryDesigns,
  categoryTemplates,
  categoryGradients,
} from '@/db/migration';
import { asc } from 'drizzle-orm';

// Definisikan tipe agar bisa digunakan di komponen client
export type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

export async function getCategoryComponents(): Promise<Category[]> {
  try {
    const categories = await db
      .select({
        id: categoryComponents.id,
        name: categoryComponents.name,
        parentId: categoryComponents.parentId,
      })
      .from(categoryComponents)
      .orderBy(asc(categoryComponents.createdAt));

    return categories;
  } catch (error) {
    console.error('Failed to fetch component categories:', error);
    return [];
  }
}

export async function getCategoryDesigns(): Promise<Category[]> {
  try {
    const categories = await db
      .select({
        id: categoryDesigns.id,
        name: categoryDesigns.name,
        parentId: categoryDesigns.parentId,
      })
      .from(categoryDesigns)
      .orderBy(asc(categoryDesigns.createdAt));

    return categories;
  } catch (error) {
    console.error('Failed to fetch design categories:', error);
    return [];
  }
}

export async function getCategoryTemplates(): Promise<Category[]> {
  try {
    const categories = await db
      .select({
        id: categoryTemplates.id,
        name: categoryTemplates.name,
        parentId: categoryTemplates.parentId,
      })
      .from(categoryTemplates)
      .orderBy(asc(categoryTemplates.createdAt));

    return categories;
  } catch (error) {
    console.error('Failed to fetch template categories:', error);
    return [];
  }
}

export async function getCategoryGradients(): Promise<Category[]> {
  try {
    const categories = await db
      .select({
        id: categoryGradients.id,
        name: categoryGradients.name,
        parentId: categoryGradients.parentId,
      })
      .from(categoryGradients)
      .orderBy(asc(categoryGradients.createdAt));

    return categories;
  } catch (error) {
    console.error('Failed to fetch gradient categories:', error);
    return [];
  }
}

// Alias for backward compatibility if needed, but better to update usages.
export const getCategoriesWithSubCategories = getCategoryComponents;
