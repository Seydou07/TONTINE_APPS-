import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { TICKET_PRIORITY_LABEL, TICKET_STATUS_LABEL, type TicketPriority, type TicketStatus } from '../types';

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={status === 'RESOLVED' ? 'green' : status === 'IN_PROGRESS' ? 'amber' : 'neutral'}>{TICKET_STATUS_LABEL[status]}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  if (priority === 'NORMAL') return <span className="text-sm text-ink-muted">{TICKET_PRIORITY_LABEL.NORMAL}</span>;
  return <Badge tone={priority === 'HIGH' ? 'red' : 'neutral'}>{TICKET_PRIORITY_LABEL[priority]}</Badge>;
}
