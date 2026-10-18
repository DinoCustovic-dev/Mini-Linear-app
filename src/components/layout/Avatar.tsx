import * as React from 'react';

import { cn } from '@/lib/utils';

type AvatarProps = {
  name: string;
  src?: string;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Avatar({ name, src, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-primary-100 text-xs font-semibold text-primary-700',
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className='size-full object-cover' />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
    </span>
  );
}
