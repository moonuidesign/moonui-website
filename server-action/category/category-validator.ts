import { z } from 'zod';

export const CATEGORY_TYPES = [
  'components',
  'design',
  'templates',
  'gradients',
] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const BaseCategorySchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kategori minimal 3 karakter')
    .max(100, 'Nama kategori maksimal 100 karakter'),
  imageUrl: z.string().optional().or(z.literal('')),
  // Kita izinkan string kosong atau undefined, nanti di action/db bisa diubah jadi null
  parentId: z.string().optional().or(z.literal('')),
});

// Schemas for categories
export const CategorySchema = BaseCategorySchema;

// Specific schemas for each category type (for type inference)
export const ComponentCategorySchema = CategorySchema;
export const DesignCategorySchema = CategorySchema;
export const TemplateCategorySchema = CategorySchema;
export const GradientCategorySchema = CategorySchema;

// Form values types
export type ComponentCategoryFormValues = z.infer<
  typeof ComponentCategorySchema
>;
export type DesignCategoryFormValues = z.infer<typeof DesignCategorySchema>;
export type TemplateCategoryFormValues = z.infer<typeof TemplateCategorySchema>;
export type GradientCategoryFormValues = z.infer<typeof GradientCategorySchema>;

export type CategoryFormValues =
  | ComponentCategoryFormValues
  | DesignCategoryFormValues
  | TemplateCategoryFormValues
  | GradientCategoryFormValues;
