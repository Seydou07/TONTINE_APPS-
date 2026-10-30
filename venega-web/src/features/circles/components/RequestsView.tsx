'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck, Check, CheckCircle2, ChevronRight, Clock, Eye, UserCheck, XCircle, type LucideIcon } from 'lucide-react';
import { AdhesionPaymentStatus, MembershipRequestStatus, type MembershipRequest } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { Sheet } from '@/components/ui/Sheet';
import { TextArea } from '@/components/ui/TextField';
import { useDemoStore } from '@/lib/demoStore';
import { getCircle, getMembershipRequests, updateMembershipRequest } from '../store';
import { circleHref } from './CircleRedirect';
import { MemberDocuments, type MemberDocumentKind } from './MemberDocuments';
import { StatusBadge } from './RoleBadge';

/*
 * Demandes d'adhésion d'un cercle (fondateur) — copie de RequestsScreen.tsx mobile.
 * Le fondateur doit ouvrir la CNIB recto avant de pouvoir valider, et l'approbation
 * reste bloquée tant que le paiement requis (rachat + dépôt) n'est pas reçu.
 * TODO API : `GET /circles/:id/requests`, `PATCH /circles/requests/:requestId`
 * (docs/api-mobile.md, section 3).
 */

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';
const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};

const statusInfo = (s: MembershipRequestStatus) => {
  switch (s) {
    case MembershipRequestStatus.PENDING:
      return { label: 'En attente', className: 'bg-amber-tint text-amber-dark' };
    case MembershipRequestStatus.APPROVED:
      return { label: 'Approuvée', className: 'bg-primary-tint text-primary' };
    case MembershipRequestStatus.REJECTED:
      return { label: 'Refusée', className: 'bg-danger-tint text-danger' };
    default:
      return { label: 'Intégré', className: 'bg-primary-tint text-primary' };
  }
};

/** Un paiement est requis quand le candidat doit verser une somme (rachat + dépôt). */
const paymentRequired = (r: MembershipRequest) => r.joiningFee + r.depositAmount > 0;
/** Le paiement est reçu si le statut est explicitement PAYÉ. */
const paymentReceived = (r: MembershipRequest) => r.paymentStatus === AdhesionPaymentStatus.PAID;
/** L'approbation est bloquée tant que le paiement requis n'est pas reçu. */
const approveBlocked = (r: MembershipRequest) => paymentRequired(r) && !paymentReceived(r);

const sectionLabel = 'mb-2 mt-5 px-1 text-[13px] font-semibold text-muted';

export function RequestsView({ circleId }: { circleId: string }) {
  useDemoStore();
  const params = useSearchParams();
  const requestId = params.get('requestId');
  const circle = getCircle(circleId);
  const requests = circle ? getMembershipRequests(circle.id) : [];

  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(requestId);
  /** Documents consultés, par demande : le fondateur doit voir la CNIB avant de valider. */
  const [viewedDocs, setViewedDocs] = useState<Record<string, Partial<Record<MemberDocumentKind, boolean>>>>({});
  const [showRefuse, setShowRefuse] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Ouverture directe d'une demande (ex. depuis l'onglet Demandes de la tontine).
  useEffect(() => {
    if (requestId) setSelectedId(requestId);
  }, [requestId]);

  if (!circle) {
    return (
      <>
        <PageHeader title="Demandes d'adhésion" backHref="/circles" />
        <p className="mx-auto max-w-2xl px-4 py-8 text-[15px] text-muted">Ce cercle n’existe pas ou plus.</p>
      </>
    );
  }

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const markViewed = (id: string, kind: MemberDocumentKind) =>
    setViewedDocs((prev) => ({ ...prev, [id]: { ...prev[id], [kind]: true } }));

  const pendingRequests = requests.filter((r) => r.status === MembershipRequestStatus.PENDING);
  const visibleRequests = filter === 'pending' ? pendingRequests : requests;
  /** La CNIB recto (si fournie) doit avoir été ouverte avant de pouvoir valider. */
  const docsChecked = (r: MembershipRequest) => !r.cnibFrontUrl || !!viewedDocs[r.id]?.front;

  const handleApprove = (r: MembershipRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      updateMembershipRequest(r.id, { status: MembershipRequestStatus.APPROVED, decidedAt: new Date().toISOString() });
      setActionLoading(false);
      setSelectedId(null);
    }, 1200);
  };

  const handleRefuse = (r: MembershipRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      updateMembershipRequest(r.id, {
        status: MembershipRequestStatus.REJECTED,
        decidedAt: new Date().toISOString(),
        rejectionReason: rejectReason.trim() || undefined,
      });
      setActionLoading(false);
      setShowRefuse(false);
      setRejectReason('');
      setSelectedId(null);
    }, 1200);
  };

  return (
    <>
      <PageHeader title="Demandes d'adhésion" subtitle={circle.name} backHref={circleHref(circle)} />
      <ScreenBody>
        <ChipGroup label="Filtrer les demandes">
          <Chip label={`En attente (${pendingRequests.length})`} selected={filter === 'pending'} onClick={() => setFilter('pending')} />
          <Chip label={`Toutes (${requests.length})`} selected={filter === 'all'} onClick={() => setFilter('all')} />
        </ChipGroup>

        {visibleRequests.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
              <UserCheck size={26} aria-hidden />
            </span>
            <p className="mt-3 text-[15px] font-semibold text-ink">
              {filter === 'pending' ? 'Aucune demande en attente' : 'Aucune demande'}
            </p>
            <p className="mt-1 max-w-sm text-[14px] text-muted">
              Les nouvelles demandes d&apos;adhésion apparaîtront ici pour approbation.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-line bg-white">
            {visibleRequests.map((r, idx) => {
              const st = statusInfo(r.status);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  aria-label={`Demande de ${r.fullName}`}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-fill ${
                    idx < visibleRequests.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <Avatar name={r.fullName} uri={r.user?.avatarUrl} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{r.fullName}</span>
                    <span className="block text-[13px] text-muted">{r.phoneNumber}</span>
                    <span className="block text-[12px] text-subtle">
                      Frais {formatXOF(r.joiningFee)} · Dépôt {formatXOF(r.depositAmount)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge label={st.label} className={st.className} />
                    <ChevronRight size={18} className="text-subtle" aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <p className="px-1 text-[13px] text-muted">
          Touchez une demande pour vérifier l&apos;identité (CNIB) puis valider ou refuser.
        </p>
      </ScreenBody>

      {/* Détail d'une demande */}
      <Sheet open={!!selected && !showRefuse} onClose={() => setSelectedId(null)} size="lg">
        {selected && (
          <>
            <div className="flex items-center gap-3">
              <Avatar name={selected.fullName} uri={selected.user?.avatarUrl} size={56} />
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-ink">{selected.fullName}</p>
                <p className="text-[13px] text-muted">Demande reçue le {formatDate(selected.createdAt)}</p>
              </div>
            </div>

            <h3 className={sectionLabel}>Identité</h3>
            <InfoCard>
              <InfoRow label="Nom complet" value={selected.fullName} />
              <InfoRow label="Téléphone" value={selected.phoneNumber} />
              <InfoRow label="Numéro de dépôt (MM)" value={selected.depositNumber} last />
            </InfoCard>

            <div className="mt-5">
              <MemberDocuments
                fullName={selected.fullName}
                phoneNumber={selected.phoneNumber}
                avatarUrl={selected.user?.avatarUrl}
                cnibFrontUrl={selected.cnibFrontUrl}
                cnibBackUrl={selected.cnibBackUrl}
                selfieUrl={selected.selfieUrl}
                viewed={viewedDocs[selected.id]}
                onOpen={(kind) => markViewed(selected.id, kind)}
              />
            </div>

            <h3 className={sectionLabel}>Paiement de l&apos;adhésion</h3>
            <InfoCard>
              <InfoRow label="Total à payer" value={formatXOF(selected.joiningFee + selected.depositAmount)} />
              <InfoRow
                label="Statut du paiement"
                last={!selected.paymentReference && !selected.paidAt}
                value={
                  paymentReceived(selected) ? (
                    <IconBadge icon={Check} label="Payé" className="bg-primary-tint text-primary" />
                  ) : paymentRequired(selected) ? (
                    <IconBadge icon={Clock} label="Non payé" className="bg-amber-tint text-amber-dark" />
                  ) : (
                    <span className="text-[14px] text-muted">Aucun paiement requis</span>
                  )
                }
              />
              {selected.paymentReference && (
                <InfoRow label="Référence" value={selected.paymentReference} last={!selected.paidAt} />
              )}
              {selected.paidAt && <InfoRow label="Payé le" value={formatDate(selected.paidAt)} last />}
            </InfoCard>

            <h3 className={sectionLabel}>Engagements financiers</h3>
            <InfoCard>
              <InfoRow label="Frais de rachat" value={formatXOF(selected.joiningFee)} />
              <InfoRow label="Dépôt de garantie" value={formatXOF(selected.depositAmount)} />
              <InfoRow
                label="Conditions acceptées"
                last
                value={
                  selected.conditionsAccepted ? (
                    <IconBadge icon={Check} label="Oui" className="bg-primary-tint text-primary" />
                  ) : (
                    <span className="text-[14px] font-semibold text-danger">Non</span>
                  )
                }
              />
            </InfoCard>

            {selected.status === MembershipRequestStatus.REJECTED && selected.rejectionReason && (
              <p className="mt-4 flex items-start gap-2 rounded-[14px] bg-danger-tint p-3 text-[14px] text-danger">
                <XCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                Motif du refus : {selected.rejectionReason}
              </p>
            )}

            <div className="mt-5 space-y-2.5">
              {selected.status === MembershipRequestStatus.PENDING ? (
                <>
                  {approveBlocked(selected) ? (
                    <p className="flex items-start gap-2 rounded-[14px] bg-amber-tint p-3 text-[14px] text-amber-dark">
                      <Clock size={16} className="mt-0.5 shrink-0" aria-hidden />
                      Paiement non reçu — l&apos;approbation est bloquée tant que le candidat n&apos;a pas réglé{' '}
                      {formatXOF(selected.joiningFee + selected.depositAmount)}.
                    </p>
                  ) : (
                    <>
                      {!docsChecked(selected) && (
                        <p className="flex items-start gap-2 rounded-[14px] bg-fill p-3 text-[14px] text-ink-soft">
                          <Eye size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                          Consultez les documents avant de valider.
                        </p>
                      )}
                      <Button
                        icon={BadgeCheck}
                        loading={actionLoading}
                        disabled={!docsChecked(selected)}
                        onClick={() => handleApprove(selected)}
                      >
                        Valider l&apos;adhésion
                      </Button>
                    </>
                  )}
                  <Button variant="secondary" icon={XCircle} disabled={actionLoading} onClick={() => setShowRefuse(true)}>
                    Refuser
                  </Button>
                </>
              ) : (
                <p className="flex items-center justify-center gap-2 rounded-[14px] bg-primary-tint p-3 text-[15px] font-semibold text-primary-dark">
                  <CheckCircle2 size={18} className="text-primary" aria-hidden />
                  {selected.status === MembershipRequestStatus.APPROVED ? 'Adhésion approuvée' : 'Adhésion refusée'}
                </p>
              )}
            </div>
          </>
        )}
      </Sheet>

      {/* Motif de refus */}
      <Sheet open={showRefuse && !!selected} onClose={() => setShowRefuse(false)} title="Refuser l'adhésion">
        <p className="mb-4 text-[14px] text-muted">
          Indiquez le motif du refus pour {selected?.fullName} (optionnel).
        </p>
        <TextArea
          label="Motif du refus"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Ex : pièce d'identité illisible"
          rows={3}
        />
        <div className="mt-5 space-y-2.5">
          <Button
            variant="danger"
            icon={XCircle}
            loading={actionLoading}
            onClick={() => selected && handleRefuse(selected)}
          >
            Confirmer le refus
          </Button>
          <Button variant="secondary" onClick={() => setShowRefuse(false)}>
            Annuler
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <dl className="rounded-[16px] border border-line bg-white px-4">{children}</dl>;
}

function InfoRow({ label, value, last = false }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${last ? '' : 'border-b border-line'}`}>
      <dt className="text-[14px] text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-[14px] font-medium text-ink">{value}</dd>
    </div>
  );
}

function IconBadge({ icon: Icon, label, className }: { icon: LucideIcon; label: string; className: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${className}`}>
      <Icon size={13} aria-hidden />
      {label}
    </span>
  );
}
