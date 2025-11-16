// schemas/index.ts

import * as z from 'zod';

export const RegisterSchema = z
  .object({
    // Signature akan ada di form sebagai input tersembunyi
    signature: z.string().min(1),
    email: z.string().email(), // Email akan diisi otomatis dan read-only
    name: z.string().min(3, {
      message: 'Name must be at least 3 characters.',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Tampilkan galat di field confirmPassword
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
