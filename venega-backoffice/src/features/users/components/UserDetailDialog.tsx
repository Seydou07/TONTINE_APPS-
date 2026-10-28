'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Ban, RotateCcw } from 'lucide-react';
import { Avatar, Badge, Button, Dialog, ErrorState, Field, LoadingState, ReasonDialog } from '@/components/ui';
import { formatDate, formatPhone, formatRelative } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { KycStatusBadge } from '@/features/kyc/components/KycStatusBadge';
import { ROLE_LABEL, type MemberRole } from '@/features/circles/types';
import { SeverityBadge } from '@/features/alerts/components/SeverityBadge';
import { getUserDetail, reactivateUser, suspendUser } from '../api';

export function UserDetailDialog({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [suspending, setSuspending] = useState(false);
  const detail = useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: () => getUserDetail(userId!),
    enabled: !!userId,
  });

  const suspend = useAdminMutation({
    mutationFn: (reason: string) => suspendUser(userId!, reason),
    invalidate: ['users'],
    successTitle: (u) => `Compte de ${u.displayName} suspendu`,
    onSuccess: () => setSuspending(false),
  });
  const reactivate = useAdminMutation({
    mutationFn: () => reactivateUser(userId!),
    invalidate: ['users'],
    successTitle: (u) => `Compte de ${u.displayName} réactivé`,
  });

  if (!userId) return null;
  const d = detail.data;
  const u = d?.user;

  return (
    <>
      <Dialog
        open={!suspending}
        onClose={onClose}
        size="lg"
        title={u?.displayName ?? 'Utilisateur'}
        description={u ? `${formatPhone(u.phoneNumber)} · ${u.city}` : undefined}
        footer={
          u &&
          (u.accountStatus === 'ACTIVE' ? (
            <Button variant="dangerOutline" icon={<Ban size={16} />} onClick={() => setSuspending(true)}>
              Suspendre le compte
            </Button>
          ) : (
            <Button icon={<RotateCcw size={16} />} onClick={() => reactivate.mutate(undefined)} loading={reactivate.isPending}>
              Réactiver le compte
            </Button>
          ))
        }
      >
        {detail.isError ? (
          <ErrorState error={detail.error} />
        ) : !d || !u ? (
          detail.isLoading ? <LoadingState /> : <p className="text-base text-ink-muted">Utilisateur introuvable.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={u.displayName} size={48} />
              <div className="flex flex-wrap gap-2">
                <KycStatusBadge status={u.kycStatus} />
                {u.accountStatus === 'SUSPENDED' ? <Badge tone="red">Compte suspendu</Badge> : <Badge tone="green">Compte actif</Badge>}
              </div>
            </div>

            {u.suspensionReason && (
              <p className="rounded-md border border-danger-line bg-danger-tint px-3 py-2 text-sm text-danger">
                Motif de suspension : {u.suspensionReason}
              </p>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-line p-3 md:grid-cols-3">
              <Field label="Identifiant">
                <span className="font-mono text-sm">{u.id}</span>
              </Field>
              <Field label="Inscrit le">{formatDate(u.createdAt)}</Field>
              <Field label="Dernière activité">{formatRelative(u.lastActiveAt)}</Field>
              <Field label="Score de fiabilité">{u.reputationScore} / 100</Field>
              <Field label="Cercles">{d.circles.length}</Field>
              <Field label="Ville">{u.city}</Field>
            </dl>

            {d.openAlerts.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  <AlertTriangle size={14} /> Alertes ouvertes
                </h3>
                <ul className="divide-y divide-line rounded-md border border-line">
                  {d.openAlerts.map((a) => (
                    <li key={a.id} className="flex items-center gap-2 px-3 py-2">
                      <SeverityBadge severity={a.severity} />
                      <span className="min-w-0 flex-1 truncate text-base text-ink">{a.title}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/alertes" className="mt-1.5 inline-block text-sm font-medium text-brand hover:underline">
                  Voir les alertes
                </Link>
              </section>
            )}

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Cercles</h3>
              {d.circles.length === 0 ? (
                <p className="text-sm text-ink-muted">Membre d’aucun cercle.</p>
              ) : (
                <ul className="divide-y divide-line rounded-md border border-line">
                  {d.circles.map((c) => (
                    <li key={c.id}>
                      <Link href={`/circles/${c.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-brand-tint/50">
                        <span className="min-w-0 flex-1 truncate text-base text-ink">{c.name}</span>
                        <span className="text-sm text-ink-muted">{ROLE_LABEL[c.role as MemberRole] ?? c.role}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Dialog>

      <ReasonDialog
        open={suspending}
        onClose={() => setSuspending(false)}
        onConfirm={(reason) => suspend.mutate(reason)}
        title="Suspendre le compte"
        description={`${u?.displayName ?? ''} ne pourra plus se connecter, cotiser ni retirer de fonds.`}
        confirmLabel="Suspendre"
        tone="danger"
        presets={['Suspicion de fraude', 'Plusieurs comptes avec la même CNIB', 'Usurpation d’identité signalée', 'Demande de l’utilisateur']}
        loading={suspend.isPending}
      />
    </>
  );
}
