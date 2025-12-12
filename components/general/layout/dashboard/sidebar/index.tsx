'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  LayoutDashboard,
  Layers,
  Command,
  Mail,
  UserPlus,
  CreditCard,
  FileKey,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavbarDashboard } from '../navbar';

// Definisi Tipe User untuk Props
interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roleUser?: 'admin' | 'user' | 'superadmin';
}

export function SidebarDashboard({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser;
}) {
  const pathname = usePathname();
  const isSuperAdmin = user?.roleUser === 'superadmin';

  // Define menu items dynamically based on role
  const navMain = [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      title: 'User Management',
      url: '#',
      icon: Users,
      items: [
        // Restricted items: Only for Superadmin
        ...(isSuperAdmin
          ? [
              {
                title: 'Invite User',
                url: '/dashboard/invite',
                icon: UserPlus,
              },
              {
                title: 'Licenses',
                url: '/dashboard/licenses',
                icon: FileKey,
              },
              {
                title: 'Transactions',
                url: '/dashboard/transactions',
                icon: CreditCard,
              },
            ]
          : []),
      ].filter(Boolean),
      // Hide section if empty
      hidden: !isSuperAdmin,
    },
    {
      title: 'Content CMS',
      url: '#',
      icon: Layers,
      items: [
        {
          title: 'Templates',
          url: '/dashboard/content/templates',
        },
        {
          title: 'Components',
          url: '/dashboard/content/components',
        },
        {
          title: 'Gradients',
          url: '/dashboard/content/gradients',
        },
        {
          title: 'Design',
          url: '/dashboard/content/design',
        },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: 'Newsletter',
            url: '/dashboard/newsletter',
            icon: Mail,
          },
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                // Skip hidden items
                if ((item as any).hidden) return null;

                // Cek active state sederhana
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + '/');

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.items && item.items.length > 0 ? (
                      // Menu dengan Sub-item (Accordion style)
                      <div className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </div>
                    ) : (
                      // Menu Item Single
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavbarDashboard user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
