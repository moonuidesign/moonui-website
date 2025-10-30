import { z } from 'zod';

export const verifyEmailSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    email: z.string().email(t('fields.otp.validator.min')),
    otp: z
      .string()
      .min(6, t('fields.otp.validator.min'))
      .max(6, t('fields.otp.validator.min'))
      .regex(/^[a-zA-Z0-9]+$/, t('fields.otp.validator.min')),
  });

export const verifyEmailClientSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    otp: z
      .string()
      .min(6, t('fields.otp.validator.min'))
      .max(6, t('fields.otp.validator.max'))
      .regex(/^[a-zA-Z0-9]+$/, t('fields.otp.validator.format')),
  });

export const sendOTPSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    email: z.string().email(t('fields.email.validator.format')),
  });

export type VerifyEmailSchema = z.infer<ReturnType<typeof verifyEmailSchema>>;
export type SendOTPSchema = z.infer<ReturnType<typeof sendOTPSchema>>;
export type verifyEmailClientSchema = z.infer<
  ReturnType<typeof verifyEmailClientSchema>
>;
