'use server';

import type { AuthError } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ZodError } from 'zod';

import type { ActionResult } from '@/lib/action-result';
import { createClient } from '@/lib/supabase/server';

import {
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema,
} from '@/features/auth/schema';

import { siteConfig } from '@/constant/config';

const HOME_PATH = '/projects';
const LOGIN_PATH = '/login';

const EMAIL_TAKEN: ActionResult<never> = {
  ok: false,
  error: 'An account with this email already exists',
  fieldErrors: { email: ['An account with this email already exists'] },
};

function validationError(error: ZodError): ActionResult<never> {
  const { formErrors, fieldErrors } = error.flatten();
  return {
    ok: false,
    error: formErrors[0] ?? 'Please fix the highlighted fields',
    fieldErrors: fieldErrors as Record<string, string[]>,
  };
}

/** Pretvara Supabase grešku u poruku koju korisnik može razumjeti. */
function authError(error: AuthError): ActionResult<never> {
  switch (error.code) {
    case 'invalid_credentials':
      // Ista poruka za "nema takvog korisnika" i "pogrešna lozinka" namjerno,
      // da niko preko forme za prijavu ne može saznati ko ima nalog.
      return { ok: false, error: 'Wrong email or password' };
    case 'user_already_exists':
    case 'email_exists':
      return EMAIL_TAKEN;
    case 'weak_password':
      return {
        ok: false,
        error: 'This password is too weak, please choose a stronger one',
        fieldErrors: { password: ['Please choose a stronger password'] },
      };
    case 'email_not_confirmed':
      return {
        ok: false,
        error: 'Please confirm your email first, then log in',
      };
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return {
        ok: false,
        error: 'Too many attempts, please wait a moment and try again',
      };
    default:
      return { ok: false, error: 'Something went wrong, please try again' };
  }
}

/**
 * Kreira nalog. Ime se upisuje u korisničke metapodatke kao `full_name`,
 * a okidač (trigger) u bazi ga kopira u tabelu `profiles`.
 *
 * Lokalno je potvrda emaila isključena, pa je korisnik odmah prijavljen
 * i šalje se na stranicu projekata. Ako je potvrda uključena (npr. na
 * hostovanom Supabase projektu), umjesto toga se vraća
 * `needsEmailConfirmation`, a forma treba reći korisniku da provjeri inbox.
 */
export async function signUp(
  input: SignUpInput
): Promise<ActionResult<{ needsEmailConfirmation: true }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { fullName, email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteConfig.url}/auth/callback`,
    },
  });

  if (error) return authError(error);

  // Kad je potvrda uključena, Supabase krije da je email zauzet tako što
  // vraća lažnog korisnika bez identiteta.
  if (data.user?.identities?.length === 0) return EMAIL_TAKEN;

  if (!data.session) {
    return { ok: true, data: { needsEmailConfirmation: true } };
  }

  revalidatePath('/', 'layout');
  redirect(HOME_PATH);
}

/** Prijava emailom i lozinkom. Nakon uspjeha korisnik ide na /projects. */
export async function signIn(
  input: SignInInput
): Promise<ActionResult<never>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return authError(error);

  revalidatePath('/', 'layout');
  redirect(HOME_PATH);
}

/**
 * Odjavljuje samo ovaj preglednik (ostali uređaji ostaju prijavljeni), pa
 * šalje korisnika na /login. Može se koristiti direktno kao form action:
 * <form action={signOut}>.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });

  revalidatePath('/', 'layout');
  redirect(LOGIN_PATH);
}
