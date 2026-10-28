/**
 * Alertes de fraude. Données mock locales tant que l'API admin n'existe pas.
 * Côté serveur, ces alertes seront produites par des règles (paiements échoués,
 * doublons de CNIB, signalements, retraits inhabituels…).
 */
import { db, clone, latency } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { currentActorName } from '@/features/auth/api';
import { recordLocalAction } from '@/features/audit/api';
import { SEVERITY_ORDER, type AlertSeverity, type AlertStatus, type FraudAlert } from './types';

export interface AlertListParams extends ListParams<AlertStatus> {
  severity?: AlertSeverity | 'ALL';
}

// TODO API: GET /api/v1/admin/alerts?status=OPEN&severity=&q=&page=&pageSize=
export async function listAlerts(params: AlertListParams): Promise<Paginated<FraudAlert>> {
  await latency();
  const status = params.status ?? 'OPEN';
  const items = db.alerts
    .filter((a) => status === 'ALL' || a.status === status)
    .filter((a) => !params.severity || params.severity === 'ALL' || a.severity === params.severity)
    .filter((a) => matchesQuery(params.q, a.title, a.description, ...a.subjects.map((s) => s.label)))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.createdAt.localeCompare(a.createdAt));
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: GET /api/v1/admin/alerts/counts
export async function getOpenAlertCounts(): Promise<Record<AlertSeverity, number> & { total: number }> {
  await latency(100);
  const open = db.alerts.filter((a) => a.status === 'OPEN');
  const by = (s: AlertSeverity) => open.filter((a) => a.severity === s).length;
  return { CRITICAL: by('CRITICAL'), HIGH: by('HIGH'), MEDIUM: by('MEDIUM'), LOW: by('LOW'), total: open.length };
}

// TODO API: POST /api/v1/admin/alerts/:id/resolve  { note }
export async function resolveAlert(id: string, note: string): Promise<FraudAlert> {
  await latency();
  const a = db.alerts.find((x) => x.id === id);
  if (!a) throw new Error('Alerte introuvable.');
  if (a.status === 'RESOLVED') throw new Error('Cette alerte est déjà traitée.');
  const clean = note.trim();
  if (clean.length < 3) throw new Error('Indiquez brièvement ce qui a été fait.');
  a.status = 'RESOLVED';
  a.resolvedAt = new Date().toISOString();
  a.resolvedBy = currentActorName();
  a.resolutionNote = clean;
  recordLocalAction({ action: 'Alerte traitée', targetType: 'alert', targetLabel: a.title, detail: clean });
  return clone(a);
}
