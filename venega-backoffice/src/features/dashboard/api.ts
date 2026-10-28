/**
 * Indicateurs du tableau de bord. Données mock locales tant que l'API admin n'existe pas.
 */
import { db, clone, latency } from '@/mocks/db';

export interface DashboardStats {
  users: { total: number; verified: number; suspended: number; newLast30d: number };
  kycPending: number;
  circles: { active: number; total: number; latePayments: number };
  fundraisers: { active: number; pending: number; reported: number; collectedActive: number };
  alerts: { open: number; critical: number };
  monthlyVolume: { month: string; volume: number }[];
}

// TODO API: GET /api/v1/admin/dashboard/stats
export async function getDashboardStats(): Promise<DashboardStats> {
  await latency();
  const since30 = Date.now() - 30 * 24 * 3600_000;
  const activeFundraisers = db.fundraisers.filter((f) => f.status === 'ACTIVE');
  const openAlerts = db.alerts.filter((a) => a.status === 'OPEN');
  return clone({
    users: {
      total: db.users.length,
      verified: db.users.filter((u) => u.kycStatus === 'VERIFIED').length,
      suspended: db.users.filter((u) => u.accountStatus === 'SUSPENDED').length,
      newLast30d: db.users.filter((u) => new Date(u.createdAt).getTime() >= since30).length,
    },
    kycPending: db.kycSubmissions.filter((s) => s.status === 'PENDING').length,
    circles: {
      active: db.circles.filter((c) => c.status === 'ACTIVE').length,
      total: db.circles.length,
      latePayments: db.circles.reduce((n, c) => n + c.latePayments, 0),
    },
    fundraisers: {
      active: activeFundraisers.length,
      pending: db.fundraisers.filter((f) => f.status === 'PENDING').length,
      reported: db.fundraisers.filter((f) => f.reports.length > 0 && f.status !== 'CLOSED').length,
      collectedActive: activeFundraisers.reduce((n, f) => n + f.collected, 0),
    },
    alerts: { open: openAlerts.length, critical: openAlerts.filter((a) => a.severity === 'CRITICAL').length },
    monthlyVolume: db.monthlyVolume,
  });
}
