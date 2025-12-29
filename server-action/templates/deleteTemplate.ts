'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/libs/drizzle';
import { contentTemplates } from '@/db/migration';
import { eq } from 'drizzle-orm';
import { auth } from '@/libs/auth';

export async function deleteContentTemplate(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.delete(contentTemplates).where(eq(contentTemplates.id, id));
    revalidatePath('/dashboard/content/templates');
    return { success: 'Template deleted successfully' };
  } catch (error) {
    console.error('Delete Template Error:', error);
    return { error: 'Failed to delete template' };
  }
}
