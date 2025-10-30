import { z } from 'zod';

export const sendOTPForgotPasswordSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    email: z.string().email(t('fields.email.validator.required')),
  });

export const resetPasswordSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z
    .object({
      password: z
        .string()
        .min(8, t('fields.newPassword.validator.min'))
        .regex(/[A-Z]/, t('fields.newPassword.validator.uppercase'))
        .regex(/[a-z]/, t('fields.newPassword.validator.lowercase'))
        .regex(/[0-9]/, t('fields.newPassword.validator.number'))
        .regex(/[^A-Za-z0-9]/, t('fields.newPassword.validator.special')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('fields.confirmPassword.validator'),
      path: ['confirmPassword'],
    });

export const actionResetPasswordSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z
    .object({
      password: z
        .string()
        .min(8, t('fields.newPassword.validator.min'))
        .regex(/[A-Z]/, t('fields.newPassword.validator.uppercase'))
        .regex(/[a-z]/, t('fields.newPassword.validator.lowercase'))
        .regex(/[0-9]/, t('fields.newPassword.validator.number'))
        .regex(/[^A-Za-z0-9]/, t('fields.newPassword.validator.special')),
      confirmPassword: z.string(),
      email: z.string().min(1, t('fields.email.validator')).email(),
      signature: z
        .string()
        .min(1, t('forgotPassword.fields.signature.validator')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('fields.confirmPassword.validator'),
      path: ['confirmPassword'],
    });

export const actionVerificationOTPSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    signature: z
      .string()
      .min(1, t('forgotPassword.fields.signature.validator')),
    otp: z
      .string()
      .min(6, t('forgotPassword.fields.otp.validator.min'))
      .max(6, t('forgotPassword.fields.otp.validator.max'))
      .regex(/^[a-zA-Z0-9]+$/, t('forgotPassword.fields.otp.validator.format')),
  });

export const verificationOTPSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    otp: z
      .string()
      .min(6, t('forgotPassword.fields.otp.validator.min'))
      .max(6, t('forgotPassword.fields.otp.validator.max'))
      .regex(/^[a-zA-Z0-9]+$/, t('forgotPassword.fields.otp.validator.format')),
  });

export type ActionVerificationOTPSchema = z.infer<
  ReturnType<typeof actionVerificationOTPSchema>
>;

export type VerificationOTPSchema = z.infer<
  ReturnType<typeof verificationOTPSchema>
>;

export type ActionResetPasswordSchema = z.infer<
  ReturnType<typeof actionResetPasswordSchema>
>;

export type ResetPasswordSchema = z.infer<
  ReturnType<typeof resetPasswordSchema>
>;

export type SendOTPForgotPasswordSchema = z.infer<
  ReturnType<typeof sendOTPForgotPasswordSchema>
>;
