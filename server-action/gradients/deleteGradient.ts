'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentGradients } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';

export async function deleteContentGradient(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.delete(contentGradients).where(eq(contentGradients.id, id));
    revalidatePath('/dashboard/content/gradients');
    return { success: 'Gradient deleted successfully' };
  } catch (error) {
    console.error('Delete Gradient Error:', error);
    return { error: 'Failed to delete gradient' };
  }
}
