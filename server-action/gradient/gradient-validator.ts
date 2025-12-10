import { z } from 'zod';

// --- CONSTANTS ---
export const GRADIENT_TYPE_OPTIONS = ['linear', 'radial', 'conic'] as const;
export const GRADIENT_TIER_OPTIONS = ['free', 'pro'] as const;

// --- TYPES ---
export type GradientType = (typeof GRADIENT_TYPE_OPTIONS)[number];
export type GradientTierType = (typeof GRADIENT_TIER_OPTIONS)[number];

// --- SCHEMAS ---
const HexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
  message: 'Invalid Hex',
});

const ColorItemSchema = z.object({
  value: HexColorSchema,
});

export const ContentGradientSchema = z.object({
  name: z.string().min(3, 'Min 3 characters'),

  colors: z.array(ColorItemSchema).min(2, 'Min 2 colors'),

  // PENTING: Jangan gunakan .optional() jika field ini wajib di UI
  typeGradient: z.enum(GRADIENT_TYPE_OPTIONS),

  categoryGradientsId: z.string().min(1, 'Category required'),

  // Slug / Tags (Label)
  slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),

  tier: z.enum(GRADIENT_TIER_OPTIONS),
});

export type ContentGradientFormValues = z.infer<typeof ContentGradientSchema>;
