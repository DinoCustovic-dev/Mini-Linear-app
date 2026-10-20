import { z } from 'zod';

import { Constants } from '@/types/database.types';

export const TICKET_STATUSES = Constants.public.Enums.ticket_status;
export const TICKET_PRIORITIES = Constants.public.Enums.ticket_priority;

// Limits mirror the check constraints in the tickets table.
const title = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be at most 200 characters');

// Empty text is stored as null so "no description" has one representation.
const description = z
  .string()
  .trim()
  .max(10000, 'Description must be at most 10000 characters')
  .nullable()
  .transform((value) => (value ? value : null));

const status = z.enum(TICKET_STATUSES);
const priority = z.enum(TICKET_PRIORITIES);
const assigneeId = z.string().uuid('Invalid assignee').nullable();

export const createTicketSchema = z.object({
  projectId: z.string().uuid('Invalid project'),
  title,
  description: description.optional(),
  status: status.default('todo'),
  priority: priority.default('medium'),
  assigneeId: assigneeId.optional(),
});

export const updateTicketSchema = z
  .object({
    title,
    description,
    status,
    priority,
    assigneeId,
  })
  .partial()
  .refine((fields) => Object.values(fields).some((v) => v !== undefined), {
    message: 'Nothing to update',
  });

export const ticketIdSchema = z.string().uuid('Invalid ticket');

export type CreateTicketInput = z.input<typeof createTicketSchema>;
export type UpdateTicketInput = z.input<typeof updateTicketSchema>;
