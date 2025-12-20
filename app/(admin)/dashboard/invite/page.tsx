import { Suspense } from 'react';
import InviteForm from '@/components/dashboard/invite/invite-form';
import InviteTable from '@/components/dashboard/invite/invite-table';
import { getInvites } from '@/server-action/admin/invite';
import { DashboardListSkeleton } from '@/components/skeletons/dashboard-list-skeleton';

export const dynamic = 'force-dynamic';

export default async function InvitePage() {
  return (
    <Suspense fallback={<DashboardListSkeleton />}>
      <InvitePageContent />
    </Suspense>
  );
}

async function InvitePageContent() {
  const invites = await getInvites();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Invite Management</h1>
        <p className="text-muted-foreground">
          Send new invitations and manage pending or expired invites.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Invite Form Section */}
        <div className="lg:col-span-4">
           <InviteForm />
        </div>

        {/* Invite List Section */}
        <div className="lg:col-span-8">
           <InviteTable invites={invites} />
        </div>
      </div>
    </div>
  );
}