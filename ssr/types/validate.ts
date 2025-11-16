import { z } from 'zod';

export const licenseValidationSchema = z.object({
  licenseKey: z.string().trim().min(1, 'License key is required.'),
});

export type LicenseValidationSchema = z.infer<typeof licenseValidationSchema>;

export const otpVerificationSchema = z.object({
  otp: z.string().trim().length(6, 'OTP must be 6 characters long.'),
  signature: z.string().min(1, 'Signature is missing.'),
});
export type OtpVerificationSchema = z.infer<typeof otpVerificationSchema>;
