import { z } from 'zod';

const figmaRegex =
  /data-metadata="(&lt;|<)!--\(figmeta\)|data-buffer="(&lt;|<)!--\(figma\)/i;
const framerRegex = /data-framer-pasteboard/i;
const basicHtmlTagRegex = /<[a-z][\s\S]*>/i;
export const TIER_OPTIONS = ['free', 'pro'] as const;
export const STATUS_OPTIONS = ['draft', 'published', 'archived'] as const;
export const TYPE_OPTIONS = ['figma', 'framer'] as const;

// 2. Buat Zod Schema
export const ContentComponentSchema = z
  .object({
    title: z
      .string({ error: 'Judul wajib diisi' })
      .min(3, 'Minimal 3 karakter')
      .max(100),
    type: z.enum(TYPE_OPTIONS),
    tier: z.enum(TIER_OPTIONS, { error: 'Pilih Tier' }),

    statusContent: z.enum(STATUS_OPTIONS, {
      error: 'Pilih Status',
    }),
    description: z
      .any()
      .refine(
        (val) => val && val.content && val.content.length > 0,
        'Deskripsi wajib diisi',
      ),
    urlBuyOneTime: z.string().optional(),
    slug: z.array(z.string()).min(1, 'Minimal satu tag/label wajib diisi'),

    copyComponentTextHTML: z.string().min(1, 'Data Clipboard kosong'),
    copyComponentTextPlain: z.string().min(1, 'Data Teks kosong'),
    rawHtmlInput: z.string().min(10, 'HTML input wajib diisi'),
    categoryComponentsId: z.string({ error: 'Pilih Kategori' }).min(1),
    subCategoryComponentsId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // ---------------------------------------------------------
    // A. VALIDASI FORMAT CLIPBOARD (FIGMA / FRAMER)
    // ---------------------------------------------------------
    if (data.type === 'figma' && !figmaRegex.test(data.copyComponentTextHTML)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Data yang di-paste tidak terdeteksi sebagai format Figma yang valid.',
        path: ['copyComponentTextHTML'],
      });
    }

    if (
      data.type === 'framer' &&
      !framerRegex.test(data.copyComponentTextHTML)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Data yang di-paste tidak terdeteksi sebagai format Framer yang valid.',
        path: ['copyComponentTextHTML'],
      });
    }

    // ---------------------------------------------------------
    // B. VALIDASI RAW HTML INPUT (SOURCE ENGINE)
    // ---------------------------------------------------------
    const hasRawInput =
      data.rawHtmlInput && data.rawHtmlInput.trim().length > 0;
    if (data.statusContent === 'published' && !hasRawInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Untuk mem-publish komponen, Source Engine (Raw HTML) wajib diisi.',
        path: ['rawHtmlInput'],
      });
    }
    if (hasRawInput) {
      if (data.rawHtmlInput!.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Kode HTML terlalu pendek (minimal 10 karakter).',
          path: ['rawHtmlInput'],
        });
      }
      if (!basicHtmlTagRegex.test(data.rawHtmlInput!)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Input harus mengandung tag HTML yang valid (contoh: <div...>).',
          path: ['rawHtmlInput'],
        });
      }
    }
  });
export type ContentComponentFormValues = z.infer<typeof ContentComponentSchema>;

export type TierType = (typeof TIER_OPTIONS)[number];
export type StatusType = (typeof STATUS_OPTIONS)[number];
export type ContentType = (typeof TYPE_OPTIONS)[number];
