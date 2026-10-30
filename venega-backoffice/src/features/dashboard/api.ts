/**
 * Tableau de bord « à traiter ». Chaque chiffre est calculé à partir des données
 * (mock pour l'instant) : aucun indicateur n'est saisi à la main.
 */
import { db, clone, latency } from '@/mocks/db';
import { isUnmatched } from '@/features/payments/api';

export interface WorkQueue {
  kyc: { pending: number; oldestSubmittedAt?: string; olderThan48h: number; flagged: number };
  payments: { unmatched: number; unmatchedAmount: number; pending: number; failedLast24h: number };
  refunds: { open: number; amount: number };
  payouts: { overdue: number; failed: number; amount: number };
  contributions: { late: number; circles: number };
  requests: { pending: number; contestedExclusions: number };
  solidarity: { approvedNotDisbursed: number; blockedVotes: number };
  fundraisers: { reported: number; pending: number; unfrozenReported: number };
  tickets: { active: number; high: number; unassigned: number };
  alerts: { open: number; critical: number };
  accounts: { locked: number; otpFailing: number; suspended: number };
}

const DAY = 86_400_000;

// TODO API: GET /api/v1/admin/dashboard/work-queue
export async function getWorkQueue(): Promise<WorkQueue> {
  await latency();
  const now = Date.now();
  const pendingKyc = db.kycSubmissions.filter((s) => s.status === 'PENDING').sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const unmatched = db.payments.filter(isUnmatched);
  const overduePayouts = db.payouts.filter((p) => p.status === 'FAILED' || (p.status === 'READY' && new Date(p.dueDate).getTime() < now - 2 * DAY));
  const lateCells = db.contributions.filter((c) => {
    if (c.status !== 'LATE') return false;
    const circle = db.circles.find((x) => x.id === c.circleId);
    return circle?.members.some((m) => m.userId === c.userId && m.status === 'ACTIVE');
  });
  const reported = db.fundraisers.filter((f) => f.reports.length > 0 && f.status !== 'CLOSED');
  const activeTickets = db.tickets.filter((t) => t.status !== 'RESOLVED');
  const openAlerts = db.alerts.filter((a) => a.status === 'OPEN');
  const openRefunds = db.refunds.filter((r) => r.status === 'REQUESTED' || r.status === 'APPROVED');
  return clone({
    kyc: {
      pending: pendingKyc.length,
      oldestSubmittedAt: pendingKyc[0]?.submittedAt,
      olderThan48h: pendingKyc.filter((s) => new Date(s.submittedAt).getTime() < now - 2 * DAY).length,
      flagged: pendingKyc.filter((s) => s.flags.length > 0).length,
    },
    payments: {
      unmatched: unmatched.length,
      unmatchedAmount: unmatched.reduce((n, p) => n + p.amount, 0),
      pending: db.payments.filter((p) => p.status === 'PENDING').length,
      failedLast24h: db.payments.filter((p) => p.status === 'FAILED' && new Date(p.createdAt).getTime() >= now - DAY).length,
    },
    refunds: { open: openRefunds.length, amount: openRefunds.reduce((n, r) => n + r.amount, 0) },
    payouts: {
      overdue: overduePayouts.length,
      failed: overduePayouts.filter((p) => p.status === 'FAILED').length,
      amount: overduePayouts.reduce((n, p) => n + p.amount, 0),
    },
    contributions: { late: lateCells.length, circles: new Set(lateCells.map((c) => c.circleId)).size },
    requests: {
      pending: db.requests.filter((r) => r.status === 'PENDING').length,
      contestedExclusions: db.requests.filter((r) => r.type === 'EXCLUSION' && r.contested && r.status === 'APPROVED').length,
    },
    solidarity: {
      approvedNotDisbursed: db.solidarityRequests.filter((r) => r.status === 'APPROVED').length,
      blockedVotes: db.solidarityRequests.filter((r) => r.status === 'VOTING' && new Date(r.voteDeadline).getTime() < now).length,
    },
    fundraisers: {
      reported: reported.length,
      pending: db.fundraisers.filter((f) => f.status === 'PENDING').length,
      unfrozenReported: reported.filter((f) => !f.withdrawalsFrozen).length,
    },
    tickets: {
      active: activeTickets.length,
      high: activeTickets.filter((t) => t.priority === 'HIGH').length,
      unassigned: activeTickets.filter((t) => !t.assignee).length,
    },
    alerts: { open: openAlerts.length, critical: openAlerts.filter((a) => a.severity === 'CRITICAL').length },
    accounts: {
      locked: db.users.filter((u) => u.security.lockedUntil && new Date(u.security.lockedUntil).getTime() > now).length,
      otpFailing: db.users.filter((u) => u.security.lastOtpDelivery === 'FAILED').length,
      suspended: db.users.filter((u) => u.accountStatus === 'SUSPENDED').length,
    },
  });
}
