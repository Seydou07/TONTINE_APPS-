import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, Coins, Clock, Filter, FileText, Check, AlertTriangle, X } from 'lucide-react-native';
import { mockTransactions, mockCircles, mockCycles } from '@venega/types';
import { TransactionType, TransactionStatus } from '@venega/types';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${day} ${time}`;
};

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

export default function ActivityScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCircle, setFilterCircle] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const allTx = mockTransactions;

  const enriched = allTx.map((tx) => {
    const circle = mockCircles.find((c) => c.id === tx.circleId);
    const cycle = mockCycles.find((c) => c.id === tx.cycleId);
    const month = new Date(tx.createdAt).getMonth();
    const turnNumber = cycle ? cycle.currentTurn - (6 - month) : null;
    return { ...tx, circleName: circle?.name ?? 'Cercle inconnu', circleInviteCode: circle?.inviteCode, turnNumber };
  });

  const filtered = enriched.filter((tx) => {
    if (filterCircle !== 'all' && tx.circleId !== filterCircle) return false;
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    return true;
  });

  const groupedByCircle = filtered.reduce((acc, tx) => {
    if (!acc[tx.circleId]) acc[tx.circleId] = { name: tx.circleName, inviteCode: tx.circleInviteCode, transactions: [] };
    acc[tx.circleId]!.transactions.push(tx);
    return acc;
  }, {} as Record<string, { name: string; inviteCode?: string; transactions: typeof enriched }>);

  const totalPaid = filtered.filter((t) => t.status === TransactionStatus.COMPLETED && t.type !== TransactionType.PAYOUT).reduce((s, t) => s + t.amount, 0);
  const totalReceived = filtered.filter((t) => t.status === TransactionStatus.COMPLETED && t.type === TransactionType.PAYOUT).reduce((s, t) => s + t.amount, 0);
  const pendingCount = filtered.filter((t) => t.status === TransactionStatus.PENDING).length;

  const activeFilters = (filterCircle !== 'all' ? 1 : 0) + (filterType !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon historique</Text>
        <TouchableOpacity
          style={[styles.filterToggle, activeFilters > 0 && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={activeFilters > 0 ? '#fff' : colors.text} />
          {activeFilters > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
              <ArrowUpRight size={18} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>{formatXOF(totalPaid)}</Text>
            <Text style={styles.statLabel}>Total versé</Text>
          </View>
          <View style={[styles.statCard, { marginLeft: spacing[3] }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary.tint }]}>
              <ArrowDownLeft size={18} color={colors.primary.DEFAULT} />
            </View>
            <Text style={[styles.statValue, { color: colors.primary.DEFAULT }]}>{formatXOF(totalReceived)}</Text>
            <Text style={styles.statLabel}>Total reçu</Text>
          </View>
        </View>
        <View style={styles.statCardFull}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={18} color="#D97706" />
          </View>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersCard}>
            <Text style={styles.filtersTitle}>Filtrer</Text>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Cercle</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <TouchableOpacity style={[styles.chip, filterCircle === 'all' && styles.chipActive]} onPress={() => setFilterCircle('all')}>
                  <Text style={[styles.chipText, filterCircle === 'all' && styles.chipTextActive]}>Tous</Text>
                </TouchableOpacity>
                {mockCircles.map((c) => (
                  <TouchableOpacity key={c.id} style={[styles.chip, filterCircle === c.id && styles.chipActive]} onPress={() => setFilterCircle(c.id)}>
                    <Text style={[styles.chipText, filterCircle === c.id && styles.chipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <TouchableOpacity style={[styles.chip, filterType === 'all' && styles.chipActive]} onPress={() => setFilterType('all')}>
                  <Text style={[styles.chipText, filterType === 'all' && styles.chipTextActive]}>Tous</Text>
                </TouchableOpacity>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <TouchableOpacity key={key} style={[styles.chip, filterType === key && styles.chipActive]} onPress={() => setFilterType(key)}>
                    <Text style={[styles.chipText, filterType === key && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Statut</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <TouchableOpacity style={[styles.chip, filterStatus === 'all' && styles.chipActive]} onPress={() => setFilterStatus('all')}>
                  <Text style={[styles.chipText, filterStatus === 'all' && styles.chipTextActive]}>Tous</Text>
                </TouchableOpacity>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <TouchableOpacity key={key} style={[styles.chip, filterStatus === key && styles.chipActive]} onPress={() => setFilterStatus(key)}>
                    <Text style={[styles.chipText, filterStatus === key && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {activeFilters > 0 && (
              <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => { setFilterCircle('all'); setFilterType('all'); setFilterStatus('all'); }}>
                <X size={14} color={colors.danger.DEFAULT} />
                <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Grouped by Circle */}
        {Object.keys(groupedByCircle).length === 0 && (
          <View style={styles.emptyCard}>
            <FileText size={24} color={colors.textMuted} />
            <Text style={styles.emptyText}>Aucune transaction pour ces filtres</Text>
          </View>
        )}

        {Object.entries(groupedByCircle).map(([circleId, group]) => {
          const circle = mockCircles.find((c) => c.id === circleId);
          return (
            <View key={circleId} style={styles.circleGroup}>
              <TouchableOpacity
                style={styles.circleGroupHeader}
                onPress={() => router.push(`/circle/${circleId}`)}
              >
                <View style={styles.circleGroupIcon}>
                  <Coins size={18} color={colors.primary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.circleGroupName}>{group.name}</Text>
                  <Text style={styles.circleGroupMeta}>{group.transactions.length} transaction{group.transactions.length > 1 ? 's' : ''}</Text>
                </View>
                <Text style={styles.circleGroupCode}>{group.inviteCode}</Text>
              </TouchableOpacity>

              {group.transactions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((tx) => {
                  const isExpanded = expandedId === tx.id;
                  const isOutgoing = tx.type !== TransactionType.PAYOUT && tx.type !== TransactionType.ASSISTANCE_DISBURSEMENT;
                  const statusColor = tx.status === TransactionStatus.COMPLETED ? colors.success : tx.status === TransactionStatus.PENDING ? '#D97706' : colors.danger.DEFAULT;

                  return (
                    <View key={tx.id}>
                      <TouchableOpacity
                        style={styles.txRow}
                        onPress={() => setExpandedId(isExpanded ? null : tx.id)}
                      >
                        <View style={[styles.txIcon, { backgroundColor: isOutgoing ? '#ECFDF5' : colors.primary.tint }]}>
                          {isOutgoing ? <ArrowUpRight size={16} color={colors.success} /> : <ArrowDownLeft size={16} color={colors.primary.DEFAULT} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.txType}>{typeLabels[tx.type] || tx.type}</Text>
                          <Text style={styles.txMeta}>{tx.memberName} — Tour {tx.turnNumber ?? '—'}</Text>
                        </View>
                        <View style={styles.txRight}>
                          <Text style={[styles.txAmount, { color: isOutgoing ? colors.success : colors.primary.DEFAULT }]}>
                            {isOutgoing ? '+' : ''}{formatXOF(tx.amount)}
                          </Text>
                          <View style={[styles.txStatus, { backgroundColor: statusColor + '18' }]}>
                            <Text style={[styles.txStatusText, { color: statusColor }]}>{statusLabels[tx.status]}</Text>
                          </View>
                        </View>
                        {isExpanded ? <ChevronUp size={16} color={colors.textMuted} style={{ marginLeft: spacing[2] }} /> : <ChevronDown size={16} color={colors.textMuted} style={{ marginLeft: spacing[2] }} />}
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.txExpanded}>
                          <View style={styles.txExpandedRow}>
                            <View style={styles.txExpandedCol}>
                              <Text style={styles.txExpandedLabel}>Référence</Text>
                              <Text style={styles.txExpandedValue}>{tx.providerReference || '—'}</Text>
                            </View>
                            <View style={styles.txExpandedCol}>
                              <Text style={styles.txExpandedLabel}>Tour</Text>
                              <Text style={styles.txExpandedValue}>{tx.turnNumber ? `Tour ${tx.turnNumber}` : '—'}</Text>
                            </View>
                          </View>
                          <View style={styles.txExpandedRow}>
                            <View style={styles.txExpandedCol}>
                              <Text style={styles.txExpandedLabel}>Date & heure</Text>
                              <Text style={styles.txExpandedValue}>{formatDateTime(tx.createdAt)}</Text>
                            </View>
                            <View style={styles.txExpandedCol}>
                              <Text style={styles.txExpandedLabel}>Membre</Text>
                              <Text style={styles.txExpandedValue}>{tx.memberName}</Text>
                            </View>
                          </View>
                          <View style={styles.txExpandedRow}>
                            <View style={styles.txExpandedCol}>
                              <Text style={styles.txExpandedLabel}>Type</Text>
                              <Text style={styles.txExpandedValue}>{typeLabels[tx.type]}</Text>
                            </View>
                            <View style={styles.txExpandedCol}>
                              <Text style={styles.txExpandedLabel}>Montant</Text>
                              <Text style={[styles.txExpandedValue, { fontWeight: '700' }]}>{formatXOF(tx.amount)}</Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora', textAlign: 'center' },
  filterToggle: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterToggleActive: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  filterBadge: { position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.danger.DEFAULT, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', fontFamily: 'WorkSans' },
  scroll: { padding: spacing[5], paddingBottom: 40 },
  statsRow: { flexDirection: 'row', marginBottom: spacing[3] },
  statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4] },
  statCardFull: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[5] },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: 2 },
  statLabel: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },
  filtersCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[5] },
  filtersTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[3] },
  filterGroup: { marginBottom: spacing[3] },
  filterLabel: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  filterChips: { flexDirection: 'row', gap: spacing[2] },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF' },
  chipActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  chipTextActive: { color: '#059669' },
  clearFiltersBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing[2] },
  clearFiltersText: { fontSize: 12, fontWeight: '600', color: colors.danger.DEFAULT, fontFamily: 'WorkSans' },
  emptyCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[8], alignItems: 'center', gap: spacing[3] },
  emptyText: { fontSize: 14, color: colors.textMuted, fontFamily: 'WorkSans' },
  circleGroup: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[4], overflow: 'hidden' },
  circleGroupHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border },
  circleGroupIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  circleGroupName: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  circleGroupMeta: { fontSize: 11, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: 2 },
  circleGroupCode: { fontSize: 11, color: colors.textMuted, fontFamily: 'Sora' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  txIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  txType: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  txMeta: { fontSize: 11, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontWeight: '700', fontFamily: 'Sora' },
  txStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  txStatusText: { fontSize: 10, fontWeight: '600', fontFamily: 'WorkSans' },
  txExpanded: { backgroundColor: '#F8FAFB', paddingHorizontal: spacing[4], paddingVertical: spacing[3], gap: spacing[3] },
  txExpandedRow: { flexDirection: 'row', gap: spacing[3] },
  txExpandedCol: { flex: 1 },
  txExpandedLabel: { fontSize: 11, color: colors.textMuted, fontFamily: 'WorkSans', marginBottom: 2 },
  txExpandedValue: { fontSize: 12, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
});
