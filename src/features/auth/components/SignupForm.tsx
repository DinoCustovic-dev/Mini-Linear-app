'use client';

import * as React from 'react';

import Button from '@/components/buttons/Button';
import PrimaryLink from '@/components/links/PrimaryLink';

import { signUp } from '@/features/auth/actions';
import AuthField from '@/features/auth/components/AuthField';
import FormAlert from '@/features/auth/components/FormAlert';
import { PASSWORD_MIN_LENGTH, signUpSchema } from '@/features/auth/schema';

type FieldErrors = Record<string, string[] | undefined>;

export default function SignupForm() {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  // Email koji je dobio link za potvrdu (samo kad je potvrda uključena u Supabaseu)
  const [confirmationEmail, setConfirmationEmail] = React.useState<
    string | null
  >(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Zaštita od dvostrukog submita (Enter ili dupli klik dok traje zahtjev)
    if (isPending) return;

    // Ista zod šema kao na serveru, pa greške stignu odmah, bez poziva servera
    const parsed = signUpSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    startTransition(async () => {
      const result = await signUp(parsed.data);
      // Kad je potvrda emaila isključena, akcija odmah prijavljuje korisnika
      // i preusmjerava na /projects, pa ovdje stižemo samo u ostalim slučajevima.
      if (result.ok) {
        setConfirmationEmail(parsed.data.email);
      } else {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.error);
      }
    });
  }

  if (confirmationEmail) {
    return (
      <div className='space-y-4'>
        <FormAlert variant='success'>
          Check your inbox. We sent a confirmation link to{' '}
          <strong>{confirmationEmail}</strong>.
        </FormAlert>
        <p className='text-center text-sm text-gray-600'>
          Once you have confirmed your email,{' '}
          <PrimaryLink href='/login'>log in</PrimaryLink>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      {formError && <FormAlert>{formError}</FormAlert>}

      <AuthField
        label='Name'
        name='fullName'
        type='text'
        autoComplete='name'
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        readOnly={isPending}
        error={fieldErrors.fullName?.[0]}
      />
      <AuthField
        label='Email'
        name='email'
        type='email'
        inputMode='email'
        autoComplete='email'
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        readOnly={isPending}
        error={fieldErrors.email?.[0]}
      />
      <AuthField
        label='Password'
        name='password'
        type='password'
        autoComplete='new-password'
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        readOnly={isPending}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters`}
        error={fieldErrors.password?.[0]}
      />

      <Button
        type='submit'
        isLoading={isPending}
        className='w-full justify-center py-2'
      >
        Create account
      </Button>

      <p className='text-center text-sm text-gray-600'>
        Already have an account? <PrimaryLink href='/login'>Log in</PrimaryLink>
      </p>
    </form>
  );
}
