import { Suspense } from 'react';
import UserManagementTable from '@/components/dashboard/invite/user-management-table';
import { getUsers } from '@/server-action/admin/user-management';
import { auth } from '@/libs/auth';
import { DashboardListSkeleton } from '@/components/skeletons/dashboard-list-skeleton';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <UsersPageContent />
    </Suspense>
  );
}

async function UsersPageContent() {
  const [users, session] = await Promise.all([getUsers(), auth()]);

  const currentUserRole = session?.user?.roleUser || 'user';
  const currentUserId = session?.user?.id;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage existing users, roles, and permissions.
        </p>
      </div>

      <UserManagementTable
        users={users}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
      />
    </div>
  );
}
