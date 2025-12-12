'use server';

import { db } from '@/libs/drizzle';
import { licenseTransactions, users } from '@/db/migration';
import { and, between, eq, sql } from 'drizzle-orm';
import { auth } from '@/libs/auth';

export interface RevenueStats {
  totalRevenue: number;
  superAdminShare: number;
  adminShareTotal: number;
  adminSharePerPerson: number;
  adminCount: number;
  transactionsCount: number;
}

export async function getRevenueStats(): Promise<RevenueStats | null> {
  const session = await auth();

  // 1. Authorization Check
  if (
    !session?.user ||
    (session.user.roleUser !== 'admin' &&
      session.user.roleUser !== 'superadmin')
  ) {
    return null;
  }

  // 2. Date Range: Start to End of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  // 3. Aggregate Revenue
  const revenueResult = await db
    .select({
      totalAmount: sql<number>`sum(${licenseTransactions.amount})`,
      count: sql<number>`count(*)`,
    })
    .from(licenseTransactions)
    .where(
      and(
        eq(licenseTransactions.status, 'success'),
        between(licenseTransactions.createdAt, startOfMonth, endOfMonth),
      ),
    );

  const totalRevenue = Number(revenueResult[0]?.totalAmount || 0); // Amount is usually in cents
  const transactionsCount = Number(revenueResult[0]?.count || 0);

  // 4. Count Admins (excluding superadmin)
  // Assuming 'admin' role receives the 70% share
  const adminsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.roleUser, 'admin'));

  const adminCount = Number(adminsResult[0]?.count || 0);

  // 5. Calculate Shares
  // Super Admin: 30%
  const superAdminShare = totalRevenue * 0.3;

  // Admins: 70% total
  const adminShareTotal = totalRevenue * 0.7;

  // Per Admin Share
  const adminSharePerPerson = adminCount > 0 ? adminShareTotal / adminCount : 0;

  return {
    totalRevenue,
    superAdminShare,
    adminShareTotal,
    adminSharePerPerson,
    adminCount,
    transactionsCount,
  };
}
