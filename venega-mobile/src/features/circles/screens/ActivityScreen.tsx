import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react-native';
import { mockTransactions, mockCircles, mockCycles } from '@venega/types';
import { TransactionType, TransactionStatus } from '@venega/types';
import { getLedgerEntries } from '../circleStore';
import TransactionDetailModal from '../../../components/TransactionDetailModal';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const formatFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
  ' à ' + formatTime(dateStr);

const formatDateHeader = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return "Aujourd'hui";
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const CREDIT_COLOR = '#0B6E4F';
const CREDIT_BG = '#E4F0EB';
const DEBIT_COLOR = '#E53E3E';
const DEBIT_BG = '#FFECEC';

const typeMeta: Record<string, { label: string; icon: any; color: string; bg: string; doneLabel: string }> = {
  TONTINE_CONTRIBUTION: {
    label: 'Cotisation',
    icon: ArrowUpRight,
    color: CREDIT_COLOR,
    bg: CREDIT_BG,
    doneLabel: 'Payé',
  },
  SOLIDARITY_CONTRIBUTION: {
    label: 'Cotisation solidarité',
    icon: ArrowUpRight,
    color: CREDIT_COLOR,
    bg: CREDIT_BG,
    doneLabel: 'Payé',
  },
  PAYOUT: {
    label: 'Cagnotte reçue',
    icon: ArrowDownLeft,
    color: DEBIT_COLOR,
    bg: DEBIT_BG,
    doneLabel: 'Versée',
  },
  FEE_PAYMENT: {
    label: 'Frais de gestion',
    icon: Building2,
    color: DEBIT_COLOR,
    bg: DEBIT_BG,
    doneLabel: 'Payé',
  },
  JOINING_FEE: {
    label: "Frais d'adhésion",
    icon: CheckCircle2,
    color: CREDIT_COLOR,
    bg: CREDIT_BG,
    doneLabel: 'Payé',
  },
  SOLIDARITY_DISBURSEMENT: {
    label: 'Aide solidarité versée',
    icon: ArrowDownLeft,
    color: DEBIT_COLOR,
    bg: DEBIT_BG,
    doneLabel: 'Décaissée',
  },
};

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

export default function ActivityScreen() {
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Transactions synthétiques propres : Cotisation, Versement, Frais
  const mockExtendedTx = [
    {
      id: 'tx-1',
      circleId: 'c1',
      cycleId: 'cy1',
      type: TransactionType.TONTINE_CONTRIBUTION,
      amount: 10500,
      status: TransactionStatus.COMPLETED,
      memberName: 'Aminata Diallo',
      providerReference: 'PAY-884912',
      createdAt: '2026-08-11T10:15:00Z',
    },
    {
      id: 'tx-2',
      circleId: 'c1',
      cycleId: 'cy1',
      type: TransactionType.PAYOUT,
      amount: 60000,
      status: TransactionStatus.COMPLETED,
      memberName: 'Seydou Ouattara',
      providerReference: 'TX-993810',
      createdAt: '2026-08-11T09:45:00Z',
    },
    {
      id: 'tx-3',
      circleId: 'c1',
      cycleId: 'cy1',
      type: 'FEE_PAYMENT',
      amount: 2700,
      status: TransactionStatus.COMPLETED,
      memberName: 'Fondateur net (90%)',
      providerReference: 'FEE-202608',
      createdAt: '2026-08-11T09:45:00Z',
    },
    {
      id: 'tx-4',
      circleId: 'c2',
      cycleId: 'cy2',
      type: TransactionType.TONTINE_CONTRIBUTION,
      amount: 25000,
      status: TransactionStatus.COMPLETED,
      memberName: 'Ibrahim Sawadogo',
      providerReference: 'PAY-774102',
      createdAt: '2026-08-10T16:20:00Z',
    },
    {
      id: 'tx-5',
      circleId: 'c1',
      cycleId: 'cy1',
      type: TransactionType.SOLIDARITY_CONTRIBUTION,
      amount: 2000,
      status: TransactionStatus.COMPLETED,
      memberName: 'Fatou Traoré',
      providerReference: 'SOL-554201',
      createdAt: '2026-08-09T14:10:00Z',
    },
    ...mockTransactions,
  ];

  const enriched = mockExtendedTx.map((tx) => {
    const circle = mockCircles.find((c) => c.id === tx.circleId);
    const cycle = mockCycles.find((c) => c.id === tx.cycleId);
    const month = new Date(tx.createdAt).getMonth();
    const turnNumber = cycle ? cycle.currentTurn - Math.abs(6 - month) : 1;
    return {
      ...tx,
      circleName: circle?.name ?? 'Tontine Familiale',
      circleInviteCode: circle?.inviteCode,
      turnNumber,
    };
  });

  // Décaissements de la caisse de solidarité (traces du grand livre de chaque cercle)
  const solidarityDisbursements = mockCircles
    .filter((c) => c.solidarityAmount > 0)
    .flatMap((c) => getLedgerEntries(c.id).filter((e) => e.type === 'DEBIT'))
    .map((e) => ({
      id: e.id,
      circleId: e.circleId,
      cycleId: '',
      type: 'SOLIDARITY_DISBURSEMENT' as const,
      amount: e.amount,
      status: TransactionStatus.COMPLETED,
      memberName: e.memberName ?? '',
      providerReference: e.relatedTransactionId,
      createdAt: e.createdAt,
      circleName: mockCircles.find((c) => c.id === e.circleId)?.name ?? '',
      circleInviteCode: undefined,
      turnNumber: 1,
    }));

  const allTx = [...enriched, ...solidarityDisbursements];
  const monthsWithActivity = [...new Set(allTx.map((tx) => new Date(tx.createdAt).getMonth()))].sort((a, b) => a - b);
  const filtered = allTx.filter(
    (tx) => monthFilter === null || new Date(tx.createdAt).getMonth() === monthFilter
  );

  // Regroupement par jour, dans l'ordre chronologique inverse
  const groups: { dateLabel: string; items: typeof filtered }[] = [];
  [...filtered]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((tx) => {
      const label = formatDateHeader(tx.createdAt);
      const group = groups.find((g) => g.dateLabel === label);
      if (group) group.items.push(tx);
      else groups.push({ dateLabel: label, items: [tx] });
    });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert émeraude */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Activité</Text>
            {monthsWithActivity.length > 1 && (
              <View style={styles.filterWrap}>
                <TouchableOpacity
                  style={styles.filterBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowMonthFilter((v) => !v)}
                >
                  <Filter size={13} color="#FFFFFF" />
                  <Text style={styles.filterBtnText}>
                    {monthFilter !== null ? monthLabels[monthFilter] : 'Filtrer'}
                  </Text>
                </TouchableOpacity>

                {showMonthFilter && (
                  <View style={styles.monthDropdown}>
                    <ScrollView style={styles.monthDropdownScroll} showsVerticalScrollIndicator={false}>
                      <TouchableOpacity
                        style={styles.monthDropdownItem}
                        onPress={() => { setMonthFilter(null); setShowMonthFilter(false); }}
                      >
                        <Text style={[styles.monthDropdownItemText, monthFilter === null && styles.monthDropdownItemTextActive]}>
                          Tous les mois
                        </Text>
                      </TouchableOpacity>
                      {monthsWithActivity.map((mIdx) => (
                        <TouchableOpacity
                          key={mIdx}
                          style={styles.monthDropdownItem}
                          onPress={() => { setMonthFilter(mIdx); setShowMonthFilter(false); }}
                        >
                          <Text style={[styles.monthDropdownItemText, monthFilter === mIdx && styles.monthDropdownItemTextActive]}>
                            {monthLabels[mIdx]} 2026
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Corps blanc */}
        <View style={styles.contentBody}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {groups.length === 0 ? (
              <View style={styles.emptyCard}>
                <FileText size={36} color="#CBD5E1" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>Aucune transaction</Text>
              </View>
            ) : (
              groups.map((group) => (
                <View key={group.dateLabel} style={styles.dateGroup}>
                  <Text style={styles.dateGroupLabel}>{group.dateLabel}</Text>
                  {group.items.map((tx) => {
                    const meta = (typeMeta[tx.type] ?? typeMeta.TONTINE_CONTRIBUTION)!;
                    const IconComp = meta.icon;
                    const statusLabel =
                      tx.status === TransactionStatus.PENDING ? 'En attente'
                      : tx.status === TransactionStatus.FAILED ? 'Échouée'
                      : meta.doneLabel;
                    const statusColor =
                      tx.status === TransactionStatus.PENDING ? '#B9852A'
                      : tx.status === TransactionStatus.FAILED ? '#E53E3E'
                      : meta.color;
                    const label =
                      tx.type === TransactionType.PAYOUT && tx.memberName
                        ? `Cagnotte reçue par ${tx.memberName}`
                        : tx.type === 'SOLIDARITY_DISBURSEMENT' && tx.memberName
                        ? `Aide solidarité versée à ${tx.memberName}`
                        : meta.label;

                    return (
                      <TouchableOpacity
                        key={tx.id}
                        style={styles.txRow}
                        activeOpacity={0.85}
                        onPress={() => setSelectedTx({ ...tx, label, statusLabel })}
                      >
                        <View style={[styles.dotBox, { backgroundColor: meta.bg }]}>
                          {tx.status === TransactionStatus.PENDING
                            ? <Clock size={16} color="#B9852A" />
                            : <IconComp size={16} color={meta.color} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.txLabel}>{label}</Text>
                          <Text style={styles.txMeta}>{tx.circleName}</Text>
                          <Text style={styles.txTime}>{formatTime(tx.createdAt)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.txAmount, { color: meta.color }]}>
                            {meta.color === CREDIT_COLOR ? '+' : '−'}{formatXOF(tx.amount)}
                          </Text>
                          <Text style={[styles.txStatus, { color: statusColor }]}>{statusLabel}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      {selectedTx && (
        <TransactionDetailModal
          visible={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          isCredit={selectedTx.type === TransactionType.TONTINE_CONTRIBUTION || selectedTx.type === TransactionType.SOLIDARITY_CONTRIBUTION}
          name={selectedTx.label}
          amount={formatXOF(selectedTx.amount)}
          fields={[
            { label: 'Type', value: selectedTx.label },
            { label: 'Cercle', value: selectedTx.circleName ?? '—' },
            ...(selectedTx.providerReference ? [{ label: 'Référence', value: selectedTx.providerReference }] : []),
            { label: 'Statut', value: selectedTx.statusLabel },
            { label: 'Date', value: formatFullDate(selectedTx.createdAt) },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  header: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  filterWrap: { zIndex: 20 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  filterBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#FFFFFF' },
  monthDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  monthDropdownScroll: { maxHeight: 240 },
  monthDropdownItem: { paddingVertical: 10, paddingHorizontal: 14 },
  monthDropdownItemText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#334155' },
  monthDropdownItemTextActive: { color: '#074B36' },
  contentBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -14,
    paddingTop: 20,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#475569',
  },
  dateGroup: {
    gap: 10,
    marginBottom: 20,
  },
  dateGroupLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#94A3B8',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#1A202C',
  },
  txMeta: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
    lineHeight: 14,
  },
  txTime: {
    fontFamily: 'WorkSans',
    fontSize: 10.5,
    color: '#CBD5E1',
    marginTop: 1,
  },
  txAmount: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#1A202C',
  },
  txStatus: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 10,
    marginTop: 2,
  },
});
