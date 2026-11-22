import { createClient } from '@/lib/supabase/server';

export type ActivityAction =
  | 'created'
  | 'title_changed'
  | 'description_changed'
  | 'status_changed'
  | 'priority_changed'
  | 'assignee_changed'
  | 'label_added'
  | 'label_removed';

/**
 * The history of a ticket, oldest first. Entries are written by database
 * triggers, so every change is logged however it was made.
 *
 * For assignee changes old_value / new_value are profile ids (or null for
 * unassigned); use `assigneeNames` to turn them into names.
 */
export async function listActivity(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ticket_activity')
    .select(
      `
      id, ticket_id, action, old_value, new_value, created_at,
      actor:profiles (id, full_name, email, avatar_url)
    `
    )
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const entries = data.map((entry) => ({
    ...entry,
    action: entry.action as ActivityAction,
  }));

  // Resolve assignee ids once, so the UI can show "Assigned to Ana".
  const ids = new Set<string>();
  for (const entry of entries) {
    if (entry.action !== 'assignee_changed') continue;
    if (entry.old_value) ids.add(entry.old_value);
    if (entry.new_value) ids.add(entry.new_value);
  }

  const assigneeNames: Record<string, string> = {};
  if (ids.size > 0) {
    const { data: people, error: peopleError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', [...ids]);
    if (peopleError) throw peopleError;
    for (const person of people) {
      assigneeNames[person.id] = person.full_name ?? person.email;
    }
  }

  return { entries, assigneeNames };
}

export type ActivityEntry = Awaited<
  ReturnType<typeof listActivity>
>['entries'][number];
