import { redirect } from 'next/navigation';

import HomePage from '@/app/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('HomePage', () => {
  it('redirects to My issues', () => {
    HomePage();

    expect(redirect).toHaveBeenCalledWith('/my-issues');
  });
});
