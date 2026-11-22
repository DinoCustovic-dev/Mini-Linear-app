import { createClient } from '@/lib/supabase/server';

/**
 * All labels of a project, alphabetically.
 */
export async function listLabels(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('labels')
    .select('id, name, color, project_id')
    .eq('project_id', projectId)
    .order('name');

  if (error) throw error;
  return data;
}

export type Label = Awaited<ReturnType<typeof listLabels>>[number];
