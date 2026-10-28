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
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Chip } from '../../../components/ui';
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
const DEBIT_COLOR = '#C1443A';
const DEBIT_BG = '#F7E7E5';

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

  const totalIn = filtered
    .filter((tx) => (typeMeta[tx.type] ?? typeMeta.TONTINE_CONTRIBUTION)!.color === CREDIT_COLOR)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = filtered
    .filter((tx) => (typeMeta[tx.type] ?? typeMeta.TONTINE_CONTRIBUTION)!.color !== CREDIT_COLOR)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>Activité</Text>

          {/* Entrées / sorties de la période */}
          <View style={styles.summary}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Entrées</Text>
              <Text style={[styles.summaryValue, { color: CREDIT_COLOR }]} numberOfLines={1} adjustsFontSizeToFit>
                +{formatXOF(totalIn)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Sorties</Text>
              <Text style={[styles.summaryValue, { color: colors.ink }]} numberOfLines={1} adjustsFontSizeToFit>
                −{formatXOF(totalOut)}
              </Text>
            </View>
          </View>

          {monthsWithActivity.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipsScroll}
            >
              <Chip label="Tout" selected={monthFilter === null} onPress={() => setMonthFilter(null)} />
              {[...monthsWithActivity].reverse().map((mIdx) => (
                <Chip
                  key={mIdx}
                  label={`${monthLabels[mIdx]} 2026`}
                  selected={monthFilter === mIdx}
                  onPress={() => setMonthFilter(mIdx)}
                />
              ))}
            </ScrollView>
          )}

          {groups.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FileText size={24} color={colors.subtle} strokeWidth={1.6} />
              </View>
              <Text style={styles.emptyTitle}>Aucune transaction</Text>
              <Text style={styles.emptyText}>Les cotisations et versements de vos cercles apparaîtront ici.</Text>
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.dateLabel} style={styles.dateGroup}>
                <Text style={styles.dateGroupLabel}>{group.dateLabel}</Text>
                <View style={styles.card}>
                  {group.items.map((tx, i) => {
                    const meta = (typeMeta[tx.type] ?? typeMeta.TONTINE_CONTRIBUTION)!;
                    const IconComp = meta.icon;
                    const isCredit = meta.color === CREDIT_COLOR;
                    const pending = tx.status === TransactionStatus.PENDING;
                    const failed = tx.status === TransactionStatus.FAILED;
                    const statusLabel = pending ? 'En attente' : failed ? 'Échouée' : meta.doneLabel;
                    const label =
                      tx.type === TransactionType.PAYOUT && tx.memberName
                        ? `Cagnotte versée à ${tx.memberName}`
                        : tx.type === 'SOLIDARITY_DISBURSEMENT' && tx.memberName
                        ? `Aide versée à ${tx.memberName}`
                        : tx.memberName && !tx.memberName.includes('(')
                        ? `${meta.label} de ${tx.memberName}`
                        : meta.label;

                    return (
                      <TouchableOpacity
                        key={tx.id}
                        style={styles.txRow}
                        activeOpacity={0.6}
                        onPress={() => setSelectedTx({ ...tx, label, statusLabel })}
                      >
                        <View style={[styles.txIcon, { backgroundColor: pending ? colors.accent.tint : meta.bg }]}>
                          {pending ? (
                            <Clock size={18} color={colors.accent.dark} />
                          ) : (
                            <IconComp size={18} color={meta.color} strokeWidth={2} />
                          )}
                        </View>
                        <View style={[styles.txBody, i < group.items.length - 1 && styles.txBorder]}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.txLabel} numberOfLines={1}>
                              {label}
                            </Text>
                            <Text style={styles.txMeta} numberOfLines={1}>
                              {tx.circleName} · {formatTime(tx.createdAt)}
                            </Text>
                          </View>
                          <View style={styles.txRight}>
                            <Text style={[styles.txAmount, { color: isCredit ? CREDIT_COLOR : colors.ink }]}>
                              {isCredit ? '+' : '−'}
                              {formatXOF(tx.amount)}
                            </Text>
                            {(pending || failed) && (
                              <Text style={[styles.txStatus, { color: pending ? colors.accent.dark : DEBIT_COLOR }]}>
                                {statusLabel}
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
  container: { flex: 1, backgroundColor: colors.fill },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  headerTitle: { ...typography.title, color: colors.ink, paddingHorizontal: 4, paddingTop: 12, paddingBottom: 16 },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16,
  },
  summaryCol: { flex: 1, paddingHorizontal: 16 },
  summaryDivider: { width: 1, height: 36, backgroundColor: colors.line },
  summaryLabel: { ...typography.footnote, color: colors.muted },
  summaryValue: { ...typography.headline, fontWeight: '700', marginTop: 4 },

  chipsScroll: { marginTop: 16, marginHorizontal: -16 },
  chips: { gap: 8, paddingHorizontal: 16 },

  dateGroup: { marginTop: 24 },
  dateGroupLabel: { ...typography.footnote, fontWeight: '600', color: colors.muted, marginBottom: 8, marginLeft: 4 },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingRight: 14 },
  txBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  txLabel: { ...typography.callout, fontWeight: '600', color: colors.ink },
  txMeta: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { ...typography.callout, fontWeight: '700' },
  txStatus: { ...typography.caption, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: { ...typography.headline, color: colors.ink },
  emptyText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
