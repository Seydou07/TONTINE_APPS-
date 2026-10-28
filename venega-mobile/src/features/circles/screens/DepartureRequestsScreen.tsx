import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  HandCoins,
  Calculator,
  Check,
  XCircle,
  CheckCircle2,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Avatar, Button, Chip, IconButton, Sheet } from '../../../components/ui';
import {
  getCircle,
  getCircles,
  getCircleMembers,
  getDepartureRequests,
  approveDeparture,
  rejectDeparture,
} from '../circleStore';
import { DepartureRequestStatus } from '@venega/types';
import type { DepartureRequest } from '@venega/types';

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

const statusInfo = (s: DepartureRequestStatus) => {
  switch (s) {
    case DepartureRequestStatus.PENDING:
      return { label: 'En attente', color: colors.accent.dark, bg: colors.accent.tint };
    case DepartureRequestStatus.APPROVED:
      return { label: 'Approuvé', color: colors.primary.DEFAULT, bg: colors.primary.tint };
    default:
      return { label: 'Refusé', color: colors.danger.DEFAULT, bg: colors.danger.tint };
  }
};

export default function DepartureRequestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;

  const [requests, setRequests] = useState<DepartureRequest[]>(() =>
    getDepartureRequests(circle.id)
  );
  const avatarOf = (userId: string) =>
    getCircleMembers(circle.id).find((m) => m.userId === userId)?.user?.avatarUrl;
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selected, setSelected] = useState<DepartureRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === DepartureRequestStatus.PENDING);
  const visibleRequests = filter === 'pending' ? pendingRequests : requests;
  const pendingCount = pendingRequests.length;

  const handleApprove = (r: DepartureRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      approveDeparture(r.id);
      const updated = getDepartureRequests(circle.id).find((x) => x.id === r.id);
      setRequests(getDepartureRequests(circle.id));
      setSelected(updated ?? null);
      setActionLoading(false);
    }, 1200);
  };

  const handleReject = (r: DepartureRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      rejectDeparture(r.id, 'Refusé par le fondateur');
      setRequests(getDepartureRequests(circle.id));
      setSelected(null);
      setActionLoading(false);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* En-tête */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>Demandes de départ</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{circle.name}</Text>
          </View>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.body}>
          {/* Filtres */}
          <View style={styles.filterRow}>
            <Chip
              label={`En attente (${pendingCount})`}
              selected={filter === 'pending'}
              onPress={() => setFilter('pending')}
            />
            <Chip
              label={`Toutes (${requests.length})`}
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
            />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {visibleRequests.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <HandCoins size={26} color={colors.primary.DEFAULT} />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'pending' ? 'Aucune demande de départ' : 'Aucune demande'}
                </Text>
                <Text style={styles.emptyText}>
                  Quand un membre qui n'a pas reçu sa cagnotte veut partir, sa demande apparaît ici.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                {visibleRequests.map((r, idx) => {
                  const st = statusInfo(r.status);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.requestRow, idx < visibleRequests.length - 1 && styles.rowDivider]}
                      activeOpacity={0.6}
                      onPress={() => setSelected(r)}
                      accessibilityRole="button"
                      accessibilityLabel={`Demande de départ de ${r.memberName}`}
                    >
                      <Avatar name={r.memberName} uri={avatarOf(r.userId)} size={40} />
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName} numberOfLines={1}>{r.memberName}</Text>
                        <Text style={styles.rowMeta}>
                          {r.pastTurns} tour(s) cotisé(s) · {formatXOF(r.totalRecover)} à récupérer
                        </Text>
                      </View>
                      <View style={styles.rowRight}>
                        <View style={[styles.badge, { backgroundColor: st.bg }]}>
                          <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                        </View>
                        <ChevronRight size={18} color={colors.subtle} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={styles.hintText}>
              Approuver un départ sans ajouter de membre : les cagnottes sont recalculées automatiquement.
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* FEUILLE DÉTAIL */}
      <Sheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            {/* En-tête */}
            <View style={styles.detailHeader}>
              <Avatar name={selected.memberName} uri={avatarOf(selected.userId)} size={56} />
              <View style={styles.flexShrink}>
                <Text style={styles.detailName}>{selected.memberName}</Text>
                <Text style={styles.detailSub}>Demande reçue le {formatDate(selected.createdAt)}</Text>
              </View>
              <IconButton icon={X} variant="plain" accessibilityLabel="Fermer" onPress={() => setSelected(null)} />
            </View>

            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              {/* Situation */}
              <Text style={styles.sectionLabel}>Situation</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cagnotte déjà reçue</Text>
                  <View style={[styles.badge, { backgroundColor: colors.primary.tint }]}>
                    <Text style={[styles.badgeText, { color: colors.primary.DEFAULT }]}>Non — éligible au départ</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tours cotisés (non reçus)</Text>
                  <Text style={styles.infoValue}>{selected.pastTurns}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total à récupérer</Text>
                  <Text style={[styles.infoValue, styles.infoValueStrong]}>
                    {formatXOF(selected.totalRecover)}
                  </Text>
                </View>
              </View>

              {/* Ventilation du remboursement */}
              <Text style={styles.sectionLabel}>Qui lui rembourse quoi (main à main)</Text>
              <View style={styles.infoCard}>
                {selected.reimbursements.length === 0 ? (
                  <Text style={styles.breakdownEmpty}>Aucun tour passé à rembourser.</Text>
                ) : (
                  selected.reimbursements.map((r, i) => (
                    <View
                      key={r.turnNumber}
                      style={[styles.breakdownRow, i < selected.reimbursements.length - 1 && styles.rowDivider]}
                    >
                      <View style={styles.turnPill}>
                        <Text style={styles.turnPillText}>Tour {r.turnNumber}</Text>
                      </View>
                      <Text style={styles.breakdownName} numberOfLines={1}>{r.beneficiaryName}</Text>
                      <Text style={styles.breakdownAmount}>{formatXOF(r.amount)}</Text>
                    </View>
                  ))
                )}
              </View>
              <Text style={styles.breakdownNote}>
                Le paiement se fait directement avec chaque bénéficiaire, sans passer par l'application.
              </Text>

              {/* Recalcul des cagnottes */}
              <Text style={styles.sectionLabel}>Conséquence de l'approbation</Text>
              <View style={styles.recalcCard}>
                <View style={styles.recalcIcon}>
                  <Calculator size={18} color={colors.info.DEFAULT} />
                </View>
                <View style={styles.flexShrink}>
                  <Text style={styles.recalcTitle}>Aucun remplaçant — cagnottes recalculées</Text>
                  <Text style={styles.recalcText}>
                    Le cercle continue normalement sans nouveau membre. Les cotisations restantes sont
                    réajustées pour que le pot reste entier.
                  </Text>
                </View>
              </View>

              {selected.status === DepartureRequestStatus.APPROVED && selected.recalculatedContribution !== undefined && (
                <View style={[styles.notice, { backgroundColor: colors.primary.tint }]}>
                  <CheckCircle2 size={16} color={colors.primary.DEFAULT} />
                  <Text style={[styles.noticeText, { color: colors.primary.dark }]}>
                    Départ approuvé — nouvelle cotisation : {formatXOF(selected.recalculatedContribution)} par membre restant.
                  </Text>
                </View>
              )}

              {selected.status === DepartureRequestStatus.REJECTED && (
                <View style={[styles.notice, { backgroundColor: colors.danger.tint }]}>
                  <XCircle size={16} color={colors.danger.DEFAULT} />
                  <Text style={[styles.noticeText, { color: colors.danger.dark }]}>
                    Départ refusé — {selected.rejectionReason ?? 'le membre reste dans le cercle.'}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              {selected.status === DepartureRequestStatus.PENDING ? (
                <>
                  <Button
                    title="Approuver sans remplaçant"
                    icon={CheckCircle2}
                    loading={actionLoading}
                    onPress={() => handleApprove(selected)}
                  />
                  <Button
                    title="Refuser"
                    variant="secondary"
                    icon={XCircle}
                    disabled={actionLoading}
                    onPress={() => handleReject(selected)}
                  />
                </>
              ) : (
                <View style={[styles.notice, styles.noticeFlat, styles.noticeCenter, { backgroundColor: colors.primary.tint }]}>
                  <Check size={18} color={colors.primary.DEFAULT} />
                  <Text style={styles.decidedText}>
                    {selected.status === DepartureRequestStatus.APPROVED
                      ? 'Départ approuvé — cagnottes recalculées'
                      : 'Départ refusé'}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flex: 1, flexShrink: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  /* ── En-tête ── */
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headline,
    color: colors.ink,
  },
  headerSub: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.muted,
  },
  headerSide: {
    width: 40,
  },

  /* ── Corps ── */
  body: {
    flex: 1,
    backgroundColor: colors.fill,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowInfo: {
    flex: 1,
    flexShrink: 1,
  },
  rowName: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.ink,
  },
  rowMeta: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    flexShrink: 1,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },

  /* ── État vide ── */
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  hintText: {
    ...typography.footnote,
    color: colors.subtle,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  /* ── Feuille détail ── */
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  detailName: {
    ...typography.headline,
    color: colors.ink,
  },
  detailSub: {
    ...typography.footnote,
    color: colors.muted,
  },
  detailScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  sectionLabel: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 18,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  infoLabel: {
    ...typography.callout,
    color: colors.muted,
    flexShrink: 1,
  },
  infoValue: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'right',
    flexShrink: 1,
  },
  infoValueStrong: {
    fontWeight: '700',
    color: colors.danger.DEFAULT,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  turnPill: {
    backgroundColor: colors.fill,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  turnPillText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  breakdownName: {
    flex: 1,
    ...typography.callout,
    fontWeight: '600',
    color: colors.ink,
  },
  breakdownAmount: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.danger.DEFAULT,
  },
  breakdownNote: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 8,
  },
  breakdownEmpty: {
    ...typography.callout,
    color: colors.muted,
    paddingVertical: 12,
  },
  recalcCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
  },
  recalcIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.info.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recalcTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.ink,
  },
  recalcText: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 2,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 16,
  },
  noticeFlat: {
    marginTop: 0,
  },
  noticeCenter: {
    justifyContent: 'center',
  },
  noticeText: {
    flex: 1,
    ...typography.footnote,
    fontWeight: '500',
  },
  decidedText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.primary.dark,
    flexShrink: 1,
  },
  actions: {
    gap: 10,
    marginTop: 16,
  },
});
