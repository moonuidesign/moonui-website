import { z } from 'zod';

// --- CONSTANTS (Single Source of Truth) ---
export const TEMPLATE_PLATFORM_OPTIONS = [
  'web',
  'ios',
  'android',
  'cross_platform',
  'desktop',
  'all',
] as const;
export const TEMPLATE_TIER_OPTIONS = ['free', 'pro_plus'] as const;
export const TEMPLATE_STATUS_OPTIONS = [
  'draft',
  'published',
  'archived',
] as const;

// Helper Types dari Constants
export type TemplatePlatformType = (typeof TEMPLATE_PLATFORM_OPTIONS)[number];
export type TemplateTierType = (typeof TEMPLATE_TIER_OPTIONS)[number];
export type TemplateStatusType = (typeof TEMPLATE_STATUS_OPTIONS)[number];

// --- ZOD SCHEMAS ---

// Schema untuk objek di dalam JSONB 'assetUrl'
const AssetObjectSchema = z.object({
  url: z.string().url('URL tidak valid'),
  type: z.string().min(1, 'Tipe asset wajib diisi'),
});

export const ContentTemplateSchema = z.object({
  title: z.string({ error: 'Judul wajib diisi' }).min(3, 'Minimal 3 karakter'),
  description: z.string().optional(),
  typeContent: z.string().min(1, 'Tipe konten wajib diisi'),

  linkTemplate: z.string().optional().or(z.literal('')), // Boleh kosong stringnya

  categoryTemplatesId: z.string({ error: 'Kategori wajib dipilih' }).min(1),

  tier: z.enum(TEMPLATE_TIER_OPTIONS, { error: 'Tier wajib dipilih' }),
  platform: z.enum(TEMPLATE_PLATFORM_OPTIONS, {
    error: 'Platform wajib dipilih',
  }),
  statusContent: z.enum(TEMPLATE_STATUS_OPTIONS, {
    error: 'Status wajib dipilih',
  }),

  // Slug / Tags (Label)
  slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),

  // Array untuk URL manual (bukan hasil upload file form ini)
  assetUrls: z.array(AssetObjectSchema).optional(),
});

// Infer Tipe TypeScript dari Schema
export type ContentTemplateFormValues = z.infer<typeof ContentTemplateSchema>;

// Tipe untuk Asset yang disimpan di DB (untuk type casting yang aman)
export type AssetItem = { url: string; type: string };
