import * as React from 'react';

import { cn } from '@/lib/utils';

type AuthFieldProps = {
  label: string;
  /** Poruka greške koja se prikazuje ispod polja. */
  error?: string;
  /** Pomoćni tekst ispod polja, vidljiv dok nema greške. */
  hint?: string;
} & Omit<React.ComponentPropsWithoutRef<'input'>, 'id'>;

/**
 * Polje forme: labela, input i poruka greške ispod njega.
 * Labela je povezana s inputom, a greška s `aria-describedby`,
 * pa je forma upotrebljiva i s čitačem ekrana.
 */
export default function AuthField({
  label,
  error,
  hint,
  className,
  ...rest
}: AuthFieldProps) {
  const id = React.useId();
  const messageId = `${id}-message`;

  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          // text-base na mobilnom sprečava da iOS automatski zumira polje
          'mt-1 block w-full rounded-md border-gray-300 text-base shadow-xs sm:text-sm',
          'focus:border-primary-500 focus:ring-primary-500',
          'read-only:bg-gray-50 read-only:text-gray-500',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...rest}
      />
      {error ? (
        <p id={messageId} className='mt-1 text-sm text-red-600'>
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className='mt-1 text-sm text-gray-500'>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
