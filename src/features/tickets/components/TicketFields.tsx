'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import { updateTicket } from '@/features/tickets/actions';
import {
  type TicketPriority,
  type TicketStatus,
  displayName,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '@/features/tickets/labels';
import type { UpdateTicketInput } from '@/features/tickets/schema';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '@/features/tickets/schema';

type Person = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type TicketFieldsProps = {
  ticketId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  profiles: Person[];
};

type FieldValues = {
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
};

const UNASSIGNED = '';

/**
 * Status, priority and assignee pickers. Each change is saved right away.
 * The select shows the new value while saving and goes back if it fails.
 */
export default function TicketFields({
  ticketId,
  status,
  priority,
  assigneeId,
  profiles,
}: TicketFieldsProps) {
  const [isPending, startTransition] = React.useTransition();
  const [pendingField, setPendingField] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [optimistic, setOptimistic] = React.useOptimistic<
    FieldValues,
    Partial<FieldValues>
  >({ status, priority, assigneeId }, (current, change) => ({
    ...current,
    ...change,
  }));

  function save(
    field: string,
    change: Partial<FieldValues>,
    input: UpdateTicketInput
  ) {
    setError(null);
    setPendingField(field);
    startTransition(async () => {
      setOptimistic(change);
      const result = await updateTicket(ticketId, input);
      if (!result.ok) setError(result.error);
      setPendingField(null);
    });
  }

  return (
    <div className='space-y-4'>
      <Field label='Status' saving={pendingField === 'status'}>
        <select
          value={optimistic.status}
          onChange={(event) => {
            const value = event.target.value as TicketStatus;
            save('status', { status: value }, { status: value });
          }}
          disabled={isPending}
          className={selectClasses}
        >
          {TICKET_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field label='Priority' saving={pendingField === 'priority'}>
        <select
          value={optimistic.priority}
          onChange={(event) => {
            const value = event.target.value as TicketPriority;
            save('priority', { priority: value }, { priority: value });
          }}
          disabled={isPending}
          className={selectClasses}
        >
          {TICKET_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field label='Assignee' saving={pendingField === 'assignee'}>
        <select
          value={optimistic.assigneeId ?? UNASSIGNED}
          onChange={(event) => {
            const value = event.target.value || null;
            save('assignee', { assigneeId: value }, { assigneeId: value });
          }}
          disabled={isPending}
          className={selectClasses}
        >
          <option value={UNASSIGNED}>Unassigned</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {displayName(profile)}
            </option>
          ))}
        </select>
      </Field>

      {error && (
        <p role='alert' className='text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  );
}

const selectClasses = cn(
  'w-full rounded-md border-gray-300 py-1.5 text-sm',
  'focus:border-primary-500 focus:ring-primary-500',
  'disabled:cursor-wait disabled:opacity-70'
);

function Field({
  label,
  saving,
  children,
}: {
  label: string;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className='block'>
      <span className='mb-1 flex items-center justify-between text-xs font-medium text-gray-500'>
        {label}
        {saving && <span className='text-gray-400'>Saving…</span>}
      </span>
      {children}
    </label>
  );
}
