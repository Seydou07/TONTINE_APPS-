import type { Metadata } from 'next';
import { AuditView } from '@/features/audit/components/AuditView';

export const metadata: Metadata = { title: 'Journal' };

export default function JournalPage() {
  return <AuditView />;
}
