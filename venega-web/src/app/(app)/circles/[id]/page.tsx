'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Coins,
  Calendar,
  Code,
  Copy,
  Check,
  Clock,
  Shield,
  HandHeart,
  FileText,
  Send,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Link2,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import {
  mockCircles,
  mockMemberships,
  mockUsers,
  mockCycles,
  mockTransactions,
  mockTurnValidation,
  mockReliabilityEvents,
} from '@venega/types';
import { CircleType, TransactionType } from '@venega/types/enums';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

const freqLabels: Record<string, string> = {
  DAILY: 'Quotidien',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bimensuel',
  MONTHLY: 'Mensuel',
  QUARTERLY: 'Trimestriel',
};

export default function CircleDetailPage() {
  const params = useParams();
  const circleId = params.id as string;
  const circle = mockCircles.find((c) => c.id === circleId);
  const cycle = mockCycles.find((c) => c.circleId === circleId && c.isActive);
  const turnValidation = mockTurnValidation;

  if (!circle) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted text-lg">Cercle introuvable.</p>
        <Link href="/circles" className="text-primary hover:text-primary-dark mt-4 inline-block font-medium">
          Retour aux cercles
        </Link>
      </div>
    );
  }

  const members = mockMemberships
    .filter((m) => m.circleId === circleId)
    .map((m) => ({ ...m, user: mockUsers.find((u) => u.id === m.userId) }))
    .filter((m) => m.user);

  const circleTransactions = mockTransactions.filter((t) => t.circleId === circleId);
  const monthlyGroups = circleTransactions.reduce((acc, t) => {
    const date = new Date(t.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, typeof circleTransactions>);

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  const [expandedTurn, setExpandedTurn] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentMembership = members.find((m) => m.user?.id === 'u1');
  const isPresident = currentMembership?.role === 'PRESIDENT';

  const circleEvents = mockReliabilityEvents.filter((e) => e.circleId === circleId);

  const inviteLink = `https://venega.app/join/${circle.inviteCode}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/circles" className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors mb-4">
          <ArrowLeft size={20} />
          Retour aux cercles
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-main">{circle.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${
                circle.type === CircleType.TONTINE_ONLY ? 'badge-success'
                : circle.type === CircleType.SOLIDARITY_ONLY ? 'badge-purple'
                : 'badge-warning'
              }`}>
                {circle.type === CircleType.TONTINE_ONLY ? 'Tontine'
                : circle.type === CircleType.SOLIDARITY_ONLY ? 'Solidarité'
                : 'Hybride'}
              </span>
              <span className="text-sm text-text-muted">
                Tour {cycle?.currentTurn}/{cycle?.totalTurns} — {freqLabels[circle.frequency] || circle.frequency}
              </span>
            </div>
          </div>
          {isPresident && (
            <div className="flex gap-2">
              <Link
                href={`/circles/${circleId}/requests`}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Users size={16} />
                Demandes
              </Link>
              <button className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-bg transition-colors flex items-center gap-2">
                <Settings size={16} />
                Paramètres
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── CONDITIONS (FIRST — always visible) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 bg-primary-tint border-b border-border flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-text-main">Conditions du cercle</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-text-main whitespace-pre-wrap leading-relaxed">{circle.conditions}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {circle.managementFee > 0 && (
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-text-muted">Frais de gestion</p>
                  <p className="font-semibold text-text-main">{formatXOF(circle.managementFee)}/tour</p>
                </div>
              )}
              {circle.depositRequired && (
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-text-muted">Dépôt de garantie</p>
                  <p className="font-semibold text-text-main">{formatXOF(circle.tontineAmount)}</p>
                </div>
              )}
              <div className="bg-bg rounded-xl p-3 border border-border">
                <p className="text-xs text-text-muted">Exclusion après</p>
                <p className="font-semibold text-text-main">{circle.exclusionThreshold} retards</p>
              </div>
              {circle.recalculateOnLeave && (
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-text-muted">Recalcul si départ</p>
                  <p className="font-semibold text-success">Activé</p>
                </div>
              )}
              {circle.nextPaymentRequired && (
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-text-muted">Paiement avant gain</p>
                  <p className="font-semibold text-warning">Obligatoire</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── PAYER ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        {circle.type !== CircleType.SOLIDARITY_ONLY && (
          <div className="flex-1 bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
              <Coins size={18} className="text-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">Cotisation tontine</p>
              <p className="font-heading font-bold text-text-main">{formatXOF(circle.tontineAmount)}</p>
            </div>
            <Link
              href={`/payment?circleId=${circle.id}&amount=${circle.tontineAmount}&type=TONTINE`}
              className="px-5 py-2.5 bg-accent text-primary-dark rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shrink-0"
            >
              Payer
            </Link>
          </div>
        )}
        {circle.type !== CircleType.TONTINE_ONLY && circle.solidarityAmount > 0 && (
          <div className="flex-1 bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
              <HandHeart size={18} className="text-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">Cotisation solidarité</p>
              <p className="font-heading font-bold text-text-main">{formatXOF(circle.solidarityAmount)}</p>
            </div>
            <Link
              href={`/payment?circleId=${circle.id}&amount=${circle.solidarityAmount}&type=SOLIDARITY`}
              className="px-5 py-2.5 bg-accent text-primary-dark rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shrink-0"
            >
              Payer
            </Link>
          </div>
        )}
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins size={16} className="text-primary" />
            <span className="text-xs text-text-muted">Cotisation totale</span>
          </div>
          <p className="text-xl font-heading font-bold text-text-main">{formatXOF(circle.tontineAmount + circle.solidarityAmount + circle.managementFee)}</p>
          {circle.managementFee > 0 && (
            <p className="text-xs text-text-muted mt-0.5">incl. {formatXOF(circle.managementFee)} frais</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-accent" />
            <span className="text-xs text-text-muted">Membres</span>
          </div>
          <p className="text-xl font-heading font-bold text-text-main">{circle.memberCount}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code size={16} className="text-purple" />
            <span className="text-xs text-text-muted">Code</span>
          </div>
          <p className="text-xl font-heading font-bold text-text-main font-mono">{circle.inviteCode}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <HandHeart size={16} className="text-accent" />
            <span className="text-xs text-text-muted">Solidarité</span>
          </div>
          <p className="text-xl font-heading font-bold text-text-main">{formatXOF(circle.solidarityAmount)}</p>
        </motion.div>
      </div>

      {/* ── INVITE LINK ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3">
          <Link2 size={18} className="text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted">Lien d'invitation</p>
            <p className="text-sm font-medium text-text-main truncate font-mono">{inviteLink}</p>
          </div>
          <button
            onClick={copyInvite}
            className="px-4 py-2 bg-primary-tint text-primary rounded-xl text-sm font-medium hover:bg-primary/10 transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </motion.div>

      {/* ── TURN VALIDATION (President only) ── */}
      {isPresident && turnValidation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Validation du tour {turnValidation.turnNumber}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Cotisations reçues</p>
              <p className="text-xl font-bold text-text-main">{turnValidation.totalValidated}/{turnValidation.totalRequired}</p>
            </div>
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Montant pool</p>
              <p className="text-xl font-bold text-primary">{formatXOF(turnValidation.poolAmount)}</p>
            </div>
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Frais gestion</p>
              <p className="text-xl font-bold text-text-main">{formatXOF(turnValidation.managementFeeTotal)}</p>
            </div>
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Bénéficiaire</p>
              <p className="text-xl font-bold text-success">{formatXOF(turnValidation.beneficiaryAmount)}</p>
            </div>
          </div>

          {circle.nextPaymentRequired && (
            <div className={`flex items-center gap-2 p-3 rounded-xl ${turnValidation.nextPaymentDone ? 'bg-success/10' : 'bg-warning/10'}`}>
              {turnValidation.nextPaymentDone ? <Check size={16} className="text-success" /> : <Clock size={16} className="text-warning" />}
              <span className="text-sm font-medium">
                {turnValidation.nextPaymentDone
                  ? 'Le bénéficiaire a payé le tour suivant'
                  : 'Le bénéficiaire doit payer le tour suivant avant libération'}
              </span>
            </div>
          )}

          <div className={`flex items-center gap-3 p-4 rounded-xl border ${turnValidation.canRelease ? 'border-success/30 bg-success/5' : 'border-border bg-bg'}`}>
            <div className="flex-1">
              <p className="font-medium text-text-main">
                {turnValidation.canRelease
                  ? 'Toutes les conditions sont réunies'
                  : `${turnValidation.totalRequired - turnValidation.totalValidated} cotisation(s) manquante(s)`}
              </p>
              <p className="text-sm text-text-muted">
                Montant à verser : <strong className="text-success">{formatXOF(turnValidation.beneficiaryAmount)}</strong>
              </p>
            </div>
            <button
              disabled={!turnValidation.canRelease}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                turnValidation.canRelease
                  ? 'bg-success text-white hover:opacity-90'
                  : 'bg-border text-text-muted cursor-not-allowed'
              }`}
            >
              <Send size={18} />
              Valider le virement
            </button>
          </div>
        </motion.div>
      )}

      {/* ── MEMBERS ── */}
      {members.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h2 className="text-xl font-heading font-bold text-text-main mb-4">Membres</h2>
          <div className="card overflow-hidden">
            <div className="divide-y divide-border">
              {members.map((member) => (
                <div key={member.userId} className="px-4 md:px-6 py-4 flex items-center justify-between hover:bg-bg/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {member.user!.avatarUrl ? (
                        <img src={member.user!.avatarUrl} alt={member.user!.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted font-semibold text-sm">
                          {member.user!.firstName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-main truncate">{member.user!.firstName} {member.user!.lastName}</p>
                        {member.role !== 'MEMBER' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-primary-tint text-primary rounded">
                            {member.role === 'PRESIDENT' ? 'Président' : member.role === 'TREASURER' ? 'Trésorier' : 'Secrétaire'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted truncate">{member.user!.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Payment status — visible to ALL */}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      member.paymentStatus === 'PAID' ? 'bg-success/10 text-success'
                      : member.paymentStatus === 'PENDING' ? 'bg-warning/10 text-warning'
                      : 'bg-danger/10 text-danger'
                    }`}>
                      {member.paymentStatus === 'PAID' ? 'Payé' : member.paymentStatus === 'PENDING' ? 'En attente' : 'Retard'}
                    </span>
                    <span className="text-xs text-text-muted w-8 text-right">#{member.turnOrder || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── PRESIDENT ONLY: Reliability scores + events ── */}
      {isPresident && (
        <>
          {members.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="text-xl font-heading font-bold text-text-main mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-primary" />
                Score de fiabilité
                <span className="text-xs font-normal text-text-muted ml-2">(Président uniquement)</span>
              </h2>
              <div className="card overflow-hidden">
                <div className="divide-y divide-border">
                  {members.map((member) => {
                    const score = member.reliabilityScore;
                    const isIrregular = score < 50;
                    return (
                      <div key={member.userId} className={`px-4 md:px-6 py-4 flex items-center justify-between ${isIrregular ? 'bg-danger/5' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                            {member.user!.avatarUrl ? (
                              <img src={member.user!.avatarUrl} alt={member.user!.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-muted font-semibold text-sm">
                                {member.user!.firstName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-main">{member.user!.firstName} {member.user!.lastName}</p>
                            {isIrregular && (
                              <p className="text-xs text-danger font-medium flex items-center gap-1 mt-0.5">
                                <AlertTriangle size={10} />
                                Membre irrégulier
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
                            score >= 80 ? 'bg-success/10 text-success'
                            : score >= 50 ? 'bg-warning/10 text-warning'
                            : 'bg-danger/10 text-danger'
                          }`}>
                            {score}/100
                          </div>
                          {score < 50 && (
                            <button className="text-xs px-3 py-1.5 border border-danger/30 text-danger rounded-lg hover:bg-danger/5 transition-colors">
                              Exclure
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {circleEvents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <h2 className="text-xl font-heading font-bold text-text-main mb-4">Historique des retards</h2>
              <div className="card overflow-hidden">
                <div className="divide-y divide-border">
                  {circleEvents.map((event) => {
                    const user = mockUsers.find((u) => u.id === event.userId);
                    return (
                      <div key={event.id} className="px-4 md:px-6 py-3 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          event.type === 'ON_TIME' ? 'bg-success'
                          : event.type === 'LATE' ? 'bg-warning'
                          : event.type === 'MISSED' ? 'bg-danger'
                          : 'bg-text-muted'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-main truncate">{event.description}</p>
                          <p className="text-xs text-text-muted">{user?.firstName} {user?.lastName} — {new Date(event.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`text-xs font-semibold ${
                          event.scoreImpact > 0 ? 'text-success' : event.scoreImpact < 0 ? 'text-danger' : 'text-text-muted'
                        }`}>
                          {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ── PAYMENT HISTORY (visible to ALL) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h2 className="text-xl font-heading font-bold text-text-main mb-4">Historique des paiements</h2>
        <div className="space-y-3">
          {Object.entries(monthlyGroups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, txs]) => {
              const [year, month] = key.split('-');
              const monthLabel = `${monthNames[parseInt(month || '1') - 1]} ${year}`;
              const turnNumber = parseInt(month || '1') - 5;
              const contributions = txs.filter((t) => t.type === TransactionType.TONTINE_CONTRIBUTION);
              const solidarity = txs.filter((t) => t.type === TransactionType.SOLIDARITY_CONTRIBUTION);
              const payouts = txs.filter((t) => t.type === TransactionType.PAYOUT);
              const isExpanded = expandedTurn === key;

              return (
                <div key={key} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedTurn(isExpanded ? null : key)}
                    className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-bg/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-text-muted" />
                      <div>
                        <p className="font-medium text-text-main">{monthLabel}</p>
                        <p className="text-xs text-text-muted">Tour {turnNumber > 0 ? turnNumber : '—'} — {contributions.length} cotisations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">{formatXOF(contributions.reduce((s, t) => s + t.amount, 0))}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border divide-y divide-border">
                      {contributions.length > 0 && (
                        <div className="p-4 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Cotisations tontine</p>
                          {contributions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${tx.status === 'COMPLETED' ? 'bg-success' : tx.status === 'PENDING' ? 'bg-warning' : 'bg-danger'}`} />
                                <span className="text-text-main">{tx.memberName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatXOF(tx.amount)}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  tx.status === 'COMPLETED' ? 'bg-success/10 text-success'
                                  : tx.status === 'PENDING' ? 'bg-warning/10 text-warning'
                                  : 'bg-danger/10 text-danger'
                                }`}>
                                  {tx.status === 'COMPLETED' ? 'OK' : tx.status === 'PENDING' ? 'Attente' : 'Échoué'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {solidarity.length > 0 && (
                        <div className="p-4 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Cotisations solidarité</p>
                          {solidarity.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${tx.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`} />
                                <span className="text-text-main">{tx.memberName}</span>
                              </div>
                              <span className="font-medium">{formatXOF(tx.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {payouts.length > 0 && (
                        <div className="p-4 space-y-2 bg-success/5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-success mb-2">Virement bénéficiaire</p>
                          {payouts.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between text-sm">
                              <span className="text-success font-medium">{tx.memberName}</span>
                              <span className="font-bold text-success">{formatXOF(tx.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
