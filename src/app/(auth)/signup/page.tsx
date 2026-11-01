import type { Metadata } from 'next';

import SignupForm from '@/features/auth/components/SignupForm';

export const metadata: Metadata = {
  title: 'Sign up',
};

export default function SignupPage() {
  return (
    <>
      <div className='space-y-1 text-center'>
        <h1 className='text-xl font-semibold text-gray-900'>
          Create your account
        </h1>
        <p className='text-sm text-gray-600'>
          Start tracking issues with your team.
        </p>
      </div>
      <SignupForm />
    </>
  );
}
