import { z } from 'zod';

export const CategoryComponentSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Nama kategori minimal harus 3 karakter.' })
    .max(100, { message: 'Nama kategori maksimal 100 karakter.' }),
  imageUrl: z.string().optional(),
  parentId: z
    .preprocess(
      (arg) => (arg === '' ? undefined : arg),
      z.string().uuid({ message: 'ID Parent tidak valid.' }).optional(),
    )
    .nullable(), // Izinkan juga nilai null
});

export type CategoryComponentFormValues = z.infer<
  typeof CategoryComponentSchema
>;

// Schema for Design Categories (no slug)
export const CategoryDesignSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Nama kategori minimal harus 3 karakter.' })
    .max(100, { message: 'Nama kategori maksimal 100 karakter.' }),

  imageUrl: z.string().optional(),
  parentId: z
    .preprocess(
      (arg) => (arg === '' ? undefined : arg),
      z.string().uuid({ message: 'ID Parent tidak valid.' }).optional(),
    )
    .nullable(),
});

export type CategoryDesignFormValues = z.infer<typeof CategoryDesignSchema>;

// Schema for Template Categories (no slug)
export const CategoryTemplateSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Nama kategori minimal harus 3 karakter.' })
    .max(100, { message: 'Nama kategori maksimal 100 karakter.' }),

  imageUrl: z.string().optional(),
  parentId: z
    .preprocess(
      (arg) => (arg === '' ? undefined : arg),
      z.string().uuid({ message: 'ID Parent tidak valid.' }).optional(),
    )
    .nullable(),
});

export type CategoryTemplateFormValues = z.infer<typeof CategoryTemplateSchema>;

// Schema for Gradient Categories (no slug, no description)
export const CategoryGradientSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Nama kategori minimal harus 3 karakter.' })
    .max(100, { message: 'Nama kategori maksimal 100 karakter.' }),
  imageUrl: z.string().optional(),
  parentId: z
    .preprocess(
      (arg) => (arg === '' ? undefined : arg),
      z.string().uuid({ message: 'ID Parent tidak valid.' }).optional(),
    )
    .nullable(),
});

export type CategoryGradientFormValues = z.infer<typeof CategoryGradientSchema>;
