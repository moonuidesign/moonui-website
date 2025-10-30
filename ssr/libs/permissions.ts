import { db } from './db';
import { formOwned } from '@global/drizzle/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Mendapatkan role user pada form tertentu
 * @param userId - ID user yang sedang login
 * @param formId - ID form yang akan dicek
 * @returns Role user pada form tersebut atau null jika tidak memiliki akses
 */
export async function getUserFormRole(
  userId: string,
  formId: string,
): Promise<'admin' | 'editor' | 'viewer' | 'validator' | null> {
  const ownership = await db.query.formOwned.findFirst({
    where: and(eq(formOwned.userId, userId), eq(formOwned.formId, formId)),
    columns: {
      role: true,
    },
  });

  return ownership?.role ?? null;
}

/**
 * Memeriksa apakah user memiliki akses ke path tertentu berdasarkan role form
 * @param formRole - Role user pada form
 * @param pathname - Path yang akan dicek
 * @returns true jika user memiliki akses, false jika tidak
 */
export function checkFormRoleAccess(
  formRole: 'admin' | 'editor' | 'viewer' | 'validator' | null,
  pathname: string,
): boolean {
  // Admin dapat akses semua path
  if (formRole === 'admin') {
    return true;
  }

  // Editor hanya dapat akses /edit dan /certificate
  if (formRole === 'editor') {
    return (
      pathname.includes('/edit') ||
      pathname.includes('/certificate') ||
      pathname.includes('/detail')
    );
  }

  // Viewer hanya dapat akses /preview
  if (formRole === 'viewer') {
    return pathname.includes('/preview') || pathname.includes('/detail');
  }

  // Validator hanya dapat akses /check-in
  if (formRole === 'validator') {
    return pathname.includes('/check-in') || pathname.includes('/detail');
  }

  // Tidak ada role, tidak ada akses
  return false;
}

/**
 * Ekstrak formId dari pathname
 * @param pathname - Path URL
 * @returns formId atau null
 */
export function extractFormIdFromPath(pathname: string): string | null {
  // Pattern: /dashboard/form/[formId]/...
  const match = pathname.match(/\/dashboard\/form\/([^\/]+)/);
  return match ? match[1] : null;
}
