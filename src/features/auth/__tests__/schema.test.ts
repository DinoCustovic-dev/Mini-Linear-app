/**
 * @jest-environment node
 */
import { signInSchema, signUpSchema } from '@/features/auth/schema';

const validSignUp = {
  fullName: 'Amar Sljivnjak',
  email: 'amar@example.com',
  password: 'longenough1',
};

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    expect(signUpSchema.safeParse(validSignUp).success).toBe(true);
  });

  it('trims the name and lowercases the email', () => {
    const result = signUpSchema.parse({
      ...validSignUp,
      fullName: '  Amar  ',
      email: '  Amar@Example.COM ',
    });
    expect(result.fullName).toBe('Amar');
    expect(result.email).toBe('amar@example.com');
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      password: '1234567',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password?.[0]).toBe(
        'Password must be at least 8 characters'
      );
    }
  });

  it('rejects an empty name and an invalid email', () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      fullName: '   ',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      expect(fieldErrors.fullName?.[0]).toBe('Name is required');
      expect(fieldErrors.email?.[0]).toBe('Enter a valid email address');
    }
  });
});

describe('signInSchema', () => {
  it('accepts an email and any non-empty password', () => {
    expect(
      signInSchema.safeParse({ email: 'amar@example.com', password: 'x' })
        .success
    ).toBe(true);
  });

  it('rejects an empty password', () => {
    expect(
      signInSchema.safeParse({ email: 'amar@example.com', password: '' })
        .success
    ).toBe(false);
  });
});
