export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'OPEN' | 'RESOLVED';

export type AlertType =
  | 'FAILED_PAYMENTS'
  | 'DUPLICATE_DOCUMENT'
  | 'FUNDRAISER_REPORTED'
  | 'UNUSUAL_WITHDRAWAL'
  | 'SHARED_DEVICE';

export interface AlertSubject {
  kind: 'user' | 'fundraiser' | 'circle';
  id: string;
  label: string;
}

export interface FraudAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  subjects: AlertSubject[];
  createdAt: string;
  status: AlertStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  FAILED_PAYMENTS: 'Paiements échoués',
  DUPLICATE_DOCUMENT: 'CNIB en double',
  FUNDRAISER_REPORTED: 'Cagnotte signalée',
  UNUSUAL_WITHDRAWAL: 'Retrait inhabituel',
  SHARED_DEVICE: 'Appareil partagé',
};

export const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  CRITICAL: 'Critique',
  HIGH: 'Élevée',
  MEDIUM: 'Moyenne',
  LOW: 'Faible',
};

export const SEVERITY_ORDER: Record<AlertSeverity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
