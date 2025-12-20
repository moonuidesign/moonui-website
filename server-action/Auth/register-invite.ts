'use server';

import { z } from 'zod';
import { db } from '@/libs/drizzle';
import { users, verificationTokens, invites } from '@/db/migration';
import { eq, and } from 'drizzle-orm';
import { generatePasswordHash } from '@/libs/credentials';
import { sendVerificationEmail } from '@/libs/mail';
import crypto from 'crypto';

// 1. Validate Invite Token (Initial Page Load)
export async function validateInviteToken(token: string) {
  try {
    console.log(`[validateInviteToken] Validating token: ${token}`);
    
    const inviteRecord = await db.query.invites.findFirst({
      where: eq(invites.token, token),
    });

    if (!inviteRecord) {
      console.log(`[validateInviteToken] Record NOT FOUND for token: ${token}`);
      return { valid: false, error: 'Invalid invitation link' };
    }

    console.log(`[validateInviteToken] Record FOUND:`, inviteRecord);

    if (inviteRecord.expires < new Date()) {
      console.log(`[validateInviteToken] Token EXPIRED. Expires: ${inviteRecord.expires}, Now: ${new Date()}`);
      return { valid: false, error: 'Invitation link expired' };
    }

    if (inviteRecord.status !== 'pending') {
      console.log(`[validateInviteToken] Invalid Status: ${inviteRecord.status}`);
      return { valid: false, error: 'Invitation already accepted or invalid' };
    }

    return { valid: true, email: inviteRecord.email };
  } catch (error) {
    console.error('Validate token error:', error);
    return { valid: false, error: 'Failed to validate invitation' };
  }
}

// 2. Send Invite OTP (User requests OTP after landing on page)
export async function sendInviteOTP(token: string) {
  try {
    // Re-validate token
    const inviteRecord = await db.query.invites.findFirst({
      where: eq(invites.token, token),
    });

    if (!inviteRecord || inviteRecord.expires < new Date() || inviteRecord.status !== 'pending') {
      return { error: 'Invalid or expired invitation token' };
    }

    const email = inviteRecord.email;
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store/Update OTP in verificationTokens
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    await db.insert(verificationTokens).values({
      identifier: email,
      token: otp,
      expires: expiresAt,
    });

    // Send OTP Email
    await sendVerificationEmail(email, otp);

    return { success: 'OTP sent to your email' };
  } catch (error) {
    console.error('Send OTP error:', error);
    return { error: 'Failed to send OTP' };
  }
}

// 3. Complete Registration (Verify OTP + Set Password)
const completeRegistrationSchema = z.object({
  token: z.string(),
  otp: z.string().length(6),
  password: z.string().min(6),
});

export async function completeRegistration(prevState: unknown, formData: FormData) {
  const validatedFields = completeRegistrationSchema.safeParse({
    token: formData.get('token'),
    otp: formData.get('otp'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input fields' };
  }

  const { token, otp, password } = validatedFields.data;

  try {
    // A. Validate Invite Token
    const inviteRecord = await db.query.invites.findFirst({
      where: eq(invites.token, token),
    });

    if (!inviteRecord || inviteRecord.expires < new Date() || inviteRecord.status !== 'pending') {
      return { error: 'Invalid or expired invitation token' };
    }

    const email = inviteRecord.email;

    // B. Validate OTP
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

    // C. Update User (Password + Verified)
    const hashedPassword = await generatePasswordHash(password);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        emailVerified: new Date(),
        // roleUser is already set during invite, but we can confirm it here if needed
      })
      .where(eq(users.email, email));

    // D. Update Invite Status
    await db
        .update(invites)
        .set({ status: 'accepted' })
        .where(eq(invites.id, inviteRecord.id));

    // E. Cleanup OTP
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp),
        ),
      );

    return { success: 'Registration successful. Redirecting...' };
  } catch (error) {
    console.error('Complete registration error:', error);
    return { error: 'Failed to complete registration' };
  }
}
