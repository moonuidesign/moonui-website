'use server';

import { z } from 'zod';
import { db } from '@/libs/drizzle';
import { users, verificationTokens } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { generateInviteSignature } from '@/libs/signature';
import { sendInviteEmail } from '@/libs/mail';
import crypto from 'crypto';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'superadmin']),
});

export async function inviteUser(prevState: unknown, formData: FormData) {
  const validatedFields = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input fields' };
  }

  const { email, role } = validatedFields.data;

  try {
    // 1. Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser && existingUser.emailVerified) {
      return { error: 'User already exists and is verified' };
    }

    // 2. Create or Update user
    if (!existingUser) {
      await db.insert(users).values({
        email,
        roleUser: role,
        emailVerified: null,
        password: null, // No password yet
        name: email.split('@')[0], // Default name
      });
    } else {
      // Update role if re-inviting (and not verified)
      await db
        .update(users)
        .set({ roleUser: role })
        .where(eq(users.email, email));
    }

    // 3. Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 4. Save OTP
    // First delete old tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    await db.insert(verificationTokens).values({
      identifier: email,
      token: otp,
      expires: expiresAt,
    });

    // 5. Generate Signature
    const signature = await generateInviteSignature(
      email,
      role,
      otp,
      expiresAt,
    );

    // 6. Send Email
    // Using /invite path for the landing page
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?signature=${signature}&email=${encodeURIComponent(
      email,
    )}`;
    await sendInviteEmail(email, otp, inviteUrl, role);

    return { success: 'Invitation sent successfully' };
  } catch (error) {
    console.error('Invite error:', error);
    return { error: 'Failed to send invitation' };
  }
}
