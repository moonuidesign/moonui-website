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
  typeGradient: z.enum(GRADIENT_TYPE_OPTIONS),
  categoryGradientsId: z.string().min(1, 'Category required'),
  description: z.any().refine(
    (val) => {
      if (!val) return false;
      if (typeof val === 'string') {
        const text = val.replace(/<[^>]*>/g, '').trim();
        return text.length > 0 || /<img|<iframe|video/i.test(val);
      }
      if (typeof val === 'object' && val.content && Array.isArray(val.content)) {
        return val.content.length > 0;
      }
      return false;
    },
    'Deskripsi wajib diisi',
  ),
  slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),
  image: z
    .union([
      z.string().min(1, 'Thumbnail wajib diupload'),
      z.instanceof(File, { message: 'Thumbnail wajib diupload' }),
    ])
    .refine((val) => val !== null && val !== undefined, 'Thumbnail wajib diupload'),
  urlBuyOneTime: z.string().optional(),
  tier: z.enum(GRADIENT_TIER_OPTIONS),
});

export type ContentGradientFormValues = z.infer<typeof ContentGradientSchema>;
