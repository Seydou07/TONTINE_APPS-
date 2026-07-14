'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockCircles, mockMemberships, mockUsers, mockTransactions, mockCycles } from '@venega/types/mocks';
import { ArrowLeft, Users, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertTriangle, Copy, Check, ChevronDown, ChevronRight, Search } from 'lucide-react';

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} XOF`;
const typeBadge: Record<string, string> = { TONTINE_ONLY: 'bg-emerald-50 text-emerald-600', SOLIDARITY_ONLY: 'bg-violet-50 text-violet-600', HYBRID: 'bg-amber-50 text-amber-600' };
const typeLabel: Record<string, string> = { TONTINE_ONLY: 'Tontine rotative', SOLIDARITY_ONLY: 'Caisse solidarité', HYBRID: 'Tontine + Solidarité' };
const roleLabel: Record<string, string> = { PRESIDENT: 'Président', TREASURER: 'Trésorier', SECRETARY: 'Secrétaire', MEMBER: 'Membre' };
const roleColor: Record<string, string> = { PRESIDENT: 'bg-amber-50 text-amber-600', TREASURER: 'bg-blue-50 text-blue-600', SECRETARY: 'bg-violet-50 text-violet-600', MEMBER: 'bg-gray-100 text-gray-500' };

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const getMonthYear = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
};

function getTurnMonth(circle: any, cycle: any, turnNumber: number) {
  if (!cycle) return `Tour ${turnNumber}`;
  const start = new Date(cycle.startDate);
  const d = new Date(start);
  d.setMonth(d.getMonth() + (turnNumber - 1));
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

function getTurnNumberFromDate(circle: any, cycle: any, dateStr: string): number {
  if (!cycle) return 0;
  const start = new Date(cycle.startDate);
  const d = new Date(dateStr);
  const diffMonths = (d.getFullYear() - start.getFullYear()) * 12 + (d.getMonth() - start.getMonth());
  return diffMonths + 1;
}

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'paiements' | 'transactions' | 'rotation'>('paiements');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTurn, setFilterTurn] = useState<number | 0>(0);

  const circle = mockCircles.find((c) => c.id === circleId);
  const cycle = mockCycles.find((c) => c.circleId === circleId && c.isActive);
  const memberships = useMemo(() =>
    mockMemberships.filter((m) => m.circleId === circleId).map((m) => ({
      ...m,
      user: mockUsers.find((u) => u.id === m.userId) || null,
    })).filter((m) => m.user),
    [circleId]
  );
  const transactions = useMemo(() =>
    mockTransactions.filter((t) => t.circleId === circleId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [circleId]
  );

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (filterTurn > 0) list = list.filter((t) => getTurnNumberFromDate(circle, cycle, t.createdAt) === filterTurn);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.memberName.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.amount.toString().includes(q) ||
        (t.providerReference || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filterTurn, search, circle, cycle]);

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[14px] text-gray-500 mb-4">Cercle introuvable</p>
        <a href="/circles" className="text-[13px] text-emerald-600 font-medium hover:underline">Retour aux cercles</a>
      </div>
    );
  }

  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0);
  const totalTontine = transactions.filter((t) => t.type === 'TONTINE_CONTRIBUTION').reduce((s, t) => s + t.amount, 0);
  const totalSolidarity = transactions.filter((t) => t.type === 'SOLIDARITY_CONTRIBUTION').reduce((s, t) => s + t.amount, 0);
  const totalPayout = transactions.filter((t) => t.type === 'PAYOUT').reduce((s, t) => s + t.amount, 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(circle.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortedMembers = [...memberships].sort((a, b) => (a.turnOrder || 99) - (b.turnOrder || 99));

  const currentTurn = cycle?.currentTurn || 0;
  const totalTurns = cycle?.totalTurns || 0;

  const isLatePayment = (tx: typeof transactions[0]) => {
    const d = new Date(tx.createdAt);
    return d.getDate() > 5;
  };

  const getMemberTurnStatus = (userId: string, turnNumber: number) => {
    const tontineTx = transactions.find((t) => t.userId === userId && t.type === 'TONTINE_CONTRIBUTION' && getTurnNumberFromDate(circle, cycle, t.createdAt) === turnNumber);
    const solidarityTx = transactions.find((t) => t.userId === userId && t.type === 'SOLIDARITY_CONTRIBUTION' && getTurnNumberFromDate(circle, cycle, t.createdAt) === turnNumber);
    if (!tontineTx && !solidarityTx) return null;
    return { tontine: tontineTx || null, solidarity: solidarityTx || null };
  };

  const getTurnStats = (turnNumber: number) => {
    let tontinePaid = 0;
    let tontineLate = 0;
    let tontinePending = 0;
    let tontineMissing = 0;
    for (const m of memberships) {
      const tx = transactions.find((t) => t.userId === m.userId && t.type === 'TONTINE_CONTRIBUTION' && getTurnNumberFromDate(circle, cycle, t.createdAt) === turnNumber);
      if (!tx) { tontineMissing++; continue; }
      if (tx.status === 'PENDING') { tontinePending++; continue; }
      if (tx.status === 'COMPLETED' && isLatePayment(tx)) { tontineLate++; continue; }
      tontinePaid++;
    }
    return { tontinePaid, tontineLate, tontinePending, tontineMissing, total: memberships.length };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-[16px] font-semibold text-gray-900">{circle.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${typeBadge[circle.type]}`}>{typeLabel[circle.type]}</span>
            <span className="text-[11px] text-gray-400">{circle.frequency === 'MONTHLY' ? 'Mensuel' : 'Hebdomadaire'}</span>
            <span className="text-[11px] text-gray-400">|</span>
            <span className="text-[11px] text-gray-400">{circle.memberCount} membres</span>
            {cycle && (
              <>
                <span className="text-[11px] text-gray-400">|</span>
                <span className="text-[11px] font-medium text-emerald-600">Tour {currentTurn}/{totalTurns}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cotisation tontine</p>
          <p className="text-[15px] font-bold text-gray-900 mt-1">{fmt(circle.tontineAmount)}/tour</p>
        </div>
        {circle.type === 'HYBRID' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cotisation solidarité</p>
            <p className="text-[15px] font-bold text-gray-900 mt-1">{fmt(circle.solidarityAmount)}/mois</p>
          </div>
        )}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Total collecté</p>
          <p className="text-[15px] font-bold text-emerald-700 mt-1">{fmt(totalTontine + totalSolidarity)}</p>
        </div>
        <div className="bg-violet-50 rounded-2xl border border-violet-100 p-4">
          <p className="text-[10px] text-violet-600 uppercase tracking-wider">Total versé</p>
          <p className="text-[15px] font-bold text-violet-700 mt-1">{fmt(totalPayout)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[280px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher membre, montant, référence..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
          </div>
          <div className="relative">
            <select value={filterTurn} onChange={(e) => setFilterTurn(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer">
              <option value={0}>Tous les tours</option>
              {Array.from({ length: totalTurns }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>Tour {n} — {getTurnMonth(circle, cycle, n)}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex-1" />
          <div className="flex bg-gray-50 rounded-xl p-0.5 border border-gray-100">
            {[
              { key: 'paiements' as const, label: 'Paiements' },
              { key: 'transactions' as const, label: 'Historique' },
              { key: 'rotation' as const, label: 'Rotation' },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={handleCopyCode} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[12px] font-mono text-gray-600 hover:bg-gray-100 transition-colors">
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {circle.inviteCode}
          </button>
        </div>
      </div>

      {tab === 'paiements' && (
        <div className="space-y-3">
          {Array.from({ length: totalTurns }, (_, i) => i + 1).filter((n) => filterTurn === 0 || n === filterTurn).map((turnNum) => {
            const stats = getTurnStats(turnNum);
            const turnLabel = getTurnMonth(circle, cycle, turnNum);
            const isCurrentTurn = turnNum === currentTurn;
            const isPastTurn = turnNum < currentTurn;
            const isFutureTurn = turnNum > currentTurn;

            return (
              <div key={turnNum} className={`bg-white rounded-2xl border overflow-hidden ${isCurrentTurn ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-100'}`}>
                <div className={`px-5 py-3.5 flex items-center justify-between ${isCurrentTurn ? 'bg-emerald-50/50' : isPastTurn ? 'bg-gray-50/50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold ${isCurrentTurn ? 'bg-emerald-500 text-white' : isPastTurn ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {turnNum}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        Tour {turnNum} — {turnLabel}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Bénéficiaire : {sortedMembers[turnNum - 1]?.user?.firstName} {sortedMembers[turnNum - 1]?.user?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCurrentTurn && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold">Tour actuel</span>}
                    {isPastTurn && <CheckCircle size={16} className="text-emerald-400" />}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-emerald-600 font-medium">{stats.tontinePaid} payé{stats.tontinePaid > 1 ? 's' : ''}</span>
                      {stats.tontineLate > 0 && <span className="text-red-500 font-medium">· {stats.tontineLate} retard</span>}
                      {stats.tontinePending > 0 && <span className="text-amber-500 font-medium">· {stats.tontinePending} en attente</span>}
                      {stats.tontineMissing > 0 && <span className="text-gray-400">· {stats.tontineMissing} absent</span>}
                    </div>
                  </div>
                </div>

                {(!isFutureTurn || isCurrentTurn) && (
                  <div className="divide-y divide-gray-50">
                    {sortedMembers.filter((m) => !search.trim() || `${m.user!.firstName} ${m.user!.lastName}`.toLowerCase().includes(search.toLowerCase())).map((m) => {
                      const turnData = getMemberTurnStatus(m.userId, turnNum);
                      const tontineTx = turnData?.tontine;
                      const solidTx = turnData?.solidarity;
                      const isExpanded = expandedMember === `${m.userId}-${turnNum}`;

                      let statusColor = 'bg-gray-100 text-gray-400';
                      let statusLabel = 'Non cotisé';
                      if (tontineTx) {
                        if (tontineTx.status === 'PENDING') { statusColor = 'bg-amber-50 text-amber-600'; statusLabel = 'En attente'; }
                        else if (tontineTx.status === 'COMPLETED' && isLatePayment(tontineTx)) { statusColor = 'bg-red-50 text-red-500'; statusLabel = 'Retard'; }
                        else if (tontineTx.status === 'COMPLETED') { statusColor = 'bg-emerald-50 text-emerald-600'; statusLabel = 'Payé'; }
                        else { statusColor = 'bg-red-50 text-red-500'; statusLabel = 'Échoué'; }
                      }

                      return (
                        <div key={m.userId}>
                          <div
                            className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => setExpandedMember(isExpanded ? null : `${m.userId}-${turnNum}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {m.user!.firstName?.[0]}{m.user!.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-gray-900">{m.user!.firstName} {m.user!.lastName}</p>
                                <p className="text-[11px] text-gray-400">Tour #{m.turnOrder} · {roleLabel[m.role]}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {tontineTx && (
                                <div className="text-right">
                                  <p className="text-[12px] font-semibold text-gray-900">{fmt(tontineTx.amount)}</p>
                                  <p className="text-[10px] text-gray-400">Tontine</p>
                                </div>
                              )}
                              {solidTx && circle.type === 'HYBRID' && (
                                <div className="text-right">
                                  <p className="text-[12px] font-semibold text-gray-900">{fmt(solidTx.amount)}</p>
                                  <p className="text-[10px] text-gray-400">Solidarité</p>
                                </div>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColor}`}>{statusLabel}</span>
                              {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-5 pb-4 pt-1">
                              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Détail cotisation — Tour {turnNum} ({turnLabel})</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase">Cotisation tontine</p>
                                    {tontineTx ? (
                                      <>
                                        <p className="text-[14px] font-bold text-gray-900 mt-0.5">{fmt(tontineTx.amount)}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                          {tontineTx.status === 'COMPLETED' && !isLatePayment(tontineTx) ? `Payé le ${new Date(tontineTx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                                            : tontineTx.status === 'COMPLETED' && isLatePayment(tontineTx) ? `Retard — payé le ${new Date(tontineTx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                                            : tontineTx.status === 'PENDING' ? 'En attente de paiement'
                                            : 'Paiement échoué'}
                                        </p>
                                        {tontineTx.providerReference && <p className="text-[10px] text-gray-400 mt-1">Réf: {tontineTx.providerReference}</p>}
                                      </>
                                    ) : (
                                      <p className="text-[12px] text-gray-400 mt-0.5">Aucune cotisation enregistrée</p>
                                    )}
                                  </div>
                                  {circle.type === 'HYBRID' && (
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <p className="text-[10px] text-gray-400 uppercase">Cotisation solidarité</p>
                                      {solidTx ? (
                                        <>
                                          <p className="text-[14px] font-bold text-gray-900 mt-0.5">{fmt(solidTx.amount)}</p>
                                          <p className="text-[11px] text-gray-500 mt-0.5">
                                            {solidTx.status === 'COMPLETED' && !isLatePayment(solidTx) ? `Payé le ${new Date(solidTx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                                              : solidTx.status === 'COMPLETED' && isLatePayment(solidTx) ? `Retard — payé le ${new Date(solidTx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                                              : solidTx.status === 'PENDING' ? 'En attente de paiement'
                                              : 'Paiement échoué'}
                                          </p>
                                          {solidTx.providerReference && <p className="text-[10px] text-gray-400 mt-1">Réf: {solidTx.providerReference}</p>}
                                        </>
                                      ) : (
                                        <p className="text-[12px] text-gray-400 mt-0.5">Aucune cotisation enregistrée</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {tontineTx?.status === 'COMPLETED' && isCurrentTurn && sortedMembers[turnNum - 1]?.userId === m.userId && (
                                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 mt-2">
                                    <p className="text-[11px] font-semibold text-emerald-700">Bénéficiaire de ce tour</p>
                                    <p className="text-[11px] text-emerald-600 mt-0.5">
                                      Ce membre reçoit la cagnotte de {fmt(circle.tontineAmount * (stats.tontinePaid + stats.tontineLate))} ce mois-ci.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isFutureTurn && (
                  <div className="px-5 py-4 text-center">
                    <p className="text-[12px] text-gray-400">Ce tour n&apos;a pas encore commencé</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <p className="text-center py-8 text-[13px] text-gray-400">Aucune transaction trouvée</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Date', 'Membre', 'Tour', 'Type', 'Montant', 'Statut'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((tx) => {
                  const turnNum = getTurnNumberFromDate(circle, cycle, tx.createdAt);
                  const turnMonth = getTurnMonth(circle, cycle, turnNum);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-[12px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-medium text-gray-800">{tx.memberName}</td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-medium text-gray-500">Tour {turnNum}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{turnMonth}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${tx.type === 'PAYOUT' ? 'bg-violet-50' : tx.type === 'SOLIDARITY_CONTRIBUTION' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                            {tx.type === 'PAYOUT' ? <ArrowDownLeft size={11} className="text-violet-500" /> : <ArrowUpRight size={11} className={tx.type === 'SOLIDARITY_CONTRIBUTION' ? 'text-blue-500' : 'text-emerald-500'} />}
                          </div>
                          <span className="text-[12px] text-gray-600">{tx.type === 'PAYOUT' ? 'Versement reçu' : tx.type === 'SOLIDARITY_CONTRIBUTION' ? 'Solidarité' : 'Cotisation tontine'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{fmt(tx.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                          {tx.status === 'COMPLETED' ? 'Complété' : tx.status === 'PENDING' ? 'En attente' : 'Retard'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'rotation' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-2">Ordre de rotation</h3>
            <p className="text-[12px] text-gray-500 mb-4">Chaque tour, un membre reçoit la cagnotte complète. Voici l&apos;ordre de passage :</p>
            <div className="space-y-2">
              {sortedMembers.map((m, idx) => {
                const turnNum = idx + 1;
                const turnMonth = getTurnMonth(circle, cycle, turnNum);
                const isCurrentTurn = turnNum === currentTurn;
                const isPastTurn = turnNum < currentTurn;
                const isNext = isCurrentTurn;
                const turnStats = getTurnStats(turnNum);
                return (
                  <div key={m.userId} className={`flex items-center gap-4 p-3 rounded-xl ${isCurrentTurn ? 'bg-emerald-50 border border-emerald-200' : isPastTurn ? 'bg-gray-50' : 'bg-white border border-gray-100'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${isCurrentTurn ? 'bg-emerald-500 text-white' : isPastTurn ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {turnNum}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-gray-900">{m.user!.firstName} {m.user!.lastName}</p>
                      <p className="text-[11px] text-gray-400">{turnMonth} · {roleLabel[m.role]}</p>
                    </div>
                    <div className="text-right">
                      {isPastTurn ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium"><CheckCircle size={12} /> Reçu ({turnStats.tontinePaid} payés)</span>
                      ) : isCurrentTurn ? (
                        <div>
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full mb-1">Tour actuel</span>
                          <p className="text-[10px] text-gray-400">{turnStats.tontinePaid}/{turnStats.total} cotisations reçues</p>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock size={12} /> {turnMonth}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {circle.type === 'HYBRID' && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-amber-800">Cercle hybride</p>
                  <p className="text-[12px] text-amber-700 mt-0.5">
                    Ce cercle combine tontine rotative ({fmt(circle.tontineAmount)}/tour) + caisse de solidarité ({fmt(circle.solidarityAmount)}/mois).
                    Les membres cotisent pour les deux fonds chaque mois.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
