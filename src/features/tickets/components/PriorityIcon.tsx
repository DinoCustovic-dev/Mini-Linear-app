import { AlertTriangle, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { type TicketPriority, PRIORITY_LABELS } from '@/features/tickets/labels';

const ICONS = {
  low: { Icon: ArrowDown, className: 'text-gray-400' },
  medium: { Icon: Minus, className: 'text-yellow-500' },
  high: { Icon: ArrowUp, className: 'text-orange-500' },
  urgent: { Icon: AlertTriangle, className: 'text-red-600' },
} satisfies Record<
  TicketPriority,
  { Icon: React.ComponentType<{ className?: string }>; className: string }
>;

export default function PriorityIcon({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}) {
  const { Icon, className: color } = ICONS[priority];
  return (
    <span title={`${PRIORITY_LABELS[priority]} priority`} className='inline-flex'>
      <Icon aria-hidden className={cn('size-4', color, className)} />
      <span className='sr-only'>{PRIORITY_LABELS[priority]} priority</span>
    </span>
  );
}
