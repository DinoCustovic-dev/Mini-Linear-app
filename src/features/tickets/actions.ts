'use server';

import type { PostgrestError } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { ZodError } from 'zod';

import type { ActionResult } from '@/lib/action-result';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

import {
  type CreateTicketInput,
  type UpdateTicketInput,
  createTicketSchema,
  ticketIdSchema,
  updateTicketSchema,
} from '@/features/tickets/schema';

import type { TablesUpdate } from '@/types/database.types';

export type TicketRef = {
  id: string;
  number: number;
  projectKey: string;
  /** Readable id shown in the UI, e.g. "FT-16" */
  identifier: string;
};

const TICKET_REF_SELECT = 'id, number, project:projects (key)';

function toRef(row: {
  id: string;
  number: number;
  project: { key: string };
}): TicketRef {
  return {
    id: row.id,
    number: row.number,
    projectKey: row.project.key,
    identifier: `${row.project.key}-${row.number}`,
  };
}

function validationError(error: ZodError): ActionResult<never> {
  const { formErrors, fieldErrors } = error.flatten();
  return {
    ok: false,
    error: formErrors[0] ?? 'Please fix the highlighted fields',
    fieldErrors: fieldErrors as Record<string, string[]>,
  };
}

function databaseError(error: PostgrestError): ActionResult<never> {
  // 23503: foreign key violation (project or assignee no longer exists)
  if (error.code === '23503') {
    return { ok: false, error: 'The project or assignee no longer exists' };
  }
  // 42501: blocked by grants or row level security
  if (error.code === '42501') {
    return { ok: false, error: 'You are not allowed to do that' };
  }
  return { ok: false, error: 'Something went wrong, please try again' };
}

const NOT_LOGGED_IN: ActionResult<never> = {
  ok: false,
  error: 'You must be logged in',
};
const NOT_FOUND: ActionResult<never> = {
  ok: false,
  error: 'Ticket not found',
};

/** Board, list, detail and settings live under the project path. */
function revalidateProject(projectKey: string) {
  revalidatePath(`/projects/${projectKey}`, 'layout');
  revalidatePath('/projects');
  revalidatePath('/my-issues');
}

/**
 * Creates a ticket. The reporter is the current user and the number is the
 * next one in the project; both are set by the database.
 */
export async function createTicket(
  input: CreateTicketInput
): Promise<ActionResult<TicketRef>> {
  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const { projectId, title, description, status, priority, assigneeId } =
    parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      project_id: projectId,
      title,
      description: description ?? null,
      status,
      priority,
      assignee_id: assigneeId ?? null,
    })
    .select(TICKET_REF_SELECT)
    .single();

  if (error) return databaseError(error);

  const ref = toRef(data);
  revalidateProject(ref.projectKey);
  return { ok: true, data: ref };
}

/**
 * Updates only the fields that are passed. updated_at is set by the database.
 */
export async function updateTicket(
  ticketId: string,
  input: UpdateTicketInput
): Promise<ActionResult<TicketRef>> {
  const id = ticketIdSchema.safeParse(ticketId);
  if (!id.success) return NOT_FOUND;

  const parsed = updateTicketSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const { title, description, status, priority, assigneeId } = parsed.data;
  const changes: TablesUpdate<'tickets'> = {};
  if (title !== undefined) changes.title = title;
  if (description !== undefined) changes.description = description;
  if (status !== undefined) changes.status = status;
  if (priority !== undefined) changes.priority = priority;
  if (assigneeId !== undefined) changes.assignee_id = assigneeId;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .update(changes)
    .eq('id', id.data)
    .select(TICKET_REF_SELECT)
    .maybeSingle();

  if (error) return databaseError(error);
  if (!data) return NOT_FOUND;

  const ref = toRef(data);
  revalidateProject(ref.projectKey);
  return { ok: true, data: ref };
}

export async function deleteTicket(
  ticketId: string
): Promise<ActionResult<TicketRef>> {
  const id = ticketIdSchema.safeParse(ticketId);
  if (!id.success) return NOT_FOUND;

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id.data)
    .select(TICKET_REF_SELECT)
    .maybeSingle();

  if (error) return databaseError(error);
  if (!data) return NOT_FOUND;

  const ref = toRef(data);
  revalidateProject(ref.projectKey);
  return { ok: true, data: ref };
}
