'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Check, CheckCircle2, ChevronRight, HandCoins, XCircle } from 'lucide-react';
import { DepartureRequestStatus, type DepartureRequest } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { CenteredState, ScreenBody } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { approveDeparture, getCircle, getCircleMembers, getDepartureRequests, rejectDeparture } from '../../store';
import { StatusBadge } from '../RoleBadge';
import { ReimbursementRow } from './DepartureView';

function formatDateAt(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} à ${d.toLocaleTimeString(
    'fr-FR',
    { hour: '2-digit', minute: '2-digit' },
  )}`;
}

function statusInfo(s: DepartureRequestStatus) {
  if (s === DepartureRequestStatus.PENDING) return { label: 'En attente', className: 'bg-amber-tint text-amber-dark' };
  if (s === DepartureRequestStatus.APPROVED) return { label: 'Approuvé', className: 'bg-primary-tint text-primary' };
  return { label: 'Refusé', className: 'bg-danger-tint text-danger' };
}

const sectionLabel = 'mb-2 mt-5 px-1 text-[13px] font-semibold text-muted';

/** Demandes de départ reçues par le fondateur (copie de DepartureRequestsScreen mobile). */
export function DepartureRequestsView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const circle = getCircle(circleId);
  if (!circle) {
    return (
      <>
        <PageHeader title="Demandes de départ" onBack={() => router.back()} />
        <ScreenBody>
          <CenteredState icon={HandCoins} tone="neutral" title="Cercle introuvable" />
        </ScreenBody>
      </>
    );
  }

  const requests = getDepartureRequests(circle.id);
  const pending = requests.filter((r) => r.status === DepartureRequestStatus.PENDING);
  const visible = filter === 'pending' ? pending : requests;
  const selected: DepartureRequest | undefined = requests.find((r) => r.id === selectedId);
  const avatarOf = (userId: string) => getCircleMembers(circle.id).find((m) => m.userId === userId)?.user?.avatarUrl;

  // TODO API: PATCH /circles/departures/:id (docs/api-mobile.md, section 3).
  const handleApprove = (r: DepartureRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      approveDeparture(r.id);
      setActionLoading(false);
    }, 1200);
  };
  const handleReject = (r: DepartureRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      rejectDeparture(r.id, 'Refusé par le fondateur');
      setSelectedId(null);
      setActionLoading(false);
    }, 1200);
  };

  return (
    <>
      <PageHeader title="Demandes de départ" subtitle={circle.name} onBack={() => router.back()} />
      <ScreenBody>
        <ChipGroup label="Filtrer les demandes">
          <Chip label={`En attente (${pending.length})`} selected={filter === 'pending'} onClick={() => setFilter('pending')} />
          <Chip label={`Toutes (${requests.length})`} selected={filter === 'all'} onClick={() => setFilter('all')} />
        </ChipGroup>

        {visible.length === 0 ? (
          <CenteredState
            icon={HandCoins}
            tone="primary"
            title={filter === 'pending' ? 'Aucune demande de départ' : 'Aucune demande'}
            text="Quand un membre qui n'a pas reçu sa cagnotte veut partir, sa demande apparaît ici."
          />
        ) : (
          <ul className="overflow-hidden rounded-[20px] border border-line bg-white">
            {visible.map((r, idx) => {
              const st = statusInfo(r.status);
              return (
                <li key={r.id} className={idx < visible.length - 1 ? 'border-b border-line' : ''}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    aria-label={`Demande de départ de ${r.memberName}`}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-fill"
                  >
                    <Avatar name={r.memberName} uri={avatarOf(r.userId)} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">{r.memberName}</span>
                      <span className="block text-[13px] text-muted">
                        {r.pastTurns} tour(s) cotisé(s) · {formatFcfa(r.totalRecover)} à récupérer
                      </span>
                    </span>
                    <StatusBadge label={st.label} className={st.className} />
                    <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="px-1 text-[13px] text-muted">
          Approuver un départ sans ajouter de membre : les cagnottes sont recalculées automatiquement.
        </p>
      </ScreenBody>

      <Sheet open={!!selected} onClose={() => setSelectedId(null)} size="lg">
        {selected && (
          <>
            <div className="flex items-center gap-3">
              <Avatar name={selected.memberName} uri={avatarOf(selected.userId)} size={56} />
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-ink">{selected.memberName}</p>
                <p className="text-[13px] text-muted">Demande reçue le {formatDateAt(selected.createdAt)}</p>
              </div>
            </div>

            <h3 className={sectionLabel}>Situation</h3>
            <div className="rounded-[16px] border border-line px-4">
              <div className="flex items-center justify-between gap-3 border-b border-line py-3">
                <span className="text-[14px] text-muted">Cagnotte déjà reçue</span>
                <StatusBadge label="Non — éligible au départ" className="bg-primary-tint text-primary" />
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line py-3">
                <span className="text-[14px] text-muted">Tours cotisés (non reçus)</span>
                <span className="text-[15px] font-semibold text-ink">{selected.pastTurns}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-[14px] text-muted">Total à récupérer</span>
                <span className="text-[15px] font-bold text-ink">{formatFcfa(selected.totalRecover)}</span>
              </div>
            </div>

            <h3 className={sectionLabel}>Qui lui rembourse quoi (main à main)</h3>
            <div className="rounded-[16px] border border-line px-4">
              {selected.reimbursements.length === 0 ? (
                <p className="py-3 text-[14px] text-muted">Aucun tour passé à rembourser.</p>
              ) : (
                <ul>
                  {selected.reimbursements.map((r) => (
                    <ReimbursementRow key={r.turnNumber} turn={r.turnNumber} name={r.beneficiaryName} amount={r.amount} />
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-2 px-1 text-[12px] text-muted">
              Le paiement se fait directement avec chaque bénéficiaire, sans passer par l&apos;application.
            </p>

            <h3 className={sectionLabel}>Conséquence de l&apos;approbation</h3>
            <div className="flex items-start gap-3 rounded-[16px] bg-primary-tint p-3.5">
              <Calculator size={18} className="mt-px shrink-0 text-primary-dark" aria-hidden />
              <div>
                <p className="text-[14px] font-semibold text-primary-dark">Aucun remplaçant — cagnottes recalculées</p>
                <p className="mt-0.5 text-[13px] text-ink-soft">
                  Le cercle continue normalement sans nouveau membre. Les cotisations restantes sont réajustées pour que le
                  pot reste entier.
                </p>
              </div>
            </div>

            {selected.status === DepartureRequestStatus.APPROVED && selected.recalculatedContribution !== undefined && (
              <p className="mt-3 flex items-start gap-2 rounded-[12px] bg-primary-tint p-3 text-[13px] text-primary-dark">
                <CheckCircle2 size={16} className="mt-px shrink-0 text-primary" aria-hidden />
                Départ approuvé — nouvelle cotisation : {formatFcfa(selected.recalculatedContribution)} par membre restant.
              </p>
            )}
            {selected.status === DepartureRequestStatus.REJECTED && (
              <p className="mt-3 flex items-start gap-2 rounded-[12px] bg-danger-tint p-3 text-[13px] text-danger">
                <XCircle size={16} className="mt-px shrink-0" aria-hidden />
                Départ refusé — {selected.rejectionReason ?? 'le membre reste dans le cercle.'}
              </p>
            )}

            <div className="mt-5 space-y-2.5">
              {selected.status === DepartureRequestStatus.PENDING ? (
                <>
                  <Button icon={CheckCircle2} loading={actionLoading} onClick={() => handleApprove(selected)}>
                    Approuver sans remplaçant
                  </Button>
                  <Button variant="secondary" icon={XCircle} disabled={actionLoading} onClick={() => handleReject(selected)}>
                    Refuser
                  </Button>
                </>
              ) : (
                <p className="flex items-center justify-center gap-2 rounded-[12px] bg-primary-tint p-3 text-[14px] font-semibold text-primary-dark">
                  <Check size={18} className="text-primary" aria-hidden />
                  {selected.status === DepartureRequestStatus.APPROVED
                    ? 'Départ approuvé — cagnottes recalculées'
                    : 'Départ refusé'}
                </p>
              )}
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}
