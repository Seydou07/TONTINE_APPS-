import React from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  CIRCLE_KIND_LABEL,
  CIRCLE_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYOUT_STATUS_LABEL,
  REQUEST_STATUS_LABEL,
  SOLIDARITY_STATUS_LABEL,
  type CircleKind,
  type CircleRequestStatus,
  type CircleStatus,
  type MemberPaymentStatus,
  type PayoutStatus,
  type SolidarityRequestStatus,
} from '../types';

export function CircleKindBadge({ kind }: { kind: CircleKind }) {
  return <Badge tone={kind === 'SOLIDARITY' ? 'amber' : kind === 'NATURE' ? 'neutral' : 'green'}>{CIRCLE_KIND_LABEL[kind]}</Badge>;
}

export function CircleStatusBadge({ status }: { status: CircleStatus }) {
  const tone = status === 'ACTIVE' ? 'green' : status === 'PAUSED' ? 'amber' : status === 'FROZEN' ? 'red' : 'neutral';
  return <Badge tone={tone}>{CIRCLE_STATUS_LABEL[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: MemberPaymentStatus }) {
  return <Badge tone={status === 'PAID' ? 'green' : status === 'LATE' ? 'red' : 'amber'}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}

export function PayoutStatusBadge({ status, overdue }: { status: PayoutStatus; overdue?: boolean }) {
  const tone = status === 'PAID' ? 'green' : status === 'FAILED' || overdue ? 'red' : status === 'READY' || status === 'PROCESSING' ? 'amber' : 'neutral';
  return <Badge tone={tone}>{PAYOUT_STATUS_LABEL[status]}{overdue && status === 'READY' ? ' (en retard)' : ''}</Badge>;
}

export function RequestStatusBadge({ status, contested }: { status: CircleRequestStatus; contested?: boolean }) {
  if (contested) return <Badge tone="red">Contestée</Badge>;
  const tone = status === 'PENDING' ? 'amber' : status === 'APPROVED' ? 'green' : 'neutral';
  return <Badge tone={tone}>{REQUEST_STATUS_LABEL[status]}</Badge>;
}

export function SolidarityStatusBadge({ status, blocked }: { status: SolidarityRequestStatus; blocked?: boolean }) {
  if (blocked) return <Badge tone="red">Vote bloqué</Badge>;
  const tone = status === 'DISBURSED' ? 'green' : status === 'REJECTED' ? 'neutral' : 'amber';
  return <Badge tone={tone}>{SOLIDARITY_STATUS_LABEL[status]}</Badge>;
}
