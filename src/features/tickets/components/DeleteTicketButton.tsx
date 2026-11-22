'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import Button from '@/components/buttons/Button';

import { deleteTicket } from '@/features/tickets/actions';

type DeleteTicketButtonProps = {
  ticketId: string;
  identifier: string;
  projectKey: string;
};

/** Asks for confirmation inline, then deletes and goes back to the project. */
export default function DeleteTicketButton({
  ticketId,
  identifier,
  projectKey,
}: DeleteTicketButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTicket(ticketId);
      if (result.ok) {
        router.replace(`/projects/${projectKey}`);
      } else {
        setError(result.error);
      }
    });
  }

  if (!isConfirming) {
    return (
      <Button
        size='sm'
        variant='light'
        leftIcon={Trash2}
        onClick={() => setIsConfirming(true)}
        className='text-red-600'
      >
        Delete ticket
      </Button>
    );
  }

  return (
    <div className='space-y-2 rounded-md border border-red-200 bg-red-50 p-3'>
      <p className='text-sm text-red-800'>
        Delete {identifier}? This also removes its comments and attachments.
      </p>
      <div className='flex gap-2'>
        <Button
          size='sm'
          onClick={confirmDelete}
          isLoading={isPending}
          className='border-red-700 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-700'
        >
          Delete
        </Button>
        <Button
          size='sm'
          variant='light'
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
      {error && (
        <p role='alert' className='text-sm text-red-700'>
          {error}
        </p>
      )}
    </div>
  );
}
