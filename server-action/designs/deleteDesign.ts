'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentDesigns } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';

export async function deleteContentDesign(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.delete(contentDesigns).where(eq(contentDesigns.id, id));
    revalidatePath('/dashboard/content/designs');
    return { success: 'Design deleted successfully' };
  } catch (error) {
    console.error('Delete Design Error:', error);
    return { error: 'Failed to delete design' };
  }
}
