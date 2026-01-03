'use server';

import { db } from '@/libs/drizzle';
import { discounts } from '@/db/migration';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/libs/auth';
import { DiscountSchema } from './discount-validator';

// Definition of strict Return Type
type ActionResponse = { success: string } | { error: string };

export async function getDiscounts() {
  try {
    const data = await db.select().from(discounts).orderBy(desc(discounts.createdAt));
    return { data };
  } catch (error) {
    console.error('[GetDiscounts] Error:', error);
    return { error: 'Failed to fetch discounts' };
  }
}

export async function getDiscountById(id: string) {
  try {
    const data = await db.select().from(discounts).where(eq(discounts.id, id)).limit(1);
    return { data: data[0] };
  } catch (error) {
    console.error('[GetDiscountById] Error:', error);
    return { error: 'Failed to fetch discount' };
  }
}

export async function createDiscount(formData: FormData): Promise<ActionResponse> {
  console.log('[CreateDiscount] Started');

  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) {
    console.error('[CreateDiscount] Unauthorized');
    return { error: 'Unauthorized: Harap login.' };
  }
  const userId = session.user.id; // Not used in table but good to know
  console.log('[CreateDiscount] UserId:', userId);

  // 2. Parse Data
  const rawData = {
    name: formData.get('name'),
    code: formData.get('code'),
    discount: Number(formData.get('discount')),
    isActive: formData.get('isActive') === 'true',
  };

  // 3. Zod Validation
  const validated = DiscountSchema.safeParse(rawData);
  if (!validated.success) {
    console.error('[CreateDiscount] Validation Error:', validated.error.flatten());
    return { error: 'Input tidak valid. Periksa kembali form anda.' };
  }

  const values = validated.data;
  console.log('[CreateDiscount] Validated Values:', values);

  // 4. Insert to Database
  try {
    await db.insert(discounts).values({
      name: values.name,
      code: values.code,
      discount: values.discount,
      isActive: values.isActive,
    });

    console.log('[CreateDiscount] DB Insert Success');
    revalidatePath('/dashboard/discounts');
    revalidatePath('/pricing');
    return { success: 'Discount created successfully' };
  } catch (error) {
    console.error('[CreateDiscount] DB Insert Error:', error);
    return { error: 'Failed to create discount' };
  }
}

export async function updateDiscount(id: string, formData: FormData): Promise<ActionResponse> {
  console.log('[UpdateDiscount] Started');

  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  // 2. Parse Data
  const rawData = {
    name: formData.get('name'),
    code: formData.get('code'),
    discount: Number(formData.get('discount')),
    isActive: formData.get('isActive') === 'true',
  };

  // 3. Zod Validation
  const validated = DiscountSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const values = validated.data;

  // 4. Update Database
  try {
    await db
      .update(discounts)
      .set({
        name: values.name,
        code: values.code,
        discount: values.discount,
        isActive: values.isActive,
        updatedAt: new Date(),
      })
      .where(eq(discounts.id, id));

    revalidatePath('/dashboard/discounts');
    revalidatePath('/pricing');
    return { success: 'Discount updated successfully' };
  } catch (error) {
    console.error('[UpdateDiscount] Error:', error);
    return { error: 'Failed to update discount' };
  }
}

export async function deleteDiscount(id: string): Promise<ActionResponse> {
  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await db.delete(discounts).where(eq(discounts.id, id));
    revalidatePath('/dashboard/discounts');
    return { success: 'Discount deleted successfully' };
  } catch (error) {
    console.error('[DeleteDiscount] Error:', error);
    return { error: 'Failed to delete discount' };
  }
}

export async function getActiveDiscount() {
  try {
    const data = await db
      .select()
      .from(discounts)
      .where(eq(discounts.isActive, true))
      .orderBy(desc(discounts.createdAt))
      .limit(1);

    return data[0] || null;
  } catch {
    return null;
  }
}
