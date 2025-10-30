'use client';

import React from 'react';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

interface DynamicBreadcrumbProps {
  homeElement?: React.ReactNode;
  separator?: React.ReactNode;
  containerClasses?: string;
  listClasses?: string;
  capitalizeLinks?: boolean;
}

export function DynamicBreadcrumb({
  homeElement = <Home className="h-4 w-4" />,
  separator = <ChevronRight className="h-4 w-4" />,
  containerClasses = '',
  listClasses = '',
  capitalizeLinks = true,
}: DynamicBreadcrumbProps) {
  const paths = usePathname() ?? '';
  const pathNames = paths.split('/').filter((path) => path);

  return (
    <Breadcrumb className={containerClasses}>
      <BreadcrumbList className={listClasses}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild aria-label="Home">
            <Link href="/">{homeElement}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathNames.length > 0 && (
          <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
        )}

        {pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathNames.length - 1;
          const formattedLink = capitalizeLinks
            ? link.charAt(0).toUpperCase() + link.slice(1).replace(/-/g, ' ')
            : link.replace(/-/g, ' ');

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="uppercase font-semibold">
                    {formattedLink}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link className="uppercase font-semibold" href={href}>
                      {formattedLink}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
