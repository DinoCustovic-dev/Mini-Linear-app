import { Menu } from 'lucide-react';
import * as React from 'react';

import IconButton from '@/components/buttons/IconButton';

import UserMenu from './UserMenu';

import type { CurrentUser } from '@/types/project';

type HeaderProps = {
  user: CurrentUser;
  onMenuClick: () => void;
};

export default function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className='sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4'>
      <IconButton
        variant='light'
        icon={Menu}
        aria-label='Open navigation'
        onClick={onMenuClick}
        className='lg:hidden'
      />
      <div className='ml-auto'>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
