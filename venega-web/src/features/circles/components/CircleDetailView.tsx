'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  FileText,
  Link2,
  SearchX,
  Send,
  Settings,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import {
  CircleType,
  mockCircles,
  mockCycles,
  mockMemberships,
  mockReliabilityEvents,
  mockTurnValidation,
  mockUsers,
  Role,
} from '@venega/types';
import { Badge } from '@/components/ui/Badge';
import { HeroBand, PageBody } from '@/components/ui/HeroBand';
import { btnAmber, btnOnDark, btnPrimary, btnSmallDanger, btnSmallPrimary, card } from '@/components/ui/classes';
import { Avatar, EmptyState, ProgressBar, SectionHeader } from '@/components/ui/misc';
import { formatDate, formatFcfa, formatPhone } from '@/lib/format';
import {
  PAYMENT_STATUS,
  ROLE_LABELS,
  circleTypeLabel,
  frequencyLabel,
  isTontine,
  scoreTone,
} from '../labels';
import { CirclePaymentHistory } from './CirclePaymentHistory';

const OVERLAP = 48;

export function CircleDetailView({ circleId }: { circleId: string }) {
  const [copied, setCopied] = useState(false);

  const circle = mockCircles.find((c) => c.id === circleId);
  if (!circle) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={SearchX}
          title="Cercle introuvable"
          text="Ce cercle n'existe pas ou vous n'en êtes pas membre."
          action={
            <Link href="/circles" className={btnPrimary}>
              Retour à mes cercles
            </Link>
          }
        />
      </div>
    );
  }

  const cycle = mockCycles.find((c) => c.circleId === circleId && c.isActive);
  const turn = mockTurnValidation;
  const tontine = isTontine(circle.type);
  const members = mockMemberships
    .filter((m) => m.circleId === circleId)
    .map((m) => ({ ...m, user: mockUsers.find((u) => u.id === m.userId) }))
    .filter((m): m is typeof m & { user: NonNullable<typeof m.user> } => !!m.user);
  const me = members.find((m) => m.user.id === 'u1');
  const isPresident = me?.role === Role.PRESIDENT;
  const events = mockReliabilityEvents.filter((e) => e.circleId === circleId);
  const inviteLink = `https://venega.app/join/${circle.inviteCode}`;

  const copyInvite = () => {
    navigator.clipboard?.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const payments = [
    tontine && circle.tontineAmount > 0
      ? { label: 'Cotisation tontine', amount: circle.tontineAmount, type: 'TONTINE' }
      : null,
    circle.solidarityAmount > 0 && circle.type !== CircleType.TONTINE_ONLY
      ? { label: 'Cotisation solidarité', amount: circle.solidarityAmount, type: 'SOLIDARITY' }
      : null,
  ].filter((p): p is { label: string; amount: number; type: string } => !!p);

  const rules = [
    circle.managementFee > 0 && { label: 'Frais de gestion', value: `${formatFcfa(circle.managementFee)} / tour` },
    circle.depositRequired && { label: 'Dépôt de garantie', value: formatFcfa(circle.tontineAmount) },
    { label: 'Exclusion après', value: `${circle.exclusionThreshold} retards` },
    circle.recalculateOnLeave && { label: 'Recalcul si départ', value: 'Activé' },
    circle.nextPaymentRequired && { label: 'Paiement avant gain', value: 'Obligatoire' },
  ].filter((r): r is { label: string; value: string } => !!r);

  return (
    <>
      <HeroBand overlap={OVERLAP} width="wide">
        <Link
          href="/circles"
          className="-ml-1 mb-3 inline-flex items-center gap-1 text-[14px] font-medium text-white/75 hover:text-white"
        >
          <ChevronLeft size={18} aria-hidden />
          Mes cercles
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="onDark" dot>
                {circleTypeLabel(circle.type)}
              </Badge>
              {me?.role && ROLE_LABELS[me.role] && <Badge tone="onDark">{ROLE_LABELS[me.role]}</Badge>}
            </div>
            <h1 className="break-words text-[24px] font-bold leading-tight text-white md:text-[28px]">{circle.name}</h1>
            <p className="mt-1 text-[14px] text-white/75">
              {cycle ? `Tour ${cycle.currentTurn} sur ${cycle.totalTurns} · ` : ''}
              {frequencyLabel(circle.frequency)} · {circle.memberCount} membres
            </p>
            {circle.rules.goalItem && <p className="mt-1 text-[14px] text-amber">Lot : {circle.rules.goalItem}</p>}
          </div>
          {isPresident && (
            <div className="flex gap-2">
              <Link href={`/circles/${circleId}/requests`} className={btnAmber}>
                <UserPlus size={17} aria-hidden />
                Demandes
              </Link>
              <button type="button" className={btnOnDark}>
                <Settings size={17} aria-hidden />
                Paramètres
              </button>
            </div>
          )}
        </div>
      </HeroBand>

      <PageBody overlap={OVERLAP} width="wide">
        {/* Payer */}
        {payments.length > 0 && (
          <section className={`${card} divide-y divide-line`} aria-label="Payer ma cotisation">
            {payments.map((p) => (
              <div key={p.type} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex-1">
                  <p className="text-[13px] text-muted">{p.label}</p>
                  <p className="text-[22px] font-bold text-ink">{formatFcfa(p.amount)}</p>
                  {circle.managementFee > 0 && p.type === 'TONTINE' && (
                    <p className="text-[13px] text-muted">+ {formatFcfa(circle.managementFee)} de frais de gestion</p>
                  )}
                </div>
                <Link
                  href={`/payment?circleId=${circle.id}&amount=${p.amount}&type=${p.type}`}
                  className={`${btnPrimary} sm:w-auto sm:min-w-[220px]`}
                >
                  Payer {formatFcfa(p.amount)}
                </Link>
              </div>
            ))}
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ── Colonne principale ── */}
          <div className="min-w-0 space-y-6">
            {/* Validation du tour (président) */}
            {isPresident && turn && (
              <section className={`${card} p-5`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" aria-hidden />
                  <h2 className="text-[17px] font-bold text-ink">Validation du tour {turn.turnNumber}</h2>
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-[13px] text-muted">
                    <span>Cotisations reçues</span>
                    <span className="font-semibold text-ink">
                      {turn.totalValidated} / {turn.totalRequired}
                    </span>
                  </div>
                  <ProgressBar value={(turn.totalValidated / turn.totalRequired) * 100} label="Cotisations reçues" />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Cagnotte', value: formatFcfa(turn.poolAmount) },
                    { label: 'Frais', value: formatFcfa(turn.managementFeeTotal) },
                    { label: 'Bénéficiaire', value: formatFcfa(turn.beneficiaryAmount) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-[12px] bg-fill p-3">
                      <dt className="text-[12px] text-muted">{s.label}</dt>
                      <dd className="mt-0.5 text-[14px] font-bold text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                {circle.nextPaymentRequired && (
                  <p
                    className={`mt-3 flex items-center gap-2 rounded-[12px] p-3 text-[14px] ${
                      turn.nextPaymentDone ? 'bg-primary-tint text-primary-dark' : 'bg-amber-tint text-amber-dark'
                    }`}
                  >
                    {turn.nextPaymentDone ? <Check size={16} aria-hidden /> : <Clock size={16} aria-hidden />}
                    {turn.nextPaymentDone
                      ? 'Le bénéficiaire a payé le tour suivant.'
                      : 'Le bénéficiaire doit payer le tour suivant avant le versement.'}
                  </p>
                )}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="flex-1 text-[14px] text-muted">
                    {turn.canRelease
                      ? 'Toutes les conditions sont réunies.'
                      : `${turn.totalRequired - turn.totalValidated} cotisation(s) manquante(s).`}{' '}
                    Montant à verser : <strong className="text-ink">{formatFcfa(turn.beneficiaryAmount)}</strong>
                  </p>
                  <button type="button" disabled={!turn.canRelease} className={btnSmallPrimary}>
                    <Send size={16} aria-hidden />
                    Valider le virement
                  </button>
                </div>
              </section>
            )}

            {/* Membres */}
            {members.length > 0 && (
              <section>
                <SectionHeader title="Membres" subtitle="Statut de la cotisation du tour en cours" />
                <ul className={`${card} divide-y divide-line`}>
                  {members.map((m) => {
                    const status = PAYMENT_STATUS[m.paymentStatus];
                    const name = `${m.user.firstName} ${m.user.lastName}`;
                    return (
                      <li key={m.userId} className="flex items-center gap-3 px-4 py-3">
                        <Avatar name={name} />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-1.5 text-[15px] font-semibold text-ink">
                            <span className="truncate">{name}</span>
                            {m.role !== Role.MEMBER && ROLE_LABELS[m.role] && (
                              <span className="rounded-md bg-fill px-1.5 py-0.5 text-[11px] font-semibold text-ink-soft">
                                {ROLE_LABELS[m.role]}
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[13px] text-muted">
                            {m.turnOrder ? `Tour n° ${m.turnOrder} · ` : ''}
                            {formatPhone(m.user.phoneNumber)}
                          </p>
                        </div>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Fiabilité (président) */}
            {isPresident && members.length > 0 && (
              <section>
                <SectionHeader title="Score de fiabilité" subtitle="Visible par le président uniquement" />
                <ul className={`${card} divide-y divide-line`}>
                  {members.map((m) => {
                    const score = m.reliabilityScore;
                    const name = `${m.user.firstName} ${m.user.lastName}`;
                    return (
                      <li key={m.userId} className="flex items-center gap-3 px-4 py-3">
                        <Avatar name={name} tone="neutral" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-ink">{name}</p>
                          {score < 50 && (
                            <p className="flex items-center gap-1 text-[13px] font-medium text-danger">
                              <AlertTriangle size={13} aria-hidden />
                              Membre irrégulier
                            </p>
                          )}
                        </div>
                        <Badge tone={scoreTone(score)}>{score}/100</Badge>
                        {score < 50 && (
                          <button type="button" className={btnSmallDanger}>
                            Exclure
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <CirclePaymentHistory circleId={circleId} />
          </div>

          {/* ── Colonne latérale ── */}
          <aside className="space-y-6">
            {/* Invitation */}
            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-primary" aria-hidden />
                <h2 className="text-[15px] font-bold text-ink">Inviter des membres</h2>
              </div>
              <div className="mt-3 rounded-[12px] bg-fill p-3">
                <p className="text-[12px] text-muted">Code d&apos;invitation</p>
                <p className="font-mono text-[20px] font-bold tracking-widest text-ink">{circle.inviteCode}</p>
                <p className="mt-1 truncate font-mono text-[12px] text-muted">{inviteLink}</p>
              </div>
              <button type="button" onClick={copyInvite} className={`${btnSmallPrimary} mt-3 w-full`}>
                {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                {copied ? 'Lien copié' : 'Copier le lien'}
              </button>
            </section>

            {/* Conditions */}
            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" aria-hidden />
                <h2 className="text-[15px] font-bold text-ink">Conditions du cercle</h2>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft">{circle.conditions}</p>
              <dl className="mt-3 divide-y divide-line border-t border-line">
                {rules.map((r) => (
                  <div key={r.label} className="flex justify-between gap-3 py-2.5 text-[14px]">
                    <dt className="text-muted">{r.label}</dt>
                    <dd className="font-semibold text-ink">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Historique des retards (président) */}
            {isPresident && events.length > 0 && (
              <section className={`${card} p-4`}>
                <h2 className="text-[15px] font-bold text-ink">Historique des retards</h2>
                <ul className="mt-2 divide-y divide-line">
                  {events.map((e) => {
                    const user = mockUsers.find((u) => u.id === e.userId);
                    return (
                      <li key={e.id} className="flex items-start gap-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] text-ink">{e.description}</p>
                          <p className="text-[12px] text-muted">
                            {user?.firstName} {user?.lastName} · {formatDate(e.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`text-[13px] font-bold ${
                            e.scoreImpact > 0 ? 'text-primary' : e.scoreImpact < 0 ? 'text-danger' : 'text-muted'
                          }`}
                        >
                          {e.scoreImpact > 0 ? '+' : ''}
                          {e.scoreImpact}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </PageBody>
    </>
  );
}
