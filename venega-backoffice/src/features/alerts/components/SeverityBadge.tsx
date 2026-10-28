import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { SEVERITY_LABEL, type AlertSeverity } from '../types';

const TONE = { CRITICAL: 'red', HIGH: 'red', MEDIUM: 'amber', LOW: 'neutral' } as const;

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <Badge tone={TONE[severity]} className={severity === 'CRITICAL' ? 'border-danger bg-danger text-white' : undefined}>
      {SEVERITY_LABEL[severity]}
    </Badge>
  );
}
