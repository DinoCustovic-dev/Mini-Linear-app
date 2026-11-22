'use client';

import { Plus, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import Button from '@/components/buttons/Button';
import UnstyledLink from '@/components/links/UnstyledLink';

import { type TicketRef, createTicket } from '@/features/tickets/actions';
import AssigneePicker, {
  type Person,
} from '@/features/tickets/components/AssigneePicker';
import {
  type TicketPriority,
  type TicketStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '@/features/tickets/labels';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '@/features/tickets/schema';

type NewTicketButtonProps = {
  projectId: string;
  profiles: Person[];
  /** Status the ticket starts with, e.g. the column whose "+" was clicked. */
  defaultStatus?: TicketStatus;
  label?: string;
  className?: string;
};

const FIELD =
  'w-full rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500';

/**
 * "+ New ticket" button with the creation dialog and the success toast.
 * Uses the native <dialog>, so Esc, focus trapping and the backdrop work
 * without extra code.
 */
export default function NewTicketButton({
  projectId,
  profiles,
  defaultStatus = 'todo',
  label = 'New ticket',
  className,
}: NewTicketButtonProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [assigneeId, setAssigneeId] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<TicketRef | null>(null);

  // The toast disappears by itself.
  React.useEffect(() => {
    if (!created) return;
    const timer = setTimeout(() => setCreated(null), 6000);
    return () => clearTimeout(timer);
  }, [created]);

  function open() {
    setError(null);
    setFieldErrors({});
    setAssigneeId(null);
    formRef.current?.reset();
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function close() {
    dialogRef.current?.close();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const form = new FormData(event.currentTarget);
    setIsSaving(true);
    setError(null);
    setFieldErrors({});

    const result = await createTicket({
      projectId,
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      status: form.get('status') as TicketStatus,
      priority: form.get('priority') as TicketPriority,
      assigneeId,
    });

    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    close();
    setCreated(result.data);
  }

  return (
    <>
      <Button
        leftIcon={Plus}
        onClick={open}
        className={className}
        data-testid='new-ticket'
      >
        {label}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby='new-ticket-title'
        onClose={() => setIsOpen(false)}
        // Click on the backdrop (the dialog element itself) closes it.
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        className={cn(
          'm-auto w-[calc(100%-1rem)] max-w-lg rounded-lg p-0 shadow-xl',
          'max-h-[calc(100dvh-1rem)] overflow-y-auto backdrop:bg-black/40'
        )}
      >
        <form
          ref={formRef}
          onSubmit={onSubmit}
          onKeyDown={(event) => {
            // Ctrl/Cmd+Enter submits from the description too.
            if (
              event.key === 'Enter' &&
              (event.metaKey || event.ctrlKey) &&
              event.target instanceof HTMLTextAreaElement
            ) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className='flex flex-col gap-4 p-4 sm:p-6'
        >
          <div className='flex items-center justify-between'>
            <h2 id='new-ticket-title' className='text-lg font-semibold'>
              New ticket
            </h2>
            <button
              type='button'
              onClick={close}
              aria-label='Close'
              className='rounded-sm p-1 text-gray-500 hover:bg-gray-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500'
            >
              <X className='size-5' />
            </button>
          </div>

          {isOpen && (
            <>
              <div className='flex flex-col gap-1'>
                <label htmlFor='ticket-title' className='text-sm font-medium'>
                  Title
                </label>
                <input
                  id='ticket-title'
                  name='title'
                  type='text'
                  required
                  maxLength={200}
                  autoFocus
                  autoComplete='off'
                  aria-invalid={Boolean(fieldErrors.title)}
                  className={FIELD}
                />
                <FieldError messages={fieldErrors.title} />
              </div>

              <div className='flex flex-col gap-1'>
                <label
                  htmlFor='ticket-description'
                  className='text-sm font-medium'
                >
                  Description <span className='text-gray-500'>(optional)</span>
                </label>
                <textarea
                  id='ticket-description'
                  name='description'
                  rows={4}
                  maxLength={10000}
                  className={FIELD}
                />
                <FieldError messages={fieldErrors.description} />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='flex flex-col gap-1'>
                  <label
                    htmlFor='ticket-status'
                    className='text-sm font-medium'
                  >
                    Status
                  </label>
                  <select
                    id='ticket-status'
                    name='status'
                    defaultValue={defaultStatus}
                    className={FIELD}
                  >
                    {TICKET_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex flex-col gap-1'>
                  <label
                    htmlFor='ticket-priority'
                    className='text-sm font-medium'
                  >
                    Priority
                  </label>
                  <select
                    id='ticket-priority'
                    name='priority'
                    defaultValue='medium'
                    className={FIELD}
                  >
                    {TICKET_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='flex flex-col gap-1'>
                <label
                  htmlFor='ticket-assignee'
                  className='text-sm font-medium'
                >
                  Assignee
                </label>
                <AssigneePicker
                  id='ticket-assignee'
                  profiles={profiles}
                  value={assigneeId}
                  onChange={setAssigneeId}
                  disabled={isSaving}
                />
                <FieldError messages={fieldErrors.assigneeId} />
              </div>
            </>
          )}

          {error && (
            <p role='alert' className='text-sm text-red-600'>
              {error}
            </p>
          )}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={close} disabled={isSaving}>
              Cancel
            </Button>
            <Button type='submit' isLoading={isSaving}>
              Create ticket
            </Button>
          </div>
        </form>
      </dialog>

      {created && (
        <div
          role='status'
          className='fixed right-4 bottom-4 left-4 z-50 flex items-center gap-3 rounded-md bg-gray-900 px-4 py-3 text-sm text-white shadow-lg sm:left-auto'
        >
          <span>
            <strong>{created.identifier}</strong> created
          </span>
          <UnstyledLink
            href={`/projects/${created.projectKey}/tickets/${created.number}`}
            className='ml-auto font-medium underline'
          >
            Open
          </UnstyledLink>
          <button
            type='button'
            aria-label='Dismiss'
            onClick={() => setCreated(null)}
          >
            <X className='size-4' />
          </button>
        </div>
      )}
    </>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className='text-sm text-red-600'>{messages[0]}</p>;
}
