'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import Button from '@/components/buttons/Button';

import { updateTicket } from '@/features/tickets/actions';

type InlineEditFieldProps = {
  ticketId: string;
  field: 'title' | 'description';
  value: string | null;
  label: string;
  placeholder: string;
  multiline?: boolean;
  /** Classes for the read-only text, so the title can look like a heading */
  className?: string;
};

/**
 * Click the text to edit it. Enter (Ctrl/Cmd+Enter when multiline) saves,
 * Escape cancels. Stays in edit mode with the message if saving fails.
 */
export default function InlineEditField({
  ticketId,
  field,
  value,
  label,
  placeholder,
  multiline = false,
  className,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? '');
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function startEditing() {
    setDraft(value ?? '');
    setError(null);
    setIsEditing(true);
  }

  function cancel() {
    setIsEditing(false);
    setError(null);
  }

  function save() {
    if (draft.trim() === (value ?? '').trim()) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateTicket(ticketId, { [field]: draft });
      if (result.ok) {
        setIsEditing(false);
        setError(null);
      } else {
        setError(result.fieldErrors?.[field]?.[0] ?? result.error);
      }
    });
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    } else if (
      event.key === 'Enter' &&
      (!multiline || event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      save();
    }
  }

  if (!isEditing) {
    return (
      <button
        type='button'
        onClick={startEditing}
        aria-label={`Edit ${label.toLowerCase()}`}
        className={cn(
          '-mx-2 w-full rounded-md px-2 py-1 text-left hover:bg-gray-100',
          'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500',
          multiline && 'break-words whitespace-pre-wrap',
          className,
          // After className so the placeholder stays grey
          !value && 'text-gray-400 italic'
        )}
      >
        {value || placeholder}
      </button>
    );
  }

  const inputClasses = cn(
    'w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500',
    error && 'border-red-500'
  );

  return (
    <div className='space-y-2'>
      {multiline ? (
        <textarea
          autoFocus
          rows={8}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={label}
          aria-invalid={Boolean(error)}
          placeholder={placeholder}
          disabled={isPending}
          className={inputClasses}
        />
      ) : (
        <input
          autoFocus
          type='text'
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={label}
          aria-invalid={Boolean(error)}
          placeholder={placeholder}
          disabled={isPending}
          className={cn(inputClasses, 'text-lg font-semibold')}
        />
      )}

      {error && (
        <p role='alert' className='text-sm text-red-600'>
          {error}
        </p>
      )}

      <div className='flex items-center gap-2'>
        <Button size='sm' onClick={save} isLoading={isPending}>
          Save
        </Button>
        <Button size='sm' variant='light' onClick={cancel} disabled={isPending}>
          Cancel
        </Button>
        <span className='hidden text-xs text-gray-500 sm:inline'>
          {multiline
            ? 'Ctrl+Enter to save, Esc to cancel'
            : 'Enter to save, Esc to cancel'}
        </span>
      </div>
    </div>
  );
}
