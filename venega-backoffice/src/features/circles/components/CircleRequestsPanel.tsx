'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, EmptyState, ReasonDialog, Table, Td, Th, Tr } from '@/components/ui';
import { formatDateTime, formatPhone, formatXOF } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useCan } from '@/features/auth/SessionContext';
import { decideRequest, type RequestDecision } from '../api';
import { REQUEST_TYPE_LABEL, type CircleDetail, type CircleRequest } from '../types';
import { RequestStatusBadge } from './CircleBadges';

const UI: Record<RequestDecision, { title: string; confirm: string; tone: 'primary' | 'danger'; help: string; presets: string[] }> = {
  APPROVE: { title: 'Accepter la demande', confirm: 'Accepter', tone: 'primary', help: 'Décision prise par Venega à la place du fondateur (absent ou en litige).', presets: ['Fondateur sans réponse depuis plus de 5 jours', 'Accord confirmé par téléphone avec le fondateur'] },
  REJECT: { title: 'Refuser la demande', confirm: 'Refuser', tone: 'danger', help: 'Le membre sera informé du refus et du motif.', presets: ['Contraire au règlement du cercle', 'Identité non vérifiée'] },
  CANCEL_EXCLUSION: { title: 'Annuler l’exclusion', confirm: 'Réintégrer le membre', tone: 'primary', help: 'Le membre redevient actif dans le cercle avec sa place dans l’ordre de passage.', presets: ['Paiement retrouvé : retard dû à l’opérateur', 'Seuil de retards non atteint'] },
  CONFIRM_EXCLUSION: { title: 'Confirmer l’exclusion', confirm: 'Confirmer l’exclusion', tone: 'danger', help: 'La contestation est rejetée ; l’exclusion reste en vigueur.', presets: ['Retards confirmés, règlement respecté'] },
};

/** Demandes d'adhésion, de départ, d'exclusion et de remplacement, avec décision de Venega en cas de litige. */
export function CircleRequestsPanel({ c }: { c: CircleDetail }) {
  const can = useCan();
  const [pending, setPending] = useState<{ r: CircleRequest; d: RequestDecision } | null>(null);
  const mutation = useAdminMutation({
    mutationFn: (v: { id: string; d: RequestDecision; reason: string }) => decideRequest(v.id, v.d, v.reason),
    successTitle: (r) => `${REQUEST_TYPE_LABEL[r.type]} de ${r.userName} traitée`,
    onSuccess: () => setPending(null),
  });

  return (
    <Card>
      <CardHeader title="Demandes et litiges" subtitle="Adhésions, départs, exclusions, remplacements. Le fondateur décide normalement ; Venega intervient en cas d’absence ou de contestation." />
      {c.requests.length === 0 ? (
        <EmptyState title="Aucune demande" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Membre</Th>
              <Th>Motif / détails</Th>
              <Th>Statut</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {c.requests.map((r) => (
              <Tr key={r.id}>
                <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(r.createdAt)}</Td>
                <Td className="text-sm font-medium">{REQUEST_TYPE_LABEL[r.type]}</Td>
                <Td className="text-sm">
                  <Link href={`/users/${r.userId}`} className="text-brand hover:underline">
                    {r.userName}
                  </Link>
                  {r.requestedBy !== r.userName && <span className="block text-xs text-ink-muted">demandé par {r.requestedBy}</span>}
                </Td>
                <Td className="max-w-sm text-sm">
                  {r.reason}
                  {r.amountToRecover !== undefined && r.amountToRecover > 0 && (
                    <span className="block text-xs text-ink-muted">À récupérer auprès des bénéficiaires passés : {formatXOF(r.amountToRecover)}</span>
                  )}
                  {r.replacementName && (
                    <span className="block text-xs text-ink-muted">
                      Remplaçant proposé : {r.replacementName} ({r.replacementPhone ? formatPhone(r.replacementPhone) : '—'})
                    </span>
                  )}
                  {r.contested && <span className="block text-xs font-medium text-danger">Contestée par le membre</span>}
                  {r.decisionNote && (
                    <span className="block text-xs text-ink-muted">
                      Décision de {r.decidedBy} : {r.decisionNote}
                    </span>
                  )}
                </Td>
                <Td>
                  <RequestStatusBadge status={r.status} contested={r.contested} />
                </Td>
                <Td className="whitespace-nowrap text-right">
                  {can('circle.requests') && (
                    <span className="inline-flex gap-1.5">
                      {r.status === 'PENDING' && (
                        <>
                          <Button size="sm" onClick={() => setPending({ r, d: 'APPROVE' })}>
                            Accepter
                          </Button>
                          <Button size="sm" variant="dangerOutline" onClick={() => setPending({ r, d: 'REJECT' })}>
                            Refuser
                          </Button>
                        </>
                      )}
                      {r.type === 'EXCLUSION' && r.status === 'APPROVED' && r.contested && (
                        <>
                          <Button size="sm" onClick={() => setPending({ r, d: 'CANCEL_EXCLUSION' })}>
                            Annuler l’exclusion
                          </Button>
                          <Button size="sm" variant="dangerOutline" onClick={() => setPending({ r, d: 'CONFIRM_EXCLUSION' })}>
                            Confirmer
                          </Button>
                        </>
                      )}
                    </span>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
      {pending && (
        <ReasonDialog
          open
          onClose={() => setPending(null)}
          onConfirm={(reason) => mutation.mutate({ id: pending.r.id, d: pending.d, reason })}
          title={UI[pending.d].title}
          description={
            <>
              <strong className="text-ink">{pending.r.userName}</strong> · {REQUEST_TYPE_LABEL[pending.r.type]} — {UI[pending.d].help}
            </>
          }
          confirmLabel={UI[pending.d].confirm}
          tone={UI[pending.d].tone}
          presets={UI[pending.d].presets}
          loading={mutation.isPending}
        />
      )}
    </Card>
  );
}
