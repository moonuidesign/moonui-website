'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentComponents } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';

export async function deleteContentComponent(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.delete(contentComponents).where(eq(contentComponents.id, id));
    revalidatePath('/dashboard/content/components');
    return { success: 'Component deleted successfully' };
  } catch (error) {
    console.error('Delete Component Error:', error);
    return { error: 'Failed to delete component' };
  }
}
