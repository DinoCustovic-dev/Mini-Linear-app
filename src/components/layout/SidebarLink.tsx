'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

import UnstyledLink from '@/components/links/UnstyledLink';

type SidebarLinkProps = {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  /** Also mark active on nested routes (e.g. /projects/abc/issues) */
  matchNested?: boolean;
};

export default function SidebarLink({
  href,
  children,
  icon,
  matchNested = false,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (matchNested && pathname.startsWith(`${href}/`));

  return (
    <UnstyledLink
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm md:text-sm',
        'transition-colors duration-75',
        'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500',
        isActive
          ? 'bg-gray-200/70 font-semibold text-gray-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      {icon}
      <span className='truncate'>{children}</span>
    </UnstyledLink>
  );
}
