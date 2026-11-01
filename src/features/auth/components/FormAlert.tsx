import * as React from 'react';

import { cn } from '@/lib/utils';

type FormAlertProps = {
  variant?: 'error' | 'success';
  children: React.ReactNode;
};

/** Poruka iznad forme: greška koju nije moguće vezati za jedno polje, ili potvrda. */
export default function FormAlert({
  variant = 'error',
  children,
}: FormAlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-md p-3 text-sm',
        variant === 'error' && 'bg-red-50 text-red-700',
        variant === 'success' && 'bg-green-50 text-green-800'
      )}
    >
      {children}
    </div>
  );
}
