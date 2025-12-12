import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { Separator } from '@/components/ui/separator';
import { auth } from '@/libs/auth';
import { SidebarDashboard } from './sidebar';
import { DynamicBreadcrumb } from '@/components/dinamis-breadcrumb';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // if (!session || !session.user) {
  //   console.log('ADAD');
  //   redirect('/api/auth/signin');
  // }

  return (
    <SidebarProvider>
      <SidebarDashboard user={session?.user} />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <DynamicBreadcrumb containerClasses="hidden md:block" />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="flex-1 py-4">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

