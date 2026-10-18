import { Metadata } from 'next';
import * as React from 'react';

import PrimaryLink from '@/components/links/PrimaryLink';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-white text-center'>
      <h1>Page Not Found</h1>
      <PrimaryLink href='/' className='mt-4'>
        Back to home
      </PrimaryLink>
    </main>
  );
}
