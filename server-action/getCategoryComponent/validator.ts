import { z } from 'zod';

// Regex yang sama untuk memastikan konsistensi slug
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CategoryComponentSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Nama kategori minimal harus 3 karakter.' })
    .max(100, { message: 'Nama kategori maksimal 100 karakter.' }),
  slug: z.string().regex(slugRegex, { message: 'Format slug tidak valid.' }),

  // parentId adalah opsional. Bisa string kosong atau UUID.
  // Kita gunakan preprocess untuk mengubah string kosong menjadi undefined,
  // sehingga validasi opsional bekerja dengan benar.
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
