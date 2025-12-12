'use server';

import { z } from 'zod';
import { db } from '@/libs/drizzle';
import { users, verificationTokens } from '@/db/migration';
import { eq, and } from 'drizzle-orm';
import { verifyInviteSignature } from '@/libs/signature';
import { generatePasswordHash } from '@/libs/credentials';

const registerSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    otp: z.string().length(6),
    signature: z.string(),
    email: z.string().email(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function registerInvite(prevState: unknown, formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    otp: formData.get('otp'),
    signature: formData.get('signature'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input fields' };
  }

  const { password, otp, signature, email } = validatedFields.data;

  try {
    // 1. Verify Signature
    const { valid, expired, payload } = await verifyInviteSignature(signature);

    if (!valid) {
      return { error: 'Invalid invitation link' };
    }

    if (expired) {
      return { error: 'Invitation link expired' };
    }

    if (payload?.email !== email) {
      return { error: 'Invalid email for this invitation' };
    }

    // 2. Verify OTP in DB
    const tokenRecord = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, otp),
      ),
    });

    if (!tokenRecord) {
      return { error: 'Invalid OTP' };
    }

    if (tokenRecord.expires < new Date()) {
      return { error: 'OTP expired' };
    }

    // 3. Update User
    const hashedPassword = await generatePasswordHash(password);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        emailVerified: new Date(),
      })
      .where(eq(users.email, email));

    // 4. Delete Token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp),
        ),
      );

    return { success: 'Registration successful. You can now login.' };
  } catch (error) {
    console.error('Register invite error:', error);
    return { error: 'Failed to complete registration' };
  }
}

// Resend OTP Action
export async function resendInviteOtp(email: string, signature: string) {
  try {
    // Verify signature to get role and validity
    // We ignore 'expired' here because we want to allow resending even if the *link* (signature) expired,
    // as long as the intention is valid. However, strictly speaking, if the signature is invalid (tampered), we stop.
    const { valid } = await verifyInviteSignature(signature);

    if (!valid) {
      // For security, if signature is completely invalid (tampered), do not resend.
      // If it's just expired, we might proceed if we check the user state.
      // But verifyInviteSignature returns valid=false if signature verification fails.
      // It returns expired=true (and valid=true) if only time check failed.
      // So checking !valid covers tampering.
      return { error: 'Invalid invitation signature' };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || user.emailVerified) {
      return { error: 'User not found or already verified' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update Token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));
    await db.insert(verificationTokens).values({
      identifier: email,
      token: otp,
      expires: expiresAt,
    });

    // Use existing role from user record
    const role = user.roleUser;

    // Re-generate signature to extend validity
    const newSignature = await import('@/libs/signature').then((m) =>
      m.generateInviteSignature(email, role, otp, expiresAt),
    );

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?signature=${newSignature}&email=${encodeURIComponent(
      email,
    )}`;

    const { sendInviteEmail } = await import('@/libs/mail');
    await sendInviteEmail(email, otp, inviteUrl, role);

    return { success: 'OTP resent successfully', newSignature };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { error: 'Failed to resend OTP' };
  }
}
