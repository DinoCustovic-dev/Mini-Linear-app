import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { loadProject } from '@/features/projects/cached';
import BoardCard from '@/features/tickets/components/BoardCard';
import { STATUS_LABELS } from '@/features/tickets/labels';
import { listTickets } from '@/features/tickets/queries';
import { TICKET_STATUSES } from '@/features/tickets/schema';

type BoardPageProps = {
  params: Promise<{ key: string }>;
};

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const { key } = await params;
  const project = await loadProject(key);
  return { title: project?.name ?? 'Project' };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { key } = await params;
  const project = await loadProject(key);
  if (!project) notFound();

  const tickets = await listTickets(project.id);

  return (
    // Columns keep their width and the board scrolls sideways on narrow screens.
    <div className='-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0'>
      {TICKET_STATUSES.map((status) => {
        const column = tickets.filter((ticket) => ticket.status === status);
        return (
          <section
            key={status}
            aria-label={STATUS_LABELS[status]}
            className='flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-gray-50 p-2 md:min-w-0 md:flex-1'
          >
            <h2 className='flex items-center gap-2 px-1 text-sm font-semibold text-gray-700'>
              {STATUS_LABELS[status]}
              <span className='rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-600 md:text-xs'>
                {column.length}
              </span>
            </h2>
            <div className='flex flex-col gap-2'>
              {column.map((ticket) => (
                <BoardCard
                  key={ticket.id}
                  ticket={ticket}
                  projectKey={project.key}
                />
              ))}
              {column.length === 0 && (
                <p className='px-1 py-4 text-center text-sm text-gray-400'>
                  No tickets
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
