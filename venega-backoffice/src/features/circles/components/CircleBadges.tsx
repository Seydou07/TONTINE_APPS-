import React from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  CIRCLE_KIND_LABEL,
  CIRCLE_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  type CircleKind,
  type CircleStatus,
  type MemberPaymentStatus,
} from '../types';

export function CircleKindBadge({ kind }: { kind: CircleKind }) {
  return <Badge tone={kind === 'SOLIDARITY' ? 'amber' : kind === 'NATURE' ? 'neutral' : 'green'}>{CIRCLE_KIND_LABEL[kind]}</Badge>;
}

export function CircleStatusBadge({ status }: { status: CircleStatus }) {
  return <Badge tone={status === 'ACTIVE' ? 'green' : status === 'PAUSED' ? 'amber' : 'neutral'}>{CIRCLE_STATUS_LABEL[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: MemberPaymentStatus }) {
  return <Badge tone={status === 'PAID' ? 'green' : status === 'LATE' ? 'red' : 'amber'}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}
