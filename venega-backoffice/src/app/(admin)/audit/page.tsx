import { redirect } from 'next/navigation';

/** Ancienne URL : le journal d'audit est désormais sur /journal. */
export default function LegacyAuditPage() {
  redirect('/journal');
}
