'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, HardDrive, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * - `local`  : action appliquée uniquement à l'état local (API admin non branchée)
 * - `success`: confirmée par le serveur (à utiliser une fois l'API branchée)
 * - `error`  : échec
 */
type ToastKind = 'local' | 'success' | 'error';

interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastApi {
  notify: (kind: ToastKind, title: string, message?: string) => void;
  /** Raccourci pour les actions en mode local : dit clairement que rien n'est parti au serveur. */
  local: (title: string) => void;
  error: (error: unknown) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>');
  return ctx;
}

let seq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = ++seq;
      setItems((xs) => [...xs.slice(-3), { id, kind, title, message }]);
      setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 5500);
    },
    [dismiss],
  );

  const api: ToastApi = {
    notify,
    local: (title) =>
      notify('local', title, "Modifié uniquement dans ce navigateur : l'API admin n'est pas encore branchée, rien n'a été envoyé au serveur."),
    error: (e) => notify('error', 'Action impossible', e instanceof Error ? e.message : String(e)),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white px-4 py-3',
              t.kind === 'error' ? 'border-danger-line' : t.kind === 'local' ? 'border-accent-line' : 'border-brand-line',
            )}
          >
            <span className="mt-0.5 shrink-0">
              {t.kind === 'error' ? (
                <AlertCircle size={18} className="text-danger" />
              ) : t.kind === 'local' ? (
                <HardDrive size={18} className="text-accent-ink" />
              ) : (
                <CheckCircle2 size={18} className="text-brand" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-ink">{t.title}</p>
              {t.message && <p className="mt-0.5 text-sm text-ink-muted">{t.message}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="rounded p-0.5 text-ink-muted hover:text-ink" aria-label="Fermer">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
