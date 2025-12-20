'use server';

import { db } from '@/libs/drizzle';
import { users } from '@/db/migration';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/libs/auth';

// --- Actions ---

export async function getUsers() {
  const session = await auth();
  // Basic protection: allow admins and superadmins to view
  if (
    session?.user?.roleUser !== 'superadmin' &&
    session?.user?.roleUser !== 'admin'
  ) {
    return [];
  }

  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        roleUser: true, // 2. Added missing comma here
        createdAt: true,
      },
      orderBy: [desc(users.createdAt)],
    });

    // Sort so the current user is first or marked? Not strictly necessary.
    return allUsers;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();

  // Strict: Only superadmin can delete users, OR admin can delete 'user' role but not other admins?
  // Let's stick to Superadmin for critical destructive actions for safety,
  // or allow Admin to delete 'user' role.
  // For now: Superadmin only for safety as requested "management invitenya".

  if (session?.user?.roleUser !== 'superadmin') {
    // Check if current user is trying to delete themselves
    if (session?.user?.id === userId) {
      return { error: 'Cannot delete your own account' };
    }
    return { error: 'Unauthorized: Only Super Admin can delete users' };
  }

  if (session?.user?.id === userId) {
    return { error: 'Cannot delete your own account' };
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath('/dashboard/invite');
    return { success: 'User deleted successfully' };
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: 'Failed to delete user' };
  }
}

const updateRoleSchema = z.object({
  userId: z.string(),
  newRole: z.enum(['admin', 'user', 'superadmin']),
});

export async function updateUserRole(
  userId: string,
  newRole: 'admin' | 'user' | 'superadmin',
) {
  const session = await auth();

  if (session?.user?.roleUser !== 'superadmin') {
    return { error: 'Unauthorized: Only Super Admin can change roles' };
  }

  if (session?.user?.id === userId) {
    return { error: 'Cannot change your own role' };
  }

  const validated = updateRoleSchema.safeParse({ userId, newRole });
  if (!validated.success) {
    return { error: 'Invalid data' };
  }

  try {
    await db
      .update(users)
      .set({ roleUser: newRole })
      .where(eq(users.id, userId));

    revalidatePath('/dashboard/invite');
    return { success: 'User role updated successfully' };
  } catch (error) {
    console.error('Update role error:', error);
    return { error: 'Failed to update user role' };
  }
}
