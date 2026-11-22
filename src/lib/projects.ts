import {
  createClient,
  getCurrentUser as getAuthUser,
} from '@/lib/supabase/server';

import { listProjects } from '@/features/projects/queries';

import type { CurrentUser, Project } from '@/types/project';

// Projects have no color column, so every key gets a stable one.
const PROJECT_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
  '#ec4899',
];

export function projectColor(key: string) {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PROJECT_COLORS[hash % PROJECT_COLORS.length];
}

export async function getProjects(): Promise<Project[]> {
  const projects = await listProjects();
  return projects.map(({ id, name, key }) => ({
    id,
    name,
    key,
    color: projectColor(key),
  }));
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const user = await getAuthUser();
  if (!user) return { name: 'Guest', email: '' };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const email = profile?.email ?? user.email ?? '';
  return {
    name: profile?.full_name || email || 'User',
    email,
    avatarUrl: profile?.avatar_url ?? undefined,
  };
}
