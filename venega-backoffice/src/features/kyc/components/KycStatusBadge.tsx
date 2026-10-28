import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { KYC_STATUS_LABEL, type KycStatus } from '@/features/users/types';

const TONE = { NOT_SUBMITTED: 'neutral', PENDING: 'amber', VERIFIED: 'green', REJECTED: 'red' } as const;

export function KycStatusBadge({ status }: { status: KycStatus }) {
  return <Badge tone={TONE[status]}>{KYC_STATUS_LABEL[status]}</Badge>;
}
