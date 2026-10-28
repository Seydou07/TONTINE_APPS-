import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { FUNDRAISER_STATUS_LABEL, type FundraiserStatus } from '../types';

const TONE = { PENDING: 'amber', ACTIVE: 'green', SUSPENDED: 'red', CLOSED: 'neutral' } as const;

export function FundraiserStatusBadge({ status }: { status: FundraiserStatus }) {
  return <Badge tone={TONE[status]}>{FUNDRAISER_STATUS_LABEL[status]}</Badge>;
}
