'use server';

import { db } from '@/libs/drizzle';
import { eq, sql } from 'drizzle-orm';
import {
  contentComponents,
  contentTemplates,
  contentGradients,
  contentDesigns,
} from '@/db/migration';

export async function incrementAssetStats(
  id: string,
  type: string,
  action: 'copy' | 'download',
) {
  try {
    if (action === 'copy') {
      // Only components have copyCount
      if (type === 'components') {
        await db
          .update(contentComponents)
          .set({
            copyCount: sql`${contentComponents.copyCount} + 1`,
          })
          .where(eq(contentComponents.id, id));
      }
    } else if (action === 'download') {
      switch (type) {
        case 'templates':
          await db
            .update(contentTemplates)
            .set({
              downloadCount: sql`${contentTemplates.downloadCount} + 1`,
            })
            .where(eq(contentTemplates.id, id));
          break;
        case 'gradients':
          await db
            .update(contentGradients)
            .set({
              downloadCount: sql`${contentGradients.downloadCount} + 1`,
            })
            .where(eq(contentGradients.id, id));
          break;
        case 'designs':
          await db
            .update(contentDesigns)
            .set({
              downloadCount: sql`${contentDesigns.downloadCount} + 1`,
            })
            .where(eq(contentDesigns.id, id));
          break;
        case 'components':
          // Components might technically have downloads too depending on logic,
          // usually they are copied. But if they have download link:
           await db
            .update(contentComponents)
            .set({
              // Note: contentComponents table DOES NOT have downloadCount in the provided schema
              // If it does, uncomment below. Based on schema provided: NO.
              // So we do nothing or log warning.
              // checking schema: viewCount, copyCount. NO downloadCount.
            })
            .where(eq(contentComponents.id, id));
          break;
      }
    }
  } catch (error) {
    console.error(`Error incrementing ${action} count for ${type} ${id}:`, error);
  }
}
