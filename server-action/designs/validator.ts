import { z } from 'zod';

export const DESIGN_TIER_OPTIONS = ['free', 'pro'] as const;
export const DESIGN_STATUS_OPTIONS = [
  'draft',
  'published',
  'archived',
] as const;

export type DesignTierType = (typeof DESIGN_TIER_OPTIONS)[number];
export type DesignStatusType = (typeof DESIGN_STATUS_OPTIONS)[number];

export const ContentDesignSchema = z.object({
  title: z.string({ error: 'Judul wajib diisi' }).min(3, 'Minimal 3 karakter'),
  description: z.any().refine(
    (val) => {
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
    },
    'Deskripsi wajib diisi (minimal teks atau gambar)',
  ),
  categoryDesignsId: z.string({ error: 'Kategori wajib dipilih' }).min(1, 'Kategori wajib dipilih'),
  tier: z.enum(DESIGN_TIER_OPTIONS, { error: 'Tier wajib dipilih' }),
  statusContent: z.enum(DESIGN_STATUS_OPTIONS, {
    error: 'Status wajib dipilih',
  }),
  urlBuyOneTime: z.string().optional(),
  slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),
  imagesUrl: z.array(z.string()).optional(),
  newImages: z.array(z.instanceof(File)).optional(),
  sourceFile: z
    .union([
      z.instanceof(File),
      z.string().min(1, 'File sumber wajib diisi (silakan upload file baru)'),
    ])
    .refine((val) => val !== null && val !== undefined, {
      message: 'File sumber wajib diisi',
    }),
}).superRefine((data, ctx) => {
  const hasExisting = data.imagesUrl && data.imagesUrl.length > 0;
  const hasNew = data.newImages && data.newImages.length > 0;

  if (!hasExisting && !hasNew) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Minimal satu gambar/thumbnail wajib diisi',
      path: ['imagesUrl'],
    });
  }
});

export type ContentDesignFormValues = z.infer<typeof ContentDesignSchema>;
