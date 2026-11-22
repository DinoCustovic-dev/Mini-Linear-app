import type { CurrentUser, Project } from '@/types/project';

/**
 * Temporary mock data until projects and auth are backed by Supabase.
 * Read only through `@/lib/projects`, so swapping to real data is a one-file change.
 */
export const MOCK_PROJECTS: Project[] = [
  { id: 'web-app', name: 'Web App', key: 'WEB', color: '#6366f1' },
  { id: 'mobile', name: 'Mobile', key: 'MOB', color: '#10b981' },
  { id: 'marketing', name: 'Marketing Site', key: 'MKT', color: '#f59e0b' },
  { id: 'infra', name: 'Infrastructure', key: 'INF', color: '#ef4444' },
];

export const MOCK_USER: CurrentUser = {
  name: 'Alma Basic',
  email: 'alma@example.com',
};
