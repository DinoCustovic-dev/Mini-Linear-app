import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import UnstyledLink from '@/components/links/UnstyledLink';

import { listProfiles } from '@/features/profiles/queries';
import DeleteTicketButton from '@/features/tickets/components/DeleteTicketButton';
import InlineEditField from '@/features/tickets/components/InlineEditField';
import TicketFields from '@/features/tickets/components/TicketFields';
import { displayName } from '@/features/tickets/labels';
import { getTicket } from '@/features/tickets/queries';

type TicketPageProps = {
  params: Promise<{ key: string; number: string }>;
};

// Shared by generateMetadata and the page, so the ticket is fetched once.
const loadTicket = React.cache(async (key: string, number: string) => {
  if (!/^\d+$/.test(number)) return null;
  return getTicket(key, Number(number));
});

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  const { key, number } = await params;
  const ticket = await loadTicket(key, number);
  if (!ticket) return { title: 'Ticket not found' };
  return { title: `${ticket.project.key}-${ticket.number} ${ticket.title}` };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { key, number } = await params;
  const [ticket, profiles] = await Promise.all([
    loadTicket(key, number),
    listProfiles(),
  ]);

  if (!ticket) notFound();

  const identifier = `${ticket.project.key}-${ticket.number}`;

  return (
    <article className='mx-auto max-w-6xl'>
      <nav aria-label='Breadcrumb' className='mb-4 text-sm text-gray-500'>
        <ol className='flex min-w-0 items-center gap-1'>
          <li className='min-w-0'>
            <UnstyledLink
              href={`/projects/${ticket.project.key}`}
              className='block truncate hover:text-gray-900 hover:underline'
            >
              {ticket.project.name}
            </UnstyledLink>
          </li>
          <li aria-hidden>
            <ChevronRight className='size-4' />
          </li>
          <li
            aria-current='page'
            className='shrink-0 font-medium text-gray-900'
          >
            {identifier}
          </li>
        </ol>
      </nav>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]'>
        <div className='min-w-0 space-y-6'>
          <InlineEditField
            ticketId={ticket.id}
            field='title'
            value={ticket.title}
            label='Title'
            placeholder='Ticket title'
            className='text-xl font-semibold text-gray-900 md:text-2xl'
          />

          <section aria-labelledby='description-heading'>
            <h2
              id='description-heading'
              className='mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase'
            >
              Description
            </h2>
            <InlineEditField
              ticketId={ticket.id}
              field='description'
              value={ticket.description}
              label='Description'
              placeholder='Add a description…'
              multiline
              className='min-h-16 text-sm text-gray-700'
            />
          </section>

          {/*
            Slots for other tickets. Each component gets { ticketId: string }
            and renders its own heading:
            - ML-21 <TicketAttachments ticketId={ticket.id} />
            - ML-12 <TicketComments ticketId={ticket.id} />
            - ML-24 <TicketActivity ticketId={ticket.id} />
          */}
          <SlotPlaceholder title='Attachments' ticket='ML-21' />
          <SlotPlaceholder title='Comments' ticket='ML-12' />
          <SlotPlaceholder title='Activity' ticket='ML-24' />
        </div>

        <aside className='space-y-6 lg:border-l lg:border-gray-200 lg:pl-6'>
          <TicketFields
            ticketId={ticket.id}
            status={ticket.status}
            priority={ticket.priority}
            assigneeId={ticket.assignee_id}
            profiles={profiles}
          />

          <dl className='space-y-3 border-t border-gray-200 pt-4 text-sm'>
            <MetaRow label='Reporter' value={displayName(ticket.reporter)} />
            <MetaRow label='Created' value={timeAgo(ticket.created_at)} />
            <MetaRow label='Updated' value={timeAgo(ticket.updated_at)} />
          </dl>

          <div className='border-t border-gray-200 pt-4'>
            <DeleteTicketButton
              ticketId={ticket.id}
              identifier={identifier}
              projectKey={ticket.project.key}
            />
          </div>
        </aside>
      </div>
    </article>
  );
}

function timeAgo(date: string) {
  // The database clock can be slightly ahead, which would read "in 1 minute"
  const time = Math.min(new Date(date).getTime(), Date.now());
  return formatDistanceToNow(time, { addSuffix: true });
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-4'>
      <dt className='text-gray-500'>{label}</dt>
      <dd className='truncate text-right text-gray-900'>{value}</dd>
    </div>
  );
}

function SlotPlaceholder({ title, ticket }: { title: string; ticket: string }) {
  return (
    <section className='rounded-md border border-dashed border-gray-300 p-4'>
      <h2 className='text-sm font-medium text-gray-700'>{title}</h2>
      <p className='mt-1 text-sm text-gray-400'>Coming in {ticket}.</p>
    </section>
  );
}
