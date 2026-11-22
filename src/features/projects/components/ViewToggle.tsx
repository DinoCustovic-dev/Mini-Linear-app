'use client';

import { Columns3, LayoutList } from 'lucide-react';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

import UnstyledLink from '@/components/links/UnstyledLink';

/** Board / List switch of a project. */
export default function ViewToggle({ projectKey }: { projectKey: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectKey}`;
  const isList = pathname === `${base}/list`;

  const items = [
    { href: base, label: 'Board', Icon: Columns3, active: !isList },
    { href: `${base}/list`, label: 'List', Icon: LayoutList, active: isList },
  ];

  return (
    <nav
      aria-label='View'
      className='inline-flex rounded-md border border-gray-200 bg-white p-0.5'
    >
      {items.map(({ href, label, Icon, active }) => (
        <UnstyledLink
          key={label}
          href={href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm',
            'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500',
            active
              ? 'bg-gray-100 font-medium text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Icon aria-hidden className='size-4' />
          {label}
        </UnstyledLink>
      ))}
    </nav>
  );
}
