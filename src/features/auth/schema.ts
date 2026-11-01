import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
// Supabase hešira lozinke pomoću bcrypt-a, koji ignoriše sve nakon 72. znaka.
export const PASSWORD_MAX_LENGTH = 72;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

const fullName = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(80, 'Name must be at most 80 characters');

const newPassword = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters`
  );

export const signUpSchema = z.object({
  fullName,
  email,
  password: newPassword,
});

// Pri prijavi samo provjeravamo da je polje popunjeno.
// Supabase odlučuje da li je lozinka tačna.
export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
