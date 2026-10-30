'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, ErrorState, FormField, LoadingState, Notice, SearchInput, TextArea, TextInput } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate, formatDateTime, formatPhone, formatXOF } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { getMatchCandidates, reconcilePayment, type MatchCandidate } from '../api';
import { PROVIDER_LABEL, type Payment } from '../types';

const PRESETS = [
  'Payé depuis le numéro d’un proche, confirmé par téléphone',
  'Confirmation de l’opérateur arrivée en retard',
  'Référence vérifiée sur le SMS de l’opérateur',
];

/**
 * Rattacher un paiement reçu à la bonne cotisation.
 * Exige : la cotisation choisie, la référence opérateur dictée par l'utilisateur (contrôle croisé), un motif.
 */
export function ReconcileDialog({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<MatchCandidate | null>(null);
  const [ref, setRef] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setSearch('');
    setQ('');
    setSelected(null);
    setRef('');
    setReason('');
    setTouched(false);
  }, [payment?.id]);

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const candidates = useQuery({
    queryKey: ['payments', 'candidates', payment?.id, q],
    queryFn: () => getMatchCandidates(payment!.id, q || undefined),
    enabled: !!payment,
  });

  const mutation = useAdminMutation({
    mutationFn: () =>
      reconcilePayment({ paymentId: payment!.id, circleId: selected!.circleId, userId: selected!.userId, turn: selected!.turn, providerReference: ref, reason }),
    successTitle: (p) => `${p.reference} rattaché à ${p.userName} (tour ${p.turn})`,
    onSuccess: onClose,
  });

  if (!payment) return null;
  const refOk = !!payment.providerReference && ref.replace(/\s/g, '').toUpperCase() === payment.providerReference.replace(/\s/g, '').toUpperCase();
  const amountOk = !selected || selected.amount === payment.amount;
  const valid = !!selected && refOk && amountOk && reason.trim().length >= 10;

  return (
    <Dialog
      open
      size="lg"
      onClose={mutation.isPending ? () => undefined : onClose}
      title="Rattacher un paiement à une cotisation"
      description={`${payment.reference} · ${formatXOF(payment.amount)} · ${PROVIDER_LABEL[payment.provider]} · reçu le ${formatDateTime(payment.confirmedAt ?? payment.createdAt)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button
            loading={mutation.isPending}
            onClick={() => {
              setTouched(true);
              if (valid) mutation.mutate(undefined);
            }}
          >
            Rattacher
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 rounded-md border border-line p-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Numéro payeur</dt>
            <dd className="font-medium">{formatPhone(payment.payerPhone)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Compte détecté</dt>
            <dd className="font-medium">{payment.userName ?? 'Aucun'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Pourquoi non rattaché</dt>
            <dd className="text-accent-ink">{payment.unmatchedReason ?? '—'}</dd>
          </div>
        </dl>

        <section>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="flex-1 text-sm font-semibold uppercase tracking-wide text-ink-muted">1. Cotisation à créditer</h3>
            <SearchInput value={search} onChange={setSearch} placeholder="Nom, numéro, cercle…" className="sm:w-64" />
          </div>
          {candidates.isError ? (
            <ErrorState error={candidates.error} />
          ) : candidates.isLoading ? (
            <LoadingState />
          ) : (candidates.data ?? []).length === 0 ? (
            <Notice>Aucune cotisation impayée proposée. Cherchez le membre par son nom ou son numéro.</Notice>
          ) : (
            <ul className="max-h-60 divide-y divide-line overflow-y-auto rounded-md border border-line">
              {candidates.data!.map((c) => {
                const active = selected?.circleId === c.circleId && selected.userId === c.userId && selected.turn === c.turn;
                return (
                  <li key={`${c.circleId}-${c.userId}-${c.turn}`}>
                    <button
                      type="button"
                      onClick={() => setSelected(c)}
                      className={cn('flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-brand-tint/50', active && 'bg-brand-tint')}
                    >
                      <span className={cn('h-4 w-4 shrink-0 rounded-full border-2', active ? 'border-brand bg-brand' : 'border-line')} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-ink">
                          {c.userName} · tour {c.turn}
                        </span>
                        <span className="block truncate text-sm text-ink-muted">
                          {c.circleName} · {formatPhone(c.phoneNumber)} · échéance {formatDate(c.dueDate)}
                        </span>
                      </span>
                      <span className="text-right text-sm">
                        <span className={cn('block font-medium', c.amount !== payment.amount && 'text-danger')}>{formatXOF(c.amount)}</span>
                        <span className="block text-xs text-ink-muted">{c.hint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {touched && !selected && <p className="mt-1 text-sm text-danger">Choisissez la cotisation.</p>}
          {selected && !amountOk && (
            <Notice tone="red" className="mt-2">
              Montant différent ({formatXOF(payment.amount)} reçu pour {formatXOF(selected.amount)} attendu). Le rattachement est impossible : proposez un remboursement ou un complément.
            </Notice>
          )}
        </section>

        <FormField
          label="2. Référence opérateur dictée par l’utilisateur"
          required
          hint="Lisez-la sur le SMS de l’opérateur reçu par l’appelant, ne la recopiez pas depuis l’écran."
          error={touched && !refOk ? 'La référence ne correspond pas au paiement reçu.' : null}
        >
          {(id) => <TextInput id={id} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Ex. : OM2410.1234567" autoComplete="off" className="font-mono" />}
        </FormField>

        <div>
          <p className="mb-1 text-sm font-medium text-ink">
            3. Motif <span className="text-danger">*</span>
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setReason(p)}
                className={cn('rounded-md border px-2 py-1 text-sm', reason === p ? 'border-brand bg-brand-tint text-brand' : 'border-line text-ink-soft hover:border-brand-line')}
              >
                {p}
              </button>
            ))}
          </div>
          <TextArea value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Motif" placeholder="Pourquoi ce rattachement manuel…" />
          {touched && reason.trim().length < 10 && <p className="mt-1 text-sm text-danger">Motif obligatoire (10 caractères minimum).</p>}
        </div>
      </div>
    </Dialog>
  );
}
