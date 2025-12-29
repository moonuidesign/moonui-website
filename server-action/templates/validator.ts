import { z } from 'zod';

export const TEMPLATE_TIER_OPTIONS = ['free', 'pro'] as const;
export const TEMPLATE_STATUS_OPTIONS = ['draft', 'published', 'archived'] as const;

export type TemplateTierType = (typeof TEMPLATE_TIER_OPTIONS)[number];
export type TemplateStatusType = (typeof TEMPLATE_STATUS_OPTIONS)[number];

// --- ZOD SCHEMAS ---

// Schema untuk objek di dalam JSONB 'assetUrl'
const AssetObjectSchema = z.object({
  url: z.string().url('URL tidak valid'),
});

export const ContentTemplateSchema = z
  .object({
    title: z.string({ error: 'Judul wajib diisi' }).min(3, 'Minimal 3 karakter'),
    description: z.any().refine((val) => {
      if (!val) return false;
      // 1. Handle String (HTML)
      if (typeof val === 'string') {
        const text = val.replace(/<[^>]*>/g, '').trim();
        return text.length > 0 || /<img|<iframe|video/i.test(val);
      }
      // 2. Handle Object (TipTap JSON)
      if (typeof val === 'object' && val.content && Array.isArray(val.content)) {
        return val.content.length > 0;
      }
      return false;
    }, 'Deskripsi wajib diisi'),
    typeContent: z.string().min(1, 'Tipe konten wajib diisi'),
    linkTemplate: z
      .string({ error: 'Preview / Demo Link wajib diisi' })
      .min(1, 'Preview / Demo Link wajib diisi'),
    categoryTemplatesId: z
      .string({ error: 'Kategori wajib dipilih' })
      .min(1, 'Kategori wajib dipilih'),
    tier: z.enum(TEMPLATE_TIER_OPTIONS, { error: 'Tier wajib dipilih' }),
    statusContent: z.enum(TEMPLATE_STATUS_OPTIONS, {
      error: 'Status wajib dipilih',
    }),
    urlBuyOneTime: z.string().optional(),
    sourceFile: z
      .union([
        z.instanceof(File),
        z.string().min(1, 'File sumber wajib diisi (silakan upload file baru)'),
      ])
      .refine((val) => val !== null && val !== undefined, {
        message: 'File sumber wajib diisi',
      }),
    // Slug / Tags (Label)
    slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),

    // Array untuk URL manual (bukan hasil upload file form ini)
    imagesUrl: z.array(AssetObjectSchema).optional(),
    // Field untuk menampung File baru yang diupload
    newImages: z.array(z.instanceof(File)).optional(),
  })
  .superRefine((data, ctx) => {
    const hasExisting = data.imagesUrl && data.imagesUrl.length > 0;
    const hasNew = data.newImages && data.newImages.length > 0;

    if (!hasExisting && !hasNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimal satu gambar preview wajib diisi (thumbnail)',
        path: ['imagesUrl'], // Show error on imagesUrl field
      });
    }
  });

// Infer Tipe TypeScript dari Schema
export type ContentTemplateFormValues = z.infer<typeof ContentTemplateSchema>;

// Tipe untuk Asset yang disimpan di DB (untuk type casting yang aman)
export type AssetItem = { url: string };
