'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: Toast = { id, type, title, message, duration: 4000 };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), toast.duration!);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${bgMap[toast.type]}`}
        >
          <div className="shrink-0 mt-0.5">{iconMap[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900">{toast.title}</p>
            {toast.message && <p className="text-[12px] text-gray-600 mt-0.5">{toast.message}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="shrink-0 p-0.5 rounded hover:bg-black/5">
            <X size={14} className="text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Admin Audit Log Store ──

export interface AuditLogEntry {
  id: string;
  action: string;
  adminName: string;
  target: string;
  targetType: 'user' | 'circle' | 'transaction' | 'kyc' | 'solidarity' | 'system';
  type: 'success' | 'warning' | 'danger' | 'info';
  timestamp: string;
  details?: string;
}

const initialAuditLogs: AuditLogEntry[] = [
  { id: 'al1', action: 'Cercle créé', adminName: 'Système', target: 'Tontine Famille Ouédraogo', targetType: 'circle', type: 'success', timestamp: '2026-03-01T10:00:00Z' },
  { id: 'al2', action: 'KYC approuvé', adminName: 'Admin A.', target: 'Aminata Ouédraogo', targetType: 'kyc', type: 'success', timestamp: '2026-01-25T09:00:00Z' },
  { id: 'al3', action: 'KYC approuvé', adminName: 'Admin A.', target: 'Ibrahim Sawadogo', targetType: 'kyc', type: 'success', timestamp: '2026-01-28T11:30:00Z' },
  { id: 'al4', action: 'KYC approuvé', adminName: 'Admin A.', target: 'Fatimata Compaoré', targetType: 'kyc', type: 'success', timestamp: '2026-02-05T14:00:00Z' },
  { id: 'al5', action: 'Utilisateur inscrit', adminName: 'Système', target: 'Moussa Kaboré', targetType: 'user', type: 'info', timestamp: '2026-02-10T11:00:00Z' },
  { id: 'al6', action: 'KYC approuvé', adminName: 'Admin B.', target: 'Rasmata Zongo', targetType: 'kyc', type: 'success', timestamp: '2026-02-20T10:00:00Z' },
  { id: 'al7', action: 'Utilisateur inscrit', adminName: 'Système', target: 'Adama Traoré', targetType: 'user', type: 'info', timestamp: '2026-03-01T16:00:00Z' },
  { id: 'al8', action: 'Cotisation reçue', adminName: 'Système', target: 'Aminata Ouédraogo — 10 000 XOF', targetType: 'transaction', type: 'success', timestamp: '2026-07-01T10:00:00Z' },
  { id: 'al9', action: 'Cotisation reçue', adminName: 'Système', target: 'Ibrahim Sawadogo — 10 000 XOF', targetType: 'transaction', type: 'success', timestamp: '2026-07-01T10:30:00Z' },
  { id: 'al10', action: 'Demande solidarité soumise', adminName: 'Système', target: 'Rasmata Zongo — Mariage', targetType: 'solidarity', type: 'info', timestamp: '2026-07-04T09:00:00Z' },
  { id: 'al11', action: 'Aide approuvée par vote', adminName: 'Système', target: 'Moussa Kaboré — 50 000 XOF', targetType: 'solidarity', type: 'success', timestamp: '2026-06-21T09:00:00Z' },
  { id: 'al12', action: 'Paramètres modifiés', adminName: 'Admin A.', target: 'Configuration KYC', targetType: 'system', type: 'warning', timestamp: '2026-07-01T08:12:00Z' },
];

let auditLogStore = [...initialAuditLogs];

export function getAuditLogs() {
  return [...auditLogStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  auditLogStore = [newEntry, ...auditLogStore];
  return newEntry;
}

// ── KYC Status Store ──

export type KycStatusMap = Record<string, 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'>;

let kycStatusStore: KycStatusMap = {};

export function getKycStatus(userId: string): string {
  return kycStatusStore[userId] || '';
}

export function setKycStatus(userId: string, status: 'VERIFIED' | 'REJECTED') {
  kycStatusStore[userId] = status;
}

export function initKycStore(users: { id: string; kycStatus: string }[]) {
  for (const u of users) {
    if (!kycStatusStore[u.id]) kycStatusStore[u.id] = u.kycStatus as any;
  }
}

// ── User Management Store ──

export function exportUsersCSV(users: any[]) {
  const headers = ['ID', 'Prénom', 'Nom', 'Téléphone', 'KYC', 'Score', 'Inscrit le'];
  const rows = users.map((u) => [
    u.id,
    u.firstName,
    u.lastName,
    u.phoneNumber,
    u.kycStatus,
    u.reputationScore.toString(),
    new Date(u.createdAt).toLocaleDateString('fr-FR'),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `venega-utilisateurs-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Confirmation Dialog ──

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', type = 'danger', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  const btnClass = type === 'danger' ? 'bg-red-500 hover:bg-red-600' : type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600';
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-[13px] text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 ${btnClass} text-white rounded-xl text-[13px] font-medium transition-colors`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
