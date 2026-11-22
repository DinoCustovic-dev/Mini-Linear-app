'use server';

import type { PostgrestError } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { ZodError } from 'zod';

import type { ActionResult } from '@/lib/action-result';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

import {
  type CreateProjectInput,
  type UpdateProjectInput,
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from '@/features/projects/schema';

export type ProjectRef = {
  id: string;
  key: string;
  name: string;
};

const PROJECT_REF_SELECT = 'id, key, name';

const NOT_LOGGED_IN: ActionResult<never> = {
  ok: false,
  error: 'You must be logged in',
};
const NOT_FOUND: ActionResult<never> = {
  ok: false,
  error: 'Project not found',
};

function validationError(error: ZodError): ActionResult<never> {
  const { formErrors, fieldErrors } = error.flatten();
  return {
    ok: false,
    error: formErrors[0] ?? 'Please fix the highlighted fields',
    fieldErrors: fieldErrors as Record<string, string[]>,
  };
}

function databaseError(error: PostgrestError): ActionResult<never> {
  // 23505: unique violation, the only unique column a client writes is key
  if (error.code === '23505') {
    const message = 'A project with this key already exists';
    return { ok: false, error: message, fieldErrors: { key: [message] } };
  }
  // 42501: blocked by grants or row level security
  if (error.code === '42501') {
    return { ok: false, error: 'You are not allowed to do that' };
  }
  return { ok: false, error: 'Something went wrong, please try again' };
}

/** Lists, boards and settings read the project, so refresh them all. */
function revalidateProject(key: string) {
  revalidatePath('/projects');
  revalidatePath(`/projects/${key}`, 'layout');
  revalidatePath('/my-issues');
}

/**
 * Creates a project. The creator is the current user (set by the database)
 * and is the only one who can delete it later.
 */
export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<ProjectRef>> {
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert(parsed.data)
    .select(PROJECT_REF_SELECT)
    .single();

  if (error) return databaseError(error);

  revalidateProject(data.key);
  return { ok: true, data };
}

/**
 * Renames a project. Only the name can change, never the key.
 */
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<ActionResult<ProjectRef>> {
  const id = projectIdSchema.safeParse(projectId);
  if (!id.success) return NOT_FOUND;

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .update({ name: parsed.data.name })
    .eq('id', id.data)
    .select(PROJECT_REF_SELECT)
    .maybeSingle();

  if (error) return databaseError(error);
  if (!data) return NOT_FOUND;

  revalidateProject(data.key);
  return { ok: true, data };
}

/**
 * Deletes a project and, through the foreign key cascade, all of its tickets.
 * Only the creator may do it. When row level security hides the row, the
 * database reports success with zero rows, so that case is checked explicitly.
 */
export async function deleteProject(
  projectId: string
): Promise<ActionResult<ProjectRef>> {
  const id = projectIdSchema.safeParse(projectId);
  if (!id.success) return NOT_FOUND;

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id.data)
    .select(PROJECT_REF_SELECT)
    .maybeSingle();

  if (error) return databaseError(error);

  if (!data) {
    // Nothing was deleted: either it does not exist or it is not ours.
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id.data)
      .maybeSingle();

    if (!existing) return NOT_FOUND;
    return {
      ok: false,
      error: 'Only the creator of a project can delete it',
    };
  }

  revalidateProject(data.key);
  return { ok: true, data };
}
