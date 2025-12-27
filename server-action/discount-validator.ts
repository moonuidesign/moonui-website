import { z } from 'zod';

export const DiscountSchema = z.object({
    name: z.string().min(3, 'Nama discount minimal 3 karakter'),
    code: z.string().min(3, 'Kode discount minimal 3 karakter'),
    discount: z.number().min(1, 'Minimal 1%').max(100, 'Maksimal 100%'),
    isActive: z.boolean().default(true),
});

export type DiscountFormValues = z.infer<typeof DiscountSchema>;
