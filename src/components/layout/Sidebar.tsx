import { FolderKanban, Inbox, Plus } from 'lucide-react';
import * as React from 'react';

import UnstyledLink from '@/components/links/UnstyledLink';

import SidebarLink from './SidebarLink';

import type { Project } from '@/types/project';

type SidebarProps = {
  projects: Project[];
};

export default function Sidebar({ projects }: SidebarProps) {
  return (
    <div className='flex h-full flex-col gap-6 px-3 py-4'>
      <UnstyledLink
        href='/my-issues'
        className='flex items-center gap-2 self-start rounded-md px-2 font-semibold text-gray-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500'
      >
        <span className='flex size-6 items-center justify-center rounded-md bg-primary-500 text-xs font-bold text-white'>
          ML
        </span>
        Mini Linear
      </UnstyledLink>

      <nav aria-label='Main' className='flex flex-col gap-0.5'>
        <SidebarLink href='/my-issues' icon={<Inbox className='size-4' />}>
          My issues
        </SidebarLink>
        <SidebarLink
          href='/projects'
          icon={<FolderKanban className='size-4' />}
        >
          All projects
        </SidebarLink>
      </nav>

      <div className='flex min-h-0 flex-1 flex-col gap-1'>
        <h2 className='px-2 text-xs font-medium tracking-wide text-gray-500 uppercase md:text-xs'>
          Projects
        </h2>
        <nav
          aria-label='Projects'
          className='flex flex-col gap-0.5 overflow-y-auto'
        >
          {projects.map((project) => (
            <SidebarLink
              key={project.id}
              href={`/projects/${project.id}`}
              matchNested
              icon={
                <span
                  aria-hidden
                  className='size-2.5 shrink-0 rounded-full'
                  style={{ backgroundColor: project.color }}
                />
              }
            >
              {project.name}
            </SidebarLink>
          ))}
        </nav>
      </div>

      {/* TODO: wire up project creation */}
      <button
        type='button'
        disabled
        title='Coming soon'
        className='flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-2 py-1.5 text-sm text-gray-500 disabled:cursor-not-allowed md:text-sm'
      >
        <Plus className='size-4' />
        New project
      </button>
    </div>
  );
}
