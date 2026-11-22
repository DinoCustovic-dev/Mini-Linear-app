'use server';

import type { PostgrestError } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { ZodError } from 'zod';

import type { ActionResult } from '@/lib/action-result';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

import {
  type CreateLabelInput,
  createLabelSchema,
  idSchema,
} from '@/features/labels/schema';

export type LabelRef = {
  id: string;
  name: string;
  color: string;
  project_id: string;
};

const LABEL_SELECT = 'id, name, color, project_id';

const NOT_LOGGED_IN: ActionResult<never> = {
  ok: false,
  error: 'You must be logged in',
};
const NOT_FOUND: ActionResult<never> = {
  ok: false,
  error: 'Label not found',
};

function validationError(error: ZodError): ActionResult<never> {
  const { formErrors, fieldErrors } = error.flatten();
  return {
    ok: false,
    error: formErrors[0] ?? 'Please fix the highlighted fields',
    fieldErrors: fieldErrors as Record<string, string[]>,
  };
}

function databaseError(
  error: PostgrestError,
  duplicate: { message: string; field?: string }
): ActionResult<never> {
  // 23505: unique violation (same name in a project, same label on a ticket)
  if (error.code === '23505') {
    return {
      ok: false,
      error: duplicate.message,
      ...(duplicate.field && {
        fieldErrors: { [duplicate.field]: [duplicate.message] },
      }),
    };
  }
  // 23503: the project, ticket or label no longer exists
  if (error.code === '23503') return NOT_FOUND;
  // 42501: blocked by grants or row level security (for example a label of
  // another project being put on a ticket)
  if (error.code === '42501') {
    return { ok: false, error: 'You are not allowed to do that' };
  }
  return { ok: false, error: 'Something went wrong, please try again' };
}

/** Labels show up on boards, lists and ticket pages, so refresh them all. */
function revalidateLabels() {
  revalidatePath('/projects', 'layout');
  revalidatePath('/my-issues');
}

/**
 * Creates a label inside a project. Names are unique per project.
 */
export async function createLabel(
  projectId: string,
  input: CreateLabelInput
): Promise<ActionResult<LabelRef>> {
  const project = idSchema.safeParse(projectId);
  if (!project.success) return { ok: false, error: 'Project not found' };

  const parsed = createLabelSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('labels')
    .insert({ ...parsed.data, project_id: project.data })
    .select(LABEL_SELECT)
    .single();

  if (error) {
    return databaseError(error, {
      message: 'This project already has a label with that name',
      field: 'name',
    });
  }

  revalidateLabels();
  return { ok: true, data };
}

/**
 * Deletes a label. The foreign key cascade removes it from every ticket.
 */
export async function deleteLabel(
  labelId: string
): Promise<ActionResult<LabelRef>> {
  const id = idSchema.safeParse(labelId);
  if (!id.success) return NOT_FOUND;

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('labels')
    .delete()
    .eq('id', id.data)
    .select(LABEL_SELECT)
    .maybeSingle();

  if (error) return databaseError(error, { message: 'Label already exists' });
  if (!data) return NOT_FOUND;

  revalidateLabels();
  return { ok: true, data };
}

/**
 * Puts a label on a ticket. The label has to belong to the ticket's project
 * (enforced by row level security). Adding it twice gives a readable error.
 */
export async function addLabelToTicket(
  ticketId: string,
  labelId: string
): Promise<ActionResult<{ ticketId: string; labelId: string }>> {
  const ticket = idSchema.safeParse(ticketId);
  const label = idSchema.safeParse(labelId);
  if (!ticket.success || !label.success) {
    return { ok: false, error: 'Ticket or label not found' };
  }

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { error } = await supabase
    .from('ticket_labels')
    .insert({ ticket_id: ticket.data, label_id: label.data });

  if (error) {
    return databaseError(error, {
      message: 'This ticket already has that label',
    });
  }

  revalidateLabels();
  return { ok: true, data: { ticketId: ticket.data, labelId: label.data } };
}

/**
 * Takes a label off a ticket. Removing a label the ticket does not have is
 * reported as not found.
 */
export async function removeLabelFromTicket(
  ticketId: string,
  labelId: string
): Promise<ActionResult<{ ticketId: string; labelId: string }>> {
  const ticket = idSchema.safeParse(ticketId);
  const label = idSchema.safeParse(labelId);
  if (!ticket.success || !label.success) {
    return { ok: false, error: 'Ticket or label not found' };
  }

  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ticket_labels')
    .delete()
    .eq('ticket_id', ticket.data)
    .eq('label_id', label.data)
    .select('ticket_id')
    .maybeSingle();

  if (error) return databaseError(error, { message: 'Label already exists' });
  if (!data)
    return { ok: false, error: 'This ticket does not have that label' };

  revalidateLabels();
  return { ok: true, data: { ticketId: ticket.data, labelId: label.data } };
}
