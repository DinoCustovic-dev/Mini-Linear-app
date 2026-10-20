import { createClient } from '@/lib/supabase/server';

/**
 * Every user, for assignee pickers. Sorted by name, users without one last.
 */
export async function listProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .order('full_name', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

export type ProfileSummary = Awaited<ReturnType<typeof listProfiles>>[number];
