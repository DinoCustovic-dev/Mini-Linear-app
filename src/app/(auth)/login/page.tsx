import type { Metadata } from 'next';

import LoginForm from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  // /auth/callback šalje ovamo kad je link iz emaila neispravan ili istekao
  const initialError =
    error === 'auth_callback'
      ? 'That link is invalid or has expired. Please log in, or sign up again.'
      : undefined;

  return (
    <>
      <div className='space-y-1 text-center'>
        <h1 className='text-xl font-semibold text-gray-900'>
          Log in to your account
        </h1>
        <p className='text-sm text-gray-600'>
          Welcome back. Enter your details to continue.
        </p>
      </div>
      <LoginForm initialError={initialError} />
    </>
  );
}
