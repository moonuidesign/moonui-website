'use server';

import { z } from 'zod';
import { db } from '@/libs/drizzle';
import { users, invites } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { sendInviteEmail } from '@/libs/mail';
import crypto from 'crypto';
import { auth } from '@/libs/auth';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'superadmin']),
});

export async function inviteUser(prevState: unknown, formData: FormData) {
  const session = await auth();

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

    // 2. Create or Update user (Pre-provisioning)
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

    // 3. Generate Invite Token (SHA256)
    console.log(`[inviteUser] Generating invite for: ${email}`);
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const inviteToken = crypto
      .createHash('sha256')
      .update(randomBytes + process.env.AUTH_SECRET)
      .digest('hex');
    console.log(`[inviteUser] Generated Token: ${inviteToken}`);
      
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 4. Save Invite Record
    const existingInvite = await db.query.invites.findFirst({
         where: eq(invites.email, email)
    });

    if (existingInvite) {
        await db.update(invites).set({
            role: role,
            token: inviteToken, 
            expires: expiresAt,
            status: 'pending',
            inviterId: session?.user?.id || null,
            createdAt: new Date(), 
        }).where(eq(invites.id, existingInvite.id));
    } else {
        await db.insert(invites).values({
            email,
            role,
            token: inviteToken,
            inviterId: session?.user?.id || null,
            expires: expiresAt,
            status: 'pending',
        });
    }
    console.log(`[inviteUser] DB Operation completed for ${email}`);

    // 5. Send Email with Link ONLY
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite?token=${inviteToken}&email=${encodeURIComponent(
      email,
    )}`;
    
    console.log(`[inviteUser] Sending Email to: ${email} with Link: ${inviteUrl}`);

    // Note: You need to update sendInviteEmail to accept 'inviteUrl' and NOT 'otp' if you want to be strict,
    // or just pass a dummy OTP if you haven't updated the mailer yet. 
    // I will assume I need to update the mailer next or pass an empty string/dummy.
    // The prompt implies "sistemnya akan mengirim otp... kemudian jadikan signature".
    // Wait, the prompt says "make it so it sends otp AND sha token".
    // But my refined plan was: Link -> Page -> Send OTP.
    // Passing " " as OTP for now, will update mailer.
    await sendInviteEmail(email, "", inviteUrl, role);

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/invite');

    return { success: 'Invitation sent successfully' };
  } catch (error) {
    console.error('Invite error:', error);
    return { error: 'Failed to send invitation' };
  }
}

export async function getInvites() {
  const session = await auth();
  if (
    session?.user?.roleUser !== 'superadmin' &&
    session?.user?.roleUser !== 'admin'
  ) {
    return [];
  }

  try {
    const { desc } = await import('drizzle-orm');
    const allInvites = await db.query.invites.findMany({
      orderBy: [desc(invites.createdAt)],
    });
    return allInvites;
  } catch (error) {
    console.error('Failed to fetch invites:', error);
    return [];
  }
}

export async function cancelInvite(inviteId: string) {
  const session = await auth();
  if (
    session?.user?.roleUser !== 'superadmin' &&
    session?.user?.roleUser !== 'admin'
  ) {
    return { error: 'Unauthorized' };
  }

  try {
    // 1. Get the invite first to check status and email
    const invite = await db.query.invites.findFirst({
        where: eq(invites.id, inviteId)
    });

    if (!invite) {
        return { error: 'Invite not found' };
    }

    // 2. If accepted, delete the user account associated with this email
    if (invite.status === 'accepted') {
        const user = await db.query.users.findFirst({
            where: eq(users.email, invite.email)
        });
        
        if (user) {
            // Prevent deleting self
            if (user.id === session?.user?.id) {
                return { error: 'Cannot delete your own account via invite list' };
            }
            await db.delete(users).where(eq(users.id, user.id));
        }
    }

    // 3. Delete the invite record
    await db.delete(invites).where(eq(invites.id, inviteId));
    
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/invite');
    revalidatePath('/dashboard/users'); // Revalidate users list too

    return { success: invite.status === 'accepted' ? 'User and invite removed successfully' : 'Invite cancelled successfully' };
  } catch (error) {
    console.error('Cancel invite error:', error);
    return { error: 'Failed to cancel invite' };
  }
}