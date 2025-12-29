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

interface NavItem {
  title: string;
  url?: string; // Optional for parent items
  icon?: React.ElementType;
  items?: NavItem[]; // For sub-menus (like Content CMS -> Templates)
  subItems?: NavItem[]; // For the next level (Templates -> Manage Content, Manage Categories)
  hidden?: boolean;
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
  const navMain: NavItem[] = [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'User Management',
      url: '#',
      icon: Users,
      items: [
        ...(isSuperAdmin
          ? [
              {
                title: 'Users',
                url: '/dashboard/users',
                icon: Users,
              },
              {
                title: 'Invites',
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
      ].filter(Boolean) as NavItem[], // Cast to NavItem[]
      hidden: !isSuperAdmin,
    },
    {
      title: 'Content CMS',
      icon: Layers,
      url: '#', // No direct URL, this is a parent
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
          url: '/dashboard/content/designs',
        },
      ],
    },
    {
      title: 'Category',
      icon: Layers,
      url: '#',
      items: [
        {
          title: 'Templates',
          url: '/dashboard/category/templates',
        },
        {
          title: 'Components',
          url: '/dashboard/category/components',
        },
        {
          title: 'Gradients',
          url: '/dashboard/category/gradients',
        },
        {
          title: 'Design',
          url: '/dashboard/category/designs',
        },
      ],
    },
    {
      title: 'Settings',
      icon: Layers,
      url: '#',
      items: [
        {
          title: 'Templates',
          url: '/dashboard/category/templates',
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
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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

                // FIX: Use optional chaining and default value string
                const safeUrl = item.url || '#';

                // Check active state for top-level item
                const isItemActive =
                  safeUrl !== '#' && (pathname === safeUrl || pathname.startsWith(safeUrl + '/'));

                // Check if any sub-item is active for accordion behavior
                const hasActiveSubItem = item.items?.some((subItem) => {
                  if (subItem.url) return pathname === subItem.url;
                  if (subItem.subItems) {
                    return subItem.subItems.some(
                      (deepSubItem) => pathname === (deepSubItem.url || ''), // FIX: Add fallback
                    );
                  }
                  return false;
                });

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.items && item.items.length > 0 ? (
                      // Menu with Sub-items (Accordion style)
                      <div className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isItemActive || hasActiveSubItem} // Activate parent if any child is active
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuItem key={subItem.title}>
                              {subItem.subItems && subItem.subItems.length > 0 ? (
                                // Second level sub-items
                                <div className="group-data-[collapsible=icon]:hidden">
                                  <SidebarMenuButton
                                    tooltip={subItem.title}
                                    isActive={subItem.subItems.some(
                                      (deepSubItem) => pathname.startsWith(deepSubItem.url || ''), // FIX: Add fallback
                                    )}
                                  >
                                    <span>{subItem.title}</span>
                                  </SidebarMenuButton>
                                  <SidebarMenuSub>
                                    {subItem.subItems.map((deepSubItem) => (
                                      <SidebarMenuSubItem key={deepSubItem.title}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={pathname.startsWith(
                                            deepSubItem.url || '', // FIX: Add fallback
                                          )}
                                        >
                                          {/* FIX: Add fallback for Link href */}
                                          <Link href={deepSubItem.url || '#'}>
                                            <span>{deepSubItem.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </div>
                              ) : (
                                // Single sub-item (if no further nesting)
                                <SidebarMenuButton
                                  asChild
                                  tooltip={subItem.title}
                                  isActive={pathname.startsWith(subItem.url || '')} // FIX: Add fallback
                                >
                                  {/* FIX: Add fallback for Link href */}
                                  <Link href={subItem.url || '#'}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              )}
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenuSub>
                      </div>
                    ) : (
                      // Single Menu Item
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={pathname.startsWith(safeUrl)} // FIX: Use safeUrl
                      >
                        {/* FIX: Add fallback for Link href */}
                        <Link href={safeUrl}>
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
