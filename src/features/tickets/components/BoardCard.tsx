import * as React from 'react';

import Avatar from '@/components/layout/Avatar';
import UnstyledLink from '@/components/links/UnstyledLink';

import LabelChip from '@/features/tickets/components/LabelChip';
import PriorityIcon from '@/features/tickets/components/PriorityIcon';
import { displayName } from '@/features/tickets/labels';
import type { TicketWithPeople } from '@/features/tickets/queries';

export default function BoardCard({
  ticket,
  projectKey,
}: {
  ticket: TicketWithPeople;
  projectKey: string;
}) {
  return (
    <UnstyledLink
      href={`/projects/${projectKey}/tickets/${ticket.number}`}
      className='block rounded-md border border-gray-200 bg-white p-3 shadow-xs hover:border-gray-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500'
    >
      <div className='flex items-center justify-between gap-2 text-xs text-gray-500 md:text-xs'>
        <span className='font-medium'>
          {projectKey}-{ticket.number}
        </span>
        <PriorityIcon priority={ticket.priority} />
      </div>
      <p className='mt-1 text-sm font-medium break-words text-gray-900'>
        {ticket.title}
      </p>
      <div className='mt-2 flex items-end justify-between gap-2'>
        <div className='flex min-w-0 flex-wrap gap-1'>
          {ticket.labels.map((label) => (
            <LabelChip key={label.id} name={label.name} color={label.color} />
          ))}
        </div>
        {ticket.assignee && (
          <Avatar
            name={displayName(ticket.assignee)}
            src={ticket.assignee.avatar_url ?? undefined}
            className='size-6 text-[10px]'
          />
        )}
      </div>
    </UnstyledLink>
  );
}
