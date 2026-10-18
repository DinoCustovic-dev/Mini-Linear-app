import * as React from 'react';

import { getCurrentUser, getProjects } from '@/lib/projects';

import AppShell from '@/components/layout/AppShell';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, user] = await Promise.all([getProjects(), getCurrentUser()]);

  return (
    <AppShell projects={projects} user={user}>
      {children}
    </AppShell>
  );
}
