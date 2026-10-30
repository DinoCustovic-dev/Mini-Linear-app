import type { Enums } from '@/types/database.types';

export type TicketStatus = Enums<'ticket_status'>;
export type TicketPriority = Enums<'ticket_priority'>;

export const STATUS_LABELS: Record<TicketStatus, string> = {
  todo: 'Todo',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

/** Name to show for a profile, falling back to the email. */
export function displayName(
  profile: { full_name: string | null; email: string | null } | null
) {
  if (!profile) return 'Unassigned';
  return profile.full_name || profile.email || 'Unknown user';
}
