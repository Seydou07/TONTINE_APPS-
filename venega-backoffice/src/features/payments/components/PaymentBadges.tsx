import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { PAYMENT_STATUS_LABEL, REFUND_STATUS_LABEL, type Payment, type RefundStatus } from '../types';

export function PaymentStatusBadge({ payment }: { payment: Pick<Payment, 'status' | 'matched' | 'direction'> }) {
  if (payment.direction === 'IN' && payment.status === 'COMPLETED' && !payment.matched) return <Badge tone="amber">Reçu, non rattaché</Badge>;
  const tone = payment.status === 'COMPLETED' ? 'green' : payment.status === 'FAILED' ? 'red' : 'amber';
  return <Badge tone={tone}>{PAYMENT_STATUS_LABEL[payment.status]}</Badge>;
}

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const tone = status === 'PAID' ? 'green' : status === 'REJECTED' ? 'neutral' : 'amber';
  return <Badge tone={tone}>{REFUND_STATUS_LABEL[status]}</Badge>;
}
