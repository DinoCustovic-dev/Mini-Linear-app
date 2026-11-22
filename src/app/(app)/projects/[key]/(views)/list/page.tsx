import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import Avatar from '@/components/layout/Avatar';
import UnstyledLink from '@/components/links/UnstyledLink';

import { loadProject } from '@/features/projects/cached';
import LabelChip from '@/features/tickets/components/LabelChip';
import PriorityIcon from '@/features/tickets/components/PriorityIcon';
import {
  displayName,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '@/features/tickets/labels';
import { type TicketWithPeople, listTickets } from '@/features/tickets/queries';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '@/features/tickets/schema';

type ListPageProps = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ sort?: string; dir?: string }>;
};

export const metadata: Metadata = { title: 'List' };

const SORT_FIELDS = [
  'id',
  'title',
  'status',
  'priority',
  'assignee',
  'updated',
] as const;
type SortField = (typeof SORT_FIELDS)[number];
type SortDir = 'asc' | 'desc';

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'id', label: 'ID' },
  { field: 'title', label: 'Title' },
  { field: 'status', label: 'Status' },
  { field: 'priority', label: 'Priority' },
  { field: 'assignee', label: 'Assignee' },
  { field: 'updated', label: 'Updated' },
];

// Status and priority sort by their workflow order, not alphabetically.
const SORTERS: Record<
  SortField,
  (a: TicketWithPeople, b: TicketWithPeople) => number
> = {
  id: (a, b) => a.number - b.number,
  title: (a, b) => a.title.localeCompare(b.title),
  status: (a, b) =>
    TICKET_STATUSES.indexOf(a.status) - TICKET_STATUSES.indexOf(b.status),
  priority: (a, b) =>
    TICKET_PRIORITIES.indexOf(a.priority) -
    TICKET_PRIORITIES.indexOf(b.priority),
  // Unassigned tickets sort as empty names.
  assignee: (a, b) =>
    (a.assignee ? displayName(a.assignee) : '').localeCompare(
      b.assignee ? displayName(b.assignee) : ''
    ),
  updated: (a, b) => a.updated_at.localeCompare(b.updated_at),
};

function parseSort(sort?: string, dir?: string): [SortField, SortDir] {
  const field = SORT_FIELDS.find((f) => f === sort);
  if (!field) return ['updated', 'desc'];
  return [field, dir === 'desc' ? 'desc' : 'asc'];
}

export default async function ListPage({
  params,
  searchParams,
}: ListPageProps) {
  const [{ key }, query] = await Promise.all([params, searchParams]);
  const project = await loadProject(key);
  if (!project) notFound();

  const [field, dir] = parseSort(query.sort, query.dir);
  const tickets = await listTickets(project.id);
  const sorted = [...tickets].sort((a, b) => {
    const result = SORTERS[field](a, b);
    // Ties keep a stable order: newest ticket first.
    return (dir === 'asc' ? result : -result) || b.number - a.number;
  });

  return (
    <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white'>
      <table className='w-full min-w-[40rem] text-left text-sm'>
        <thead className='border-b border-gray-200 bg-gray-50 text-xs text-gray-600 md:text-xs'>
          <tr>
            {COLUMNS.map((column) => {
              const active = column.field === field;
              // Clicking the active column flips its direction.
              const nextDir = active && dir === 'asc' ? 'desc' : 'asc';
              const Icon = !active
                ? ChevronsUpDown
                : dir === 'asc'
                  ? ArrowUp
                  : ArrowDown;
              return (
                <th
                  key={column.field}
                  scope='col'
                  aria-sort={
                    active
                      ? dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className='px-3 py-2 font-medium'
                >
                  <UnstyledLink
                    href={`/projects/${project.key}/list?sort=${column.field}&dir=${nextDir}`}
                    className='inline-flex items-center gap-1 hover:text-gray-900'
                  >
                    {column.label}
                    <Icon
                      aria-hidden
                      className={active ? 'size-3.5' : 'size-3.5 opacity-40'}
                    />
                  </UnstyledLink>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100'>
          {sorted.map((ticket) => {
            const href = `/projects/${project.key}/tickets/${ticket.number}`;
            return (
              <tr key={ticket.id} className='relative hover:bg-gray-50'>
                <td className='px-3 py-2 whitespace-nowrap text-gray-500'>
                  {project.key}-{ticket.number}
                </td>
                <td className='max-w-xs px-3 py-2'>
                  {/* The link stretches over the whole row. */}
                  <UnstyledLink
                    href={href}
                    className='font-medium text-gray-900 after:absolute after:inset-0 hover:underline focus:outline-hidden focus-visible:after:ring-2 focus-visible:after:ring-primary-500'
                  >
                    {ticket.title}
                  </UnstyledLink>
                  {ticket.labels.length > 0 && (
                    <span className='ml-2 inline-flex flex-wrap gap-1 align-middle'>
                      {ticket.labels.map((label) => (
                        <LabelChip
                          key={label.id}
                          name={label.name}
                          color={label.color}
                        />
                      ))}
                    </span>
                  )}
                </td>
                <td className='px-3 py-2 whitespace-nowrap'>
                  {STATUS_LABELS[ticket.status]}
                </td>
                <td className='px-3 py-2 whitespace-nowrap'>
                  <span className='inline-flex items-center gap-1.5'>
                    <PriorityIcon priority={ticket.priority} />
                    {PRIORITY_LABELS[ticket.priority]}
                  </span>
                </td>
                <td className='px-3 py-2 whitespace-nowrap'>
                  {ticket.assignee ? (
                    <span className='inline-flex items-center gap-2'>
                      <Avatar
                        name={displayName(ticket.assignee)}
                        src={ticket.assignee.avatar_url ?? undefined}
                        className='size-5 text-[10px]'
                      />
                      {displayName(ticket.assignee)}
                    </span>
                  ) : (
                    <span className='text-gray-400'>Unassigned</span>
                  )}
                </td>
                <td className='px-3 py-2 whitespace-nowrap text-gray-500'>
                  {formatDistanceToNow(new Date(ticket.updated_at), {
                    addSuffix: true,
                  })}
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className='px-3 py-8 text-center text-gray-400'
              >
                No tickets yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
