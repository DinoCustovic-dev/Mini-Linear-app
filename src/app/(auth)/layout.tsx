import * as React from 'react';

/**
 * Okvir za stranice za neprijavljene korisnike (login, signup): sadržaj
 * centriran u kartici, bez sidebara i headera iz (app) layouta.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-10'>
      <div className='w-full max-w-sm'>
        <p className='mb-6 text-center text-2xl font-bold text-gray-900'>
          Mini Linear
        </p>
        <div className='space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-xs sm:p-8'>
          {children}
        </div>
      </div>
    </main>
  );
}
