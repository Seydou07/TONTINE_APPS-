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
import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  X,
  CreditCard,
  Building2,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockTransactions, mockCircles, mockCycles } from '@venega/types';
import { TransactionType, TransactionStatus } from '@venega/types';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${day} à ${time}`;
};

const typeMeta: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  TONTINE_CONTRIBUTION: {
    label: 'Cotisation',
    icon: CreditCard,
    color: '#059669',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  SOLIDARITY_CONTRIBUTION: {
    label: 'Cotisation solidarité',
    icon: CreditCard,
    color: '#D97706',
    bg: 'rgba(217, 119, 6, 0.1)',
  },
  PAYOUT: {
    label: 'Versement',
    icon: ArrowDownLeft,
    color: '#074B36',
    bg: 'rgba(7, 75, 54, 0.1)',
  },
  FEE_PAYMENT: {
    label: 'Frais de gestion',
    icon: Building2,
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.1)',
  },
  JOINING_FEE: {
    label: 'Frais adhésion',
    icon: CheckCircle2,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.1)',
  },
};

export default function ActivityScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCircle, setFilterCircle] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

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
      memberName: 'Seydou Ouattara (Bénéficiaire)',
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

  const filtered = enriched.filter((tx) => {
    if (filterCircle !== 'all' && tx.circleId !== filterCircle) return false;
    if (filterType !== 'all' && tx.type !== filterType) return false;
    return true;
  });

  const activeFilters = (filterCircle !== 'all' ? 1 : 0) + (filterType !== 'all' ? 1 : 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert émeraude */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Historique</Text>
            <Text style={styles.headerSubtitle}>Toutes vos cotisations et versements</Text>
          </View>
          <TouchableOpacity
            style={[styles.filterToggle, activeFilters > 0 && styles.filterToggleActive]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.8}
          >
            <Filter size={18} color="#FFFFFF" />
            {activeFilters > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Corps crème emboîté */}
        <View style={styles.contentBody}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Panneau de filtres optionnel */}
            {showFilters && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.filtersCard}>
                <Text style={styles.filtersTitle}>Filtrer par cercle</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
                  <TouchableOpacity
                    style={[styles.chip, filterCircle === 'all' && styles.chipActive]}
                    onPress={() => setFilterCircle('all')}
                  >
                    <Text style={[styles.chipText, filterCircle === 'all' && styles.chipTextActive]}>Tous</Text>
                  </TouchableOpacity>
                  {mockCircles.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chip, filterCircle === c.id && styles.chipActive]}
                      onPress={() => setFilterCircle(c.id)}
                    >
                      <Text style={[styles.chipText, filterCircle === c.id && styles.chipTextActive]}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* Liste de cartes de transactions séparées */}
            {filtered.length === 0 ? (
              <View style={styles.emptyCard}>
                <FileText size={36} color="#CBD5E1" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>Aucune transaction</Text>
              </View>
            ) : (
              <View style={styles.txListContainer}>
                {filtered.map((tx) => {
                  const isExpanded = expandedId === tx.id;
                  const meta = typeMeta[tx.type] || {
                    label: tx.type,
                    icon: CreditCard,
                    color: '#074B36',
                    bg: 'rgba(7, 75, 54, 0.08)',
                  };
                  const IconComp = meta.icon;

                  return (
                    <View key={tx.id} style={styles.txCardItem}>
                      <TouchableOpacity
                        style={styles.txRowHeader}
                        activeOpacity={0.85}
                        onPress={() => setExpandedId(isExpanded ? null : tx.id)}
                      >
                        {/* Petit dot icône */}
                        <View style={[styles.dotBox, { backgroundColor: meta.bg }]}>
                          <IconComp size={16} color={meta.color} />
                        </View>

                        {/* Libellé direct : Cotisation, Versement, Frais */}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.slimTypeTitle}>{meta.label}</Text>
                          <Text style={styles.slimDateText}>{formatDateTime(tx.createdAt)}</Text>
                        </View>

                        {/* Montant */}
                        <Text style={[styles.slimAmountText, { color: meta.color }]}>
                          {formatXOF(tx.amount)}
                        </Text>

                        {/* Chevron dépliant */}
                        {isExpanded ? (
                          <ChevronUp size={16} color="#94A3B8" style={{ marginLeft: 6 }} />
                        ) : (
                          <ChevronDown size={16} color="#94A3B8" style={{ marginLeft: 6 }} />
                        )}
                      </TouchableOpacity>

                      {/* Volet de détail déplié uniquement au clic */}
                      {isExpanded && (
                        <Animated.View entering={FadeInDown.duration(200)} style={styles.expandedDetailBox}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Cercle :</Text>
                            <Text style={styles.detailValBold}>{tx.circleName}</Text>
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tour de rotation :</Text>
                            <Text style={styles.detailVal}>Tour {tx.turnNumber ?? 1}</Text>
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Membre / Concerne :</Text>
                            <Text style={styles.detailVal}>{tx.memberName}</Text>
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Référence :</Text>
                            <Text style={styles.detailValCode}>{tx.providerReference || 'PAY-2026-X'}</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.detailCircleBtn}
                            onPress={() => router.push(`/circle/${tx.circleId}`)}
                          >
                            <Text style={styles.detailCircleBtnText}>Ouvrir le cercle →</Text>
                          </TouchableOpacity>
                        </Animated.View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
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
    paddingBottom: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  filterToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  filterToggleActive: {
    backgroundColor: 'rgba(54, 227, 149, 0.3)',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontFamily: 'WorkSansBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  contentBody: {
    flex: 1,
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 20,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 12,
  },
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 4,
  },
  filtersTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#074B36',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FAF7F1',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    borderColor: '#074B36',
  },
  chipText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 12,
    color: '#64748B',
  },
  chipTextActive: {
    fontFamily: 'WorkSansSemiBold',
    color: '#074B36',
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
  txListContainer: {
    gap: 12,
  },
  txCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  txRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  slimListCard_deprecated: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  slimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  slimRowLast: {
    borderBottomWidth: 0,
  },
  dotBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slimTypeTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  slimDateText: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  slimAmountText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
  },
  expandedDetailBox: {
    backgroundColor: '#FAF7F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
  },
  detailVal: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#0F172A',
  },
  detailValBold: {
    fontFamily: 'SoraBold',
    fontSize: 12.5,
    color: '#074B36',
  },
  detailValCode: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  detailCircleBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 2,
  },
  detailCircleBtnText: {
    fontFamily: 'WorkSansBold',
    fontSize: 12,
    color: '#074B36',
  },
});
