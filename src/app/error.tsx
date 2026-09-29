'use client';

import * as React from 'react';

import TextButton from '@/components/buttons/TextButton';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-white text-center'>
      <h1>Something went wrong</h1>
      <TextButton variant='basic' onClick={reset} className='mt-4'>
        Try again
      </TextButton>
    </main>
  );
}
