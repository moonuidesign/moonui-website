'use server';

import { categoryComponents } from '@/db/migration/tables/category-components';
import { categoryDesigns } from '@/db/migration/tables/category-designs';
import { categoryGradients } from '@/db/migration/tables/category-gradients';
import { categoryTemplates } from '@/db/migration/tables/category-templates';
import {
  ComponentCategorySchema,
  DesignCategorySchema,
  TemplateCategorySchema,
  GradientCategorySchema,
  CategoryType,
} from './category-validator';
import { revalidatePath } from 'next/cache';
import { auth } from '@/libs/auth';
import { ZodError } from 'zod';
import { SQL, eq } from 'drizzle-orm';
import { db } from '@/libs/drizzle';

// S3 / R2 Imports
import { r2Client } from '@/libs/getR2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// --- Helpers: Table Selection ---
function getCategoryTable(categoryType: CategoryType) {
  switch (categoryType) {
    case 'components':
      return categoryComponents;
    case 'design':
      return categoryDesigns;
    case 'templates':
      return categoryTemplates;
    case 'gradients':
      return categoryGradients;
    default:
      throw new Error('Invalid category type');
  }
}

// --- Helpers: Schema Selection ---
function getCategorySchema(categoryType: CategoryType) {
  switch (categoryType) {
    case 'components':
      return ComponentCategorySchema;
    case 'design':
      return DesignCategorySchema;
    case 'templates':
      return TemplateCategorySchema;
    case 'gradients':
      return GradientCategorySchema;
    default:
      throw new Error('Invalid category type');
  }
}

// --- Helpers: Upload Logic (DRY) ---
async function uploadImageToS3(imageFile: File): Promise<string> {
  const ext = imageFile.name.split('.').pop();
  const fileName = `categories/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await imageFile.arrayBuffer());

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: imageFile.type,
    }),
  );

  // Return Full URL jika domain ada, jika tidak return fileName (Key)
  if (process.env.R2_PUBLIC_DOMAIN) {
    return `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
  }
  return fileName;
}

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any;
}

// ======================================================================
// CREATE CATEGORY
// ======================================================================
export async function createCategory(
  categoryType: CategoryType,
  formData: FormData,
): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const rawData = JSON.parse(formData.get('data') as string);
    const schema = getCategorySchema(categoryType);
    const validatedData = schema.parse(rawData);

    // 1. Handle Image Upload
    let imageUrl = validatedData.imageUrl;
    const imageFile = formData.get('image');

    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadImageToS3(imageFile);
    }

    // 2. Prepare Payload
    const payload = {
      ...validatedData,
      imageUrl: imageUrl,
      parentId: validatedData.parentId === '' ? null : validatedData.parentId,
      userId: session.user.id,
    };

    // 3. Insert to DB
    const categoryTable = getCategoryTable(categoryType);
    const newCategory = await db.insert(categoryTable).values(payload).returning();

    revalidatePath(`/dashboard/content/${categoryType}/category`);

    return {
      success: true,
      message: 'Category created successfully',
      data: newCategory[0],
    };
  } catch (e) {
    if (e instanceof ZodError) {
      return { success: false, error: 'Validation failed', errors: e.issues };
    }
    console.error(`Error creating category for ${categoryType}:`, e);
    return {
      success: false,
      error: (e as Error).message || 'Failed to create category',
    };
  }
}

// ======================================================================
// UPDATE CATEGORY
// ======================================================================
export async function updateCategory(
  categoryType: CategoryType,
  id: string,
  formData: FormData,
): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const rawData = JSON.parse(formData.get('data') as string);
    const schema = getCategorySchema(categoryType);
    const validatedData = schema.parse(rawData);

    // 1. Handle Image Upload
    let imageUrl = validatedData.imageUrl;
    const imageFile = formData.get('image');

    // Jika ada file baru, upload. Jika tidak, imageUrl tetap (dari validatedData)
    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadImageToS3(imageFile);
    }

    // 2. Prepare Payload
    const payload = {
      ...validatedData,
      imageUrl: imageUrl,
      parentId: validatedData.parentId === '' ? null : validatedData.parentId,
      updatedAt: new Date(),
    };

    // 3. Update DB
    const categoryTable = getCategoryTable(categoryType);
    const updatedCategory = await db
      .update(categoryTable)
      .set(payload)
      .where(eq(categoryTable.id, id))
      .returning();

    if (!updatedCategory.length) {
      return { success: false, error: 'Category not found or not authorized' };
    }

    revalidatePath(`/dashboard/content/${categoryType}/category`);

    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory[0],
    };
  } catch (e) {
    if (e instanceof ZodError) {
      return { success: false, error: 'Validation failed', errors: e.issues };
    }
    console.error(`Error updating category for ${categoryType}:`, e);
    return {
      success: false,
      error: (e as Error).message || 'Failed to update category',
    };
  }
}

// ======================================================================
// LIST CATEGORIES (Helper)
// ======================================================================
export async function listCategories(
  categoryType: CategoryType,
  parentId: string | null = null,
): Promise<ActionResponse<any[]>> {
  try {
    const categoryTable = getCategoryTable(categoryType);
    let whereClause: SQL | undefined;

    if (parentId === null) {
      whereClause = eq(categoryTable.parentId, null as unknown as string);
    } else if (parentId === '') {
      whereClause = undefined;
    } else {
      whereClause = eq(categoryTable.parentId, parentId);
    }

    const categories = await db.select().from(categoryTable).where(whereClause);
    return { success: true, data: categories };
  } catch (e) {
    console.error(`Error listing categories for ${categoryType}:`, e);
    return {
      success: false,
      error: (e as Error).message || 'Failed to fetch categories',
    };
  }
}

export async function getCategoryById(
  categoryType: CategoryType,
  id: string,
): Promise<ActionResponse<any>> {
  try {
    const categoryTable = getCategoryTable(categoryType);

    // Query langsung berdasarkan ID
    const result = await db.select().from(categoryTable).where(eq(categoryTable.id, id));

    // Cek apakah data ditemukan
    if (result.length === 0) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    // Return data index ke-0 (karena kita mencari by unique ID, hasilnya pasti 1)
    return {
      success: true,
      data: result[0],
    };
  } catch (e) {
    console.error(`Error fetching category by id for ${categoryType}:`, e);
    return {
      success: false,
      error: (e as Error).message || 'Failed to fetch category',
    };
  }
}

// ======================================================================
// DELETE CATEGORY
// ======================================================================
export async function deleteCategory(
  categoryType: CategoryType,
  id: string,
): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const categoryTable = getCategoryTable(categoryType);
    await db.delete(categoryTable).where(eq(categoryTable.id, id));
    revalidatePath(`/dashboard/content/${categoryType}/category`);
    return { success: true, message: 'Category deleted successfully' };
  } catch (e) {
    console.error(`Error deleting category for ${categoryType}:`, e);
    if ((e as any).code === '23503') {
      return {
        success: false,
        error: 'Tidak dapat menghapus kategori ini karena masih digunakan oleh item lain.',
      };
    }
    return {
      success: false,
      error: (e as Error).message || 'Failed to delete category',
    };
  }
}
