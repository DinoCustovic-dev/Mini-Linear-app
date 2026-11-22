'use client';

import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import Avatar from '@/components/layout/Avatar';

import { displayName } from '@/features/tickets/labels';

export type Person = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type AssigneePickerProps = {
  profiles: Person[];
  value: string | null;
  onChange: (assigneeId: string | null) => void;
  disabled?: boolean;
  id?: string;
};

/** Dropdown that shows an avatar next to each name (a native select cannot). */
export default function AssigneePicker({
  profiles,
  value,
  onChange,
  disabled,
  id,
}: AssigneePickerProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = profiles.find((profile) => profile.id === value) ?? null;

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function choose(assigneeId: string | null) {
    onChange(assigneeId);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className='relative'
      onKeyDown={(event) => {
        // Escape closes the list only, not the dialog around it.
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        id={id}
        type='button'
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex w-full items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-left text-sm',
          'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {selected ? (
          <>
            <Avatar
              name={displayName(selected)}
              src={selected.avatar_url ?? undefined}
              className='size-5 text-[10px]'
            />
            <span className='truncate'>{displayName(selected)}</span>
          </>
        ) : (
          <span className='text-gray-500'>Unassigned</span>
        )}
        <ChevronDown aria-hidden className='ml-auto size-4 text-gray-500' />
      </button>

      {open && (
        <ul
          role='listbox'
          className='absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg'
        >
          <Option selected={value === null} onSelect={() => choose(null)}>
            <span className='text-gray-500'>Unassigned</span>
          </Option>
          {profiles.map((profile) => (
            <Option
              key={profile.id}
              selected={profile.id === value}
              onSelect={() => choose(profile.id)}
            >
              <Avatar
                name={displayName(profile)}
                src={profile.avatar_url ?? undefined}
                className='size-5 text-[10px]'
              />
              <span className='truncate'>{displayName(profile)}</span>
            </Option>
          ))}
        </ul>
      )}
    </div>
  );
}

function Option({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <li role='option' aria-selected={selected}>
      <button
        type='button'
        onClick={onSelect}
        className='flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden'
      >
        {children}
        {selected && <Check aria-hidden className='ml-auto size-4' />}
      </button>
    </li>
  );
}
