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
  description: z
    .any()
    .refine(
      (val) => val && val.content && val.content.length > 0,
      'Deskripsi wajib diisi',
    ),
  categoryDesignsId: z.string({ error: 'Kategori wajib dipilih' }).min(1),
  tier: z.enum(DESIGN_TIER_OPTIONS, { error: 'Tier wajib dipilih' }),
  statusContent: z.enum(DESIGN_STATUS_OPTIONS, {
    error: 'Status wajib dipilih',
  }),
  urlBuyOneTime: z.string().optional(),
  slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),
  imagesUrl: z.array(z.string()).optional(),
});

export type ContentDesignFormValues = z.infer<typeof ContentDesignSchema>;
