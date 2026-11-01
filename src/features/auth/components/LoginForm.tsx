'use client';

import * as React from 'react';

import Button from '@/components/buttons/Button';
import PrimaryLink from '@/components/links/PrimaryLink';

import { signIn } from '@/features/auth/actions';
import AuthField from '@/features/auth/components/AuthField';
import FormAlert from '@/features/auth/components/FormAlert';
import { signInSchema } from '@/features/auth/schema';

type FieldErrors = Record<string, string[] | undefined>;

type LoginFormProps = {
  /** Poruka koju treba odmah prikazati, npr. kad je link iz emaila istekao. */
  initialError?: string;
};

export default function LoginForm({ initialError }: LoginFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(
    initialError ?? null
  );
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Zaštita od dvostrukog submita (Enter ili dupli klik dok traje zahtjev)
    if (isPending) return;

    // Ista zod šema kao na serveru, pa greške stignu odmah, bez poziva servera
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    startTransition(async () => {
      const result = await signIn(parsed.data);
      // Kad prijava uspije, akcija preusmjerava na /projects i ovdje ne stižemo.
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      {formError && <FormAlert>{formError}</FormAlert>}

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
        autoComplete='current-password'
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        readOnly={isPending}
        error={fieldErrors.password?.[0]}
      />

      <Button
        type='submit'
        isLoading={isPending}
        className='w-full justify-center py-2'
      >
        Log in
      </Button>

      <p className='text-center text-sm text-gray-600'>
        Don't have an account? <PrimaryLink href='/signup'>Sign up</PrimaryLink>
      </p>
    </form>
  );
}
