import { notFound } from 'next/navigation';
import * as React from 'react';

import { listProfiles } from '@/features/profiles/queries';
import { loadProject } from '@/features/projects/cached';
import ViewToggle from '@/features/projects/components/ViewToggle';
import NewTicketButton from '@/features/tickets/components/NewTicketButton';

type ProjectLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ key: string }>;
};

/** Header shared by the board and the list of a project. */
export default async function ProjectViewsLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { key } = await params;
  const [project, profiles] = await Promise.all([
    loadProject(key),
    listProfiles(),
  ]);

  if (!project) notFound();

  return (
    <div className='flex flex-col gap-4'>
      <header className='flex flex-wrap items-center gap-3'>
        <h1 className='h3 min-w-0 truncate'>{project.name}</h1>
        <span className='rounded-sm bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 md:text-xs'>
          {project.key}
        </span>
        <div className='ml-auto flex items-center gap-2'>
          <ViewToggle projectKey={project.key} />
          <NewTicketButton projectId={project.id} profiles={profiles} />
        </div>
      </header>
      {children}
    </div>
  );
}
