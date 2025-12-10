import { z } from 'zod';

export const DESIGN_TIER_OPTIONS = ['free', 'pro_plus'] as const;
export const DESIGN_STATUS_OPTIONS = ['draft', 'published', 'archived'] as const;

export type DesignTierType = (typeof DESIGN_TIER_OPTIONS)[number];
export type DesignStatusType = (typeof DESIGN_STATUS_OPTIONS)[number];

export const ContentDesignSchema = z.object({
  title: z.string({ error: 'Judul wajib diisi' }).min(3, 'Minimal 3 karakter'),
  description: z.string().optional(),
  
  categoryDesignsId: z.string({ error: 'Kategori wajib dipilih' }).min(1),

  tier: z.enum(DESIGN_TIER_OPTIONS, { error: 'Tier wajib dipilih' }),
  statusContent: z.enum(DESIGN_STATUS_OPTIONS, {
    error: 'Status wajib dipilih',
  }),

  slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),
  
  imageUrl: z.string().optional(),
});

export type ContentDesignFormValues = z.infer<typeof ContentDesignSchema>;