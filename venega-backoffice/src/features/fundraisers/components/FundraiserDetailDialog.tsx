'use client';

import React, { useState } from 'react';
import { Ban, Check, Copy, ExternalLink, Flag, Lock, RotateCcw } from 'lucide-react';
import { Badge, Button, Dialog, Field, ProgressBar, ReasonDialog } from '@/components/ui';
import { formatDate, formatDateTime, formatPhone, formatRelative, formatXOF, percent } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { ALLOWED_ACTIONS, actionNeedsReason, moderateFundraiser } from '../api';
import {
  FUNDRAISER_CATEGORY_LABEL,
  PUBLIC_FUNDRAISER_BASE_URL,
  type Fundraiser,
  type FundraiserAction,
} from '../types';
import { FundraiserStatusBadge } from './FundraiserStatusBadge';

const ACTION_UI: Record<
  FundraiserAction,
  { label: string; icon: React.ReactNode; variant: 'primary' | 'secondary' | 'dangerOutline'; title: string; confirm: string; help: string }
> = {
  ACTIVATE: {
    label: 'Activer',
    icon: <Check size={16} />,
    variant: 'primary',
    title: 'Activer la cagnotte',
    confirm: 'Activer',
    help: 'La cagnotte devient visible et peut recevoir des contributions.',
  },
  REACTIVATE: {
    label: 'Réactiver',
    icon: <RotateCcw size={16} />,
    variant: 'primary',
    title: 'Réactiver la cagnotte',
    confirm: 'Réactiver',
    help: 'Les contributions seront de nouveau possibles via le lien public.',
  },
  SUSPEND: {
    label: 'Suspendre',
    icon: <Ban size={16} />,
    variant: 'dangerOutline',
    title: 'Suspendre la cagnotte',
    confirm: 'Suspendre',
    help: 'Le lien public affichera « cagnotte suspendue » et les contributions seront bloquées. Les fonds déjà collectés restent bloqués jusqu’à décision.',
  },
  CLOSE: {
    label: 'Clôturer',
    icon: <Lock size={16} />,
    variant: 'secondary',
    title: 'Clôturer la cagnotte',
    confirm: 'Clôturer définitivement',
    help: 'Action définitive : plus aucune contribution ne sera acceptée.',
  },
};

const REASON_PRESETS: Record<'SUSPEND' | 'CLOSE', string[]> = {
  SUSPEND: [
    'Justificatifs demandés à l’organisateur',
    'Signalements multiples en cours d’examen',
    'Organisateur injoignable',
    'Suspicion d’usurpation d’identité',
  ],
  CLOSE: ['Objectif atteint', 'Demande de l’organisateur', 'Fraude avérée', 'Cagnotte en double'],
};

export function FundraiserDetailDialog({ fundraiser, onClose }: { fundraiser: Fundraiser | null; onClose: () => void }) {
  const [pending, setPending] = useState<FundraiserAction | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useAdminMutation({
    mutationFn: (v: { action: FundraiserAction; reason?: string }) => moderateFundraiser(fundraiser!.id, v.action, v.reason),
    invalidate: ['fundraisers'],
    successTitle: (f, v) => `« ${f.title} » : ${ACTION_UI[v.action].label.toLowerCase()} effectué`,
    onSuccess: () => {
      setPending(null);
      onClose();
    },
  });

  if (!fundraiser) return null;
  const f = fundraiser;
  const url = `${PUBLIC_FUNDRAISER_BASE_URL}${f.code}`;
  const pct = percent(f.collected, f.goal);
  const actions = ALLOWED_ACTIONS[f.status];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const ui = pending ? ACTION_UI[pending] : null;

  return (
    <>
      <Dialog
        open={!pending}
        onClose={onClose}
        size="lg"
        title={f.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <FundraiserStatusBadge status={f.status} />
            <span>{FUNDRAISER_CATEGORY_LABEL[f.category]}</span>
            <span>· créée {formatRelative(f.createdAt)}</span>
          </span>
        }
        footer={
          actions.length > 0 ? (
            actions.map((a) => (
              <Button key={a} variant={ACTION_UI[a].variant} icon={ACTION_UI[a].icon} onClick={() => setPending(a)}>
                {ACTION_UI[a].label}
              </Button>
            ))
          ) : (
            <p className="mr-auto text-sm text-ink-muted">Cagnotte clôturée : aucune action possible.</p>
          )
        }
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{url}</span>
            <Button size="sm" variant="secondary" icon={<Copy size={14} />} onClick={copy}>
              {copied ? 'Copié' : 'Copier'}
            </Button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-brand-tint"
            >
              <ExternalLink size={14} /> Ouvrir
            </a>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xl font-semibold text-ink">{formatXOF(f.collected)}</p>
              <p className="text-sm text-ink-muted">
                {pct} % de {formatXOF(f.goal)}
              </p>
            </div>
            <ProgressBar value={pct} className="mt-2" />
            <p className="mt-1 text-sm text-ink-muted">{f.contributorsCount} contributeurs</p>
          </div>

          <p className="text-base text-ink-soft">{f.description}</p>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-line p-3 md:grid-cols-3">
            <Field label="Organisateur">{f.organizerName}</Field>
            <Field label="Téléphone">{formatPhone(f.organizerPhone)}</Field>
            <Field label="KYC organisateur">
              {f.organizerKycVerified ? <Badge tone="green">Vérifié</Badge> : <Badge tone="amber">Non vérifié</Badge>}
            </Field>
            <Field label="Créée le">{formatDate(f.createdAt)}</Field>
            {f.endsAt && <Field label={f.status === 'CLOSED' ? 'Clôturée le' : 'Échéance'}>{formatDate(f.endsAt)}</Field>}
            <Field label="Code">{f.code}</Field>
          </dl>

          {f.moderationNote && (
            <div className="rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink-soft">
              Dernière modération{f.moderatedBy && <> par <strong className="text-ink">{f.moderatedBy}</strong></>}
              {f.moderatedAt && <> le {formatDateTime(f.moderatedAt)}</>} : <span className="text-ink">{f.moderationNote}</span>
            </div>
          )}

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              <Flag size={14} /> Signalements ({f.reports.length})
            </h3>
            {f.reports.length === 0 ? (
              <p className="text-sm text-ink-muted">Aucun signalement reçu.</p>
            ) : (
              <ul className="divide-y divide-line rounded-md border border-line">
                {f.reports.map((r) => (
                  <li key={r.id} className="px-3 py-2">
                    <p className="text-base text-ink">{r.reason}</p>
                    <p className="text-sm text-ink-muted">
                      {r.reporterLabel} · {formatRelative(r.reportedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Dialog>

      {pending && ui && (
        <ReasonDialog
          open
          onClose={() => setPending(null)}
          onConfirm={(reason) => mutation.mutate({ action: pending, reason: reason || undefined })}
          title={ui.title}
          description={
            <>
              <strong className="text-ink">{f.title}</strong> — {ui.help}
            </>
          }
          confirmLabel={ui.confirm}
          tone={pending === 'SUSPEND' || pending === 'CLOSE' ? 'danger' : 'primary'}
          required={actionNeedsReason(pending)}
          presets={pending === 'SUSPEND' || pending === 'CLOSE' ? REASON_PRESETS[pending] : undefined}
          label={actionNeedsReason(pending) ? 'Motif' : 'Note interne'}
          loading={mutation.isPending}
        />
      )}
    </>
  );
}
