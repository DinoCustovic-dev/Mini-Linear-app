'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

import IconButton from '@/components/buttons/IconButton';

import Header from './Header';
import Sidebar from './Sidebar';

import type { CurrentUser, Project } from '@/types/project';

type AppShellProps = {
  projects: Project[];
  user: CurrentUser;
  children: React.ReactNode;
};

export default function AppShell({ projects, user, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the mobile drawer after navigating
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!isSidebarOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className='flex min-h-screen overflow-x-hidden bg-white'>
      {/* Desktop sidebar */}
      <aside className='fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-gray-50 lg:block'>
        <Sidebar projects={projects} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          !isSidebarOpen && 'pointer-events-none'
        )}
      >
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 bg-gray-900/40 transition-opacity duration-200',
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside
          inert={!isSidebarOpen}
          className={cn(
            'absolute inset-y-0 left-0 w-64 max-w-[80vw] border-r border-gray-200 bg-gray-50 shadow-xl',
            'transition-transform duration-200',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <IconButton
            variant='ghost'
            icon={X}
            aria-label='Close navigation'
            onClick={() => setIsSidebarOpen(false)}
            className='absolute top-3 right-3 text-gray-500'
          />
          <Sidebar projects={projects} />
        </aside>
      </div>

      <div className='flex min-w-0 flex-1 flex-col lg:pl-64'>
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className='min-w-0 flex-1 p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
