'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  ChevronDown,
  ChevronUp,
  Coins,
  Clock,
  Check,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  mockTransactions,
  mockCircles,
  mockCycles,
} from '@venega/types';
import { TransactionType, TransactionStatus } from '@venega/types/enums';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const typeLabels: Record<string, string> = {
  TONTINE_CONTRIBUTION: 'Cotisation tontine',
  SOLIDARITY_CONTRIBUTION: 'Cotisation solidarité',
  PAYOUT: 'Virement reçu',
  ASSISTANCE_DISBURSEMENT: 'Aide solidarité',
  JOINING_FEE: 'Frais de rachat',
  DEPOSIT: 'Dépôt de garantie',
};

const statusLabels: Record<string, string> = {
  COMPLETED: 'Terminé',
  PENDING: 'En attente',
  FAILED: 'Échoué',
};

export default function ActivityPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCircle, setFilterCircle] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // All transactions for current user (u1) — in real app, filtered by auth
  const allTx = mockTransactions;

  // Get circle name + turn for each transaction
  const enriched = allTx.map((tx) => {
    const circle = mockCircles.find((c) => c.id === tx.circleId);
    const cycle = mockCycles.find((c) => c.id === tx.cycleId);
    const month = new Date(tx.createdAt).getMonth();
    const turnNumber = cycle ? cycle.currentTurn - (6 - month) : null;
    return { ...tx, circleName: circle?.name ?? 'Cercle inconnu', circleInviteCode: circle?.inviteCode, turnNumber };
  });

  // Apply filters
  const filtered = enriched.filter((tx) => {
    if (filterCircle !== 'all' && tx.circleId !== filterCircle) return false;
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    return true;
  });

  // Group by circle
  const groupedByCircle = filtered.reduce((acc, tx) => {
    if (!acc[tx.circleId]) acc[tx.circleId] = { name: tx.circleName, inviteCode: tx.circleInviteCode, transactions: [] };
    acc[tx.circleId]!.transactions.push(tx);
    return acc;
  }, {} as Record<string, { name: string; inviteCode?: string; transactions: typeof enriched }>);

  // Stats
  const totalPaid = filtered.filter((t) => t.status === TransactionStatus.COMPLETED && t.type !== TransactionType.PAYOUT).reduce((s, t) => s + t.amount, 0);
  const totalReceived = filtered.filter((t) => t.status === TransactionStatus.COMPLETED && t.type === TransactionType.PAYOUT).reduce((s, t) => s + t.amount, 0);
  const pendingCount = filtered.filter((t) => t.status === TransactionStatus.PENDING).length;

  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-sora text-text">Mon historique</h1>
          <p className="text-text-muted mt-1 font-worksans">
            Toutes vos transactions par cercle et par tour
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={16} className="text-success" />
              <span className="text-xs text-text-muted">Total versé</span>
            </div>
            <p className="text-xl font-bold font-sora text-success">{formatXOF(totalPaid)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft size={16} className="text-primary" />
              <span className="text-xs text-text-muted">Total reçu</span>
            </div>
            <p className="text-xl font-bold font-sora text-primary">{formatXOF(totalReceived)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-warning" />
              <span className="text-xs text-text-muted">En attente</span>
            </div>
            <p className="text-xl font-bold font-sora text-warning">{pendingCount}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <span className="text-sm font-medium text-text-muted">Filtrer :</span>
          </div>
          <select
            value={filterCircle}
            onChange={(e) => setFilterCircle(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-sm font-worksans focus:outline-none focus:border-primary"
          >
            <option value="all">Tous les cercles</option>
            {mockCircles.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-sm font-worksans focus:outline-none focus:border-primary"
          >
            <option value="all">Tous les types</option>
            <option value={TransactionType.TONTINE_CONTRIBUTION}>Cotisation tontine</option>
            <option value={TransactionType.SOLIDARITY_CONTRIBUTION}>Cotisation solidarité</option>
            <option value={TransactionType.PAYOUT}>Virement reçu</option>
            <option value={TransactionType.ASSISTANCE_DISBURSEMENT}>Aide solidarité</option>
            <option value={TransactionType.JOINING_FEE}>Frais de rachat</option>
            <option value={TransactionType.DEPOSIT}>Dépôt de garantie</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-xl text-sm font-worksans focus:outline-none focus:border-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value={TransactionStatus.COMPLETED}>Terminé</option>
            <option value={TransactionStatus.PENDING}>En attente</option>
            <option value={TransactionStatus.FAILED}>Échoué</option>
          </select>
        </div>

        {/* Grouped by Circle */}
        {Object.entries(groupedByCircle).length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <FileText size={24} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-muted font-worksans">Aucune transaction pour ces filtres</p>
          </div>
        )}

        {Object.entries(groupedByCircle).map(([circleId, group]) => (
          <motion.div
            key={circleId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-2xl overflow-hidden"
          >
            {/* Circle Header */}
            <Link
              href={`/circles/${circleId}`}
              className="px-6 py-4 border-b border-border flex items-center justify-between hover:bg-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-tint flex items-center justify-center">
                  <Coins size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold font-sora text-text-main">{group.name}</p>
                  <p className="text-xs text-text-muted">{group.transactions.length} transaction{group.transactions.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-text-muted">{group.inviteCode}</span>
            </Link>

            {/* Transactions */}
            <div className="divide-y divide-border">
              {group.transactions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((tx) => {
                  const isExpanded = expandedId === tx.id;
                  const isOutgoing = tx.type !== TransactionType.PAYOUT && tx.type !== TransactionType.ASSISTANCE_DISBURSEMENT;

                  return (
                    <div key={tx.id}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                        className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-bg/50 transition-colors"
                      >
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isOutgoing ? 'bg-success-tint' : 'bg-primary-tint'
                        }`}>
                          {isOutgoing
                            ? <ArrowUpRight size={18} className="text-success" />
                            : <ArrowDownLeft size={18} className="text-primary" />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-main text-sm">{typeLabels[tx.type] || tx.type}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {tx.memberName} — Tour {tx.turnNumber ?? '—'}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <p className={`font-bold font-sora text-sm ${isOutgoing ? 'text-success' : 'text-primary'}`}>
                            {isOutgoing ? '+' : ''}{formatXOF(tx.amount)}
                          </p>
                          <p className="text-xs text-text-muted">{formatDate(tx.createdAt)}</p>
                        </div>

                        {/* Status */}
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                          tx.status === TransactionStatus.COMPLETED ? 'bg-success/10 text-success'
                          : tx.status === TransactionStatus.PENDING ? 'bg-warning/10 text-warning'
                          : 'bg-danger/10 text-danger'
                        }`}>
                          {statusLabels[tx.status]}
                        </span>

                        {/* Chevron */}
                        {isExpanded ? <ChevronUp size={16} className="text-text-muted shrink-0" /> : <ChevronDown size={16} className="text-text-muted shrink-0" />}
                      </button>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <div className="px-6 py-4 bg-bg/50 border-t border-border">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-text-muted mb-1">Référence</p>
                              <p className="font-medium font-mono text-text-main text-xs">{tx.providerReference || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted mb-1">Cercle</p>
                              <p className="font-medium text-text-main">{tx.circleName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted mb-1">Tour</p>
                              <p className="font-medium text-text-main">{tx.turnNumber ? `Tour ${tx.turnNumber}` : '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted mb-1">Date & heure</p>
                              <p className="font-medium text-text-main">{formatDateTime(tx.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted mb-1">Membre</p>
                              <p className="font-medium text-text-main">{tx.memberName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted mb-1">Type</p>
                              <p className="font-medium text-text-main">{typeLabels[tx.type]}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted mb-1">Montant</p>
                              <p className="font-bold text-text-main">{formatXOF(tx.amount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted mb-1">Statut</p>
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                tx.status === TransactionStatus.COMPLETED ? 'text-success'
                                : tx.status === TransactionStatus.PENDING ? 'text-warning'
                                : 'text-danger'
                              }`}>
                                {tx.status === TransactionStatus.COMPLETED && <Check size={12} />}
                                {tx.status === TransactionStatus.PENDING && <Clock size={12} />}
                                {tx.status === TransactionStatus.FAILED && <AlertTriangle size={12} />}
                                {statusLabels[tx.status]}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
