'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import Avatar from './Avatar';

import type { CurrentUser } from '@/types/project';

type UserMenuProps = {
  user: CurrentUser;
};

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className='relative'>
      <button
        type='button'
        aria-haspopup='menu'
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex items-center gap-2 rounded-md p-1 text-sm text-gray-700 md:text-sm',
          'hover:bg-gray-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
      >
        <Avatar name={user.name} src={user.avatarUrl} />
        <span className='hidden max-w-40 truncate font-medium sm:inline'>
          {user.name}
        </span>
        <ChevronDown className='size-4 text-gray-500' />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role='menu'
          className='absolute right-0 z-30 mt-1 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg'
        >
          <div className='border-b border-gray-100 px-3 py-2'>
            <p className='truncate text-sm font-medium text-gray-900 md:text-sm'>
              {user.name}
            </p>
            <p className='truncate text-xs text-gray-500 md:text-xs'>
              {user.email}
            </p>
          </div>
          {/* TODO(ML-05): call the logout server action */}
          <button
            type='button'
            role='menuitem'
            onClick={() => setIsOpen(false)}
            className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden md:text-sm'
          >
            <LogOut className='size-4' />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
