import { createClient } from '@/lib/supabase/server';

const PROFILE_FIELDS = 'id, full_name, email, avatar_url';

// Two foreign keys point at profiles, so each join names its constraint.
const TICKET_SELECT = `
  *,
  assignee:profiles!tickets_assignee_id_fkey (${PROFILE_FIELDS}),
  reporter:profiles!tickets_reporter_id_fkey (${PROFILE_FIELDS})
` as const;

/**
 * All tickets of a project, newest first.
 */
export async function listTickets(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT)
    .eq('project_id', projectId)
    .order('number', { ascending: false });

  if (error) throw error;
  return data;
}

export type TicketWithPeople = Awaited<ReturnType<typeof listTickets>>[number];

/**
 * One ticket by its readable id, e.g. ("FT", 12) for FT-12.
 * Returns null when the project or ticket does not exist.
 */
export async function getTicket(projectKey: string, number: number) {
  if (!Number.isInteger(number) || number < 1) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select(`${TICKET_SELECT}, project:projects!inner (id, key, name)`)
    .eq('project.key', projectKey.toUpperCase())
    .eq('number', number)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type TicketDetail = NonNullable<Awaited<ReturnType<typeof getTicket>>>;
