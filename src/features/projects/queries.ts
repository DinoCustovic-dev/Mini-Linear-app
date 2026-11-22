import { createClient } from '@/lib/supabase/server';

import { projectKeySchema } from '@/features/projects/schema';

// `tickets (count)` returns [{ count }], which is mapped to ticketCount below.
const PROJECT_SELECT =
  'id, name, key, description, created_by, created_at, updated_at, tickets (count)';

/**
 * All projects, sorted by name, with the number of tickets in each.
 */
export async function listProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .order('name', { ascending: true });

  if (error) throw error;

  return data.map(({ tickets, ...project }) => ({
    ...project,
    ticketCount: tickets[0]?.count ?? 0,
  }));
}

export type ProjectSummary = Awaited<ReturnType<typeof listProjects>>[number];

/**
 * One project by its key, e.g. "FT". The key is case-insensitive.
 * Returns null when the key is invalid or the project does not exist, so the
 * page can call notFound().
 */
export async function getProjectByKey(key: string) {
  const parsed = projectKeySchema.safeParse(key);
  if (!parsed.success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('key', parsed.data)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { tickets, ...project } = data;
  return { ...project, ticketCount: tickets[0]?.count ?? 0 };
}

export type ProjectDetail = NonNullable<
  Awaited<ReturnType<typeof getProjectByKey>>
>;
