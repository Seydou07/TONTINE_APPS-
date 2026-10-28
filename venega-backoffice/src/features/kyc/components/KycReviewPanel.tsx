'use client';

import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, X } from 'lucide-react';
import { Badge, Button, Dialog, Field, ImageThumb, ImageViewer, ReasonDialog, type ViewerImage } from '@/components/ui';
import { formatDate, formatDateTime, formatPhone, formatRelative } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { approveKyc, rejectKyc } from '../api';
import { KYC_REJECTION_REASONS, type KycSubmission } from '../types';
import { KycStatusBadge } from './KycStatusBadge';

const CHECKLIST = [
  'Le visage du selfie correspond à la photo du document',
  'Nom et prénoms identiques au profil',
  'Document lisible, non expiré, recto et verso présents',
  'Aucun signe de retouche ou de photo d’écran',
];

export function KycReviewPanel({
  submission,
  onBack,
  onDecided,
}: {
  submission: KycSubmission;
  onBack: () => void;
  onDecided: (s: KycSubmission) => void;
}) {
  const [viewer, setViewer] = useState<number | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const docLabel = submission.documentType === 'CNIB' ? 'CNIB' : 'Passeport';
  const images: ViewerImage[] = [
    { src: submission.images.front, label: `${docLabel} — recto` },
    { src: submission.images.back, label: `${docLabel} — verso` },
    { src: submission.images.selfie, label: 'Selfie' },
  ];

  const approve = useAdminMutation({
    mutationFn: () => approveKyc(submission.id),
    invalidate: ['kyc', 'users'],
    successTitle: (s) => `KYC de ${s.userName} validé`,
    onSuccess: (s) => {
      setConfirmApprove(false);
      onDecided(s);
    },
  });

  const reject = useAdminMutation({
    mutationFn: (reason: string) => rejectKyc(submission.id, reason),
    invalidate: ['kyc', 'users'],
    successTitle: (s) => `KYC de ${s.userName} refusé`,
    onSuccess: (s) => {
      setRejecting(false);
      onDecided(s);
    },
  });

  const pending = submission.status === 'PENDING';
  const duplicate = submission.flags.some((f) => f.toLowerCase().includes('cnib'));

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-start gap-3 border-b border-line px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 rounded p-1.5 text-ink-soft hover:bg-canvas xl:hidden"
          aria-label="Retour à la file d'attente"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-ink">{submission.userName}</h2>
            <KycStatusBadge status={submission.status} />
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">
            {formatPhone(submission.phoneNumber)} · {submission.city} · soumis {formatRelative(submission.submittedAt)}
          </p>
        </div>
        {pending && (
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="dangerOutline" icon={<X size={16} />} onClick={() => setRejecting(true)} className="flex-1 sm:flex-none">
              Refuser
            </Button>
            <Button icon={<Check size={16} />} onClick={() => setConfirmApprove(true)} className="flex-1 sm:flex-none">
              Valider
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {submission.flags.length > 0 && (
          <div
            className={
              duplicate
                ? 'rounded-md border border-danger-line bg-danger-tint px-3 py-2 text-danger'
                : 'rounded-md border border-accent-line bg-accent-tint px-3 py-2 text-accent-ink'
            }
          >
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <AlertTriangle size={15} /> Points d’attention
            </p>
            <ul className="mt-1 list-disc pl-6 text-sm">
              {submission.flags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {!pending && (
          <div className="rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink-soft">
            {submission.status === 'VERIFIED' ? 'Validé' : 'Refusé'} par <strong className="text-ink">{submission.reviewedBy}</strong>
            {submission.reviewedAt && <> le {formatDateTime(submission.reviewedAt)}</>}
            {submission.rejectionReason && (
              <p className="mt-1">
                Motif : <span className="text-ink">{submission.rejectionReason}</span>
              </p>
            )}
          </div>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Pièces fournies</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {images.map((img, i) => (
              <ImageThumb key={img.label} image={img} onOpen={() => setViewer(i)} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Informations déclarées</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-line p-3 md:grid-cols-3">
            <Field label="Type de document">{docLabel}</Field>
            <Field label="Numéro">
              <span className="font-mono text-sm">{submission.documentNumber}</span>
            </Field>
            <Field label="Date de naissance">{formatDate(submission.birthDate)}</Field>
            <Field label="Téléphone">{formatPhone(submission.phoneNumber)}</Field>
            <Field label="Ville">{submission.city}</Field>
            <Field label="Soumis le">{formatDateTime(submission.submittedAt)}</Field>
          </dl>
        </section>

        {pending && (
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">À vérifier avant de valider</h3>
            <ul className="space-y-1.5 text-base text-ink-soft">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-brand" /> {c}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ImageViewer images={images} index={viewer} onClose={() => setViewer(null)} onIndex={setViewer} />

      <Dialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        title="Valider ce KYC ?"
        description={
          <>
            Le compte de <strong className="text-ink">{submission.userName}</strong> sera marqué comme vérifié.
            {submission.flags.length > 0 && <Badge tone="amber" className="ml-1">{submission.flags.length} point(s) d’attention</Badge>}
          </>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmApprove(false)} disabled={approve.isPending}>
              Annuler
            </Button>
            <Button onClick={() => approve.mutate(undefined)} loading={approve.isPending} icon={<Check size={16} />}>
              Valider
            </Button>
          </>
        }
      />

      <ReasonDialog
        open={rejecting}
        onClose={() => setRejecting(false)}
        onConfirm={(reason) => reject.mutate(reason)}
        title="Refuser ce KYC"
        description={`Le motif sera communiqué à ${submission.userName} pour qu’il/elle puisse soumettre à nouveau.`}
        confirmLabel="Refuser le KYC"
        tone="danger"
        presets={KYC_REJECTION_REASONS}
        label="Motif du refus"
        loading={reject.isPending}
      />
    </div>
  );
}
