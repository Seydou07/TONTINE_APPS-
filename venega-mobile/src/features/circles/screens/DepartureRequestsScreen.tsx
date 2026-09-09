import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
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
  Loader,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  getCircle,
  getCircles,
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
      return { label: 'En attente', color: '#B9852A', bg: 'rgba(217, 164, 65, 0.14)' };
    case DepartureRequestStatus.APPROVED:
      return { label: 'Approuvé', color: '#0B6E4F', bg: 'rgba(11, 110, 79, 0.1)' };
    default:
      return { label: 'Refusé', color: '#E53E3E', bg: 'rgba(229, 62, 62, 0.1)' };
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
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Demandes de départ</Text>
            <View style={[styles.backBtn, styles.countPill]}>
              <Text style={styles.countPillText}>{pendingCount}</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>{circle.name}</Text>
        </View>

        {/* Corps crème */}
        <View style={styles.bodySheet}>
          {/* Filtres */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
              onPress={() => setFilter('pending')}
            >
              <Text style={[styles.filterChipText, filter === 'pending' && styles.filterChipTextActive]}>
                En attente ({pendingCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
                Toutes ({requests.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {visibleRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <HandCoins size={34} color="#10B981" />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'pending' ? 'Aucune demande de départ' : 'Aucune demande'}
                </Text>
                <Text style={styles.emptyText}>
                  Quand un membre qui n'a pas reçu sa cagnotte veut partir, sa demande apparaît ici.
                </Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {visibleRequests.map((r, idx) => {
                  const st = statusInfo(r.status);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.requestRow, idx === visibleRequests.length - 1 && styles.requestRowLast]}
                      activeOpacity={0.75}
                      onPress={() => setSelected(r)}
                    >
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                          {(r.memberName.trim().split(/\s+/)[0]?.[0] ?? '') +
                            (r.memberName.trim().split(/\s+/)[1]?.[0] ?? '')}
                        </Text>
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName} numberOfLines={1}>{r.memberName}</Text>
                        <Text style={styles.rowMeta}>
                          {r.pastTurns} tour(s) cotisé(s) • {formatXOF(r.totalRecover)} à récupérer
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: st.color }]}>{st.label}</Text>
                        </View>
                        <ChevronRight size={17} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={styles.hintText}>
              Approuver un départ SANS ajouter de membre : les cagnottes sont recalculées automatiquement.
            </Text>
          </ScrollView>
        </View>

        {/* MODALE DÉTAIL */}
        <Modal visible={!!selected} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              {selected && (
                <>
                  {/* En-tête */}
                  <View style={styles.detailHeader}>
                    <View style={styles.detailAvatar}>
                      <Text style={styles.detailAvatarText}>
                        {(selected.memberName.trim().split(/\s+/)[0]?.[0] ?? '') +
                          (selected.memberName.trim().split(/\s+/)[1]?.[0] ?? '')}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailName}>{selected.memberName}</Text>
                      <Text style={styles.detailSub}>Demande reçue le {formatDate(selected.createdAt)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <Text style={styles.closeX}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                    {/* Situation */}
                    <Text style={styles.sectionLabel}>Situation</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Cagnotte déjà reçue</Text>
                        <View style={styles.noBadge}>
                          <Text style={styles.noBadgeText}>Non — éligible au départ</Text>
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
                        <Text style={[styles.infoValue, { color: '#E53E3E', fontWeight: '800' }]}>
                          {formatXOF(selected.totalRecover)}
                        </Text>
                      </View>
                    </View>

                    {/* Ventilation du remboursement */}
                    <Text style={styles.sectionLabel}>Qui lui rembourse quoi (main à main)</Text>
                    <View style={styles.breakdownCard}>
                      {selected.reimbursements.length === 0 ? (
                        <Text style={styles.breakdownEmpty}>Aucun tour passé à rembourser.</Text>
                      ) : (
                        selected.reimbursements.map((r) => (
                          <View key={r.turnNumber} style={styles.breakdownRow}>
                            <View style={styles.turnPill}>
                              <Text style={styles.turnPillText}>Tour {r.turnNumber}</Text>
                            </View>
                            <Text style={styles.breakdownName} numberOfLines={1}>{r.beneficiaryName}</Text>
                            <Text style={styles.breakdownAmount}>{formatXOF(r.amount)}</Text>
                          </View>
                        ))
                      )}
                      <Text style={styles.breakdownNote}>
                        Le paiement se fait directement avec chaque bénéficiaire, sans passer par l'application.
                      </Text>
                    </View>

                    {/* Recalcul des cagnottes */}
                    <Text style={styles.sectionLabel}>Conséquence de l'approbation</Text>
                    <View style={styles.recalcCard}>
                      <View style={styles.recalcHeader}>
                        <Calculator size={18} color="#0369A1" />
                        <Text style={styles.recalcTitle}>Aucun remplaçant — cagnottes recalculées</Text>
                      </View>
                      <Text style={styles.recalcText}>
                        Le cercle continue normalement sans nouveau membre. Les cotisations restantes sont
                        réajustées pour que le pot reste entier.
                      </Text>
                    </View>

                    {selected.status === DepartureRequestStatus.APPROVED && selected.recalculatedContribution !== undefined && (
                      <View style={styles.approvedBox}>
                        <CheckCircle2 size={16} color="#0B6E4F" />
                        <Text style={styles.approvedText}>
                          Départ approuvé — nouvelle cotisation : {formatXOF(selected.recalculatedContribution)} par membre restant.
                        </Text>
                      </View>
                    )}

                    {selected.status === DepartureRequestStatus.REJECTED && (
                      <View style={styles.rejectedBox}>
                        <XCircle size={16} color="#E53E3E" />
                        <Text style={styles.rejectedText}>
                          Départ refusé — {selected.rejectionReason ?? 'le membre reste dans le cercle.'}
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* Actions */}
                  {selected.status === DepartureRequestStatus.PENDING ? (
                    <>
                      <TouchableOpacity
                        style={[styles.approveBtn, actionLoading && styles.btnDisabled]}
                        activeOpacity={0.88}
                        onPress={() => handleApprove(selected)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader size={18} color="#FFFFFF" />
                        ) : (
                          <CheckCircle2 size={18} color="#FFFFFF" />
                        )}
                        <Text style={styles.approveBtnText}>
                          {actionLoading ? 'Approbation en cours…' : 'Approuver sans remplaçant'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.refuseBtn}
                        activeOpacity={0.8}
                        onPress={() => handleReject(selected)}
                        disabled={actionLoading}
                      >
                        <XCircle size={17} color="#E53E3E" />
                        <Text style={styles.refuseBtnText}>Refuser</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.decidedBanner}>
                      <Check size={18} color="#0B6E4F" />
                      <Text style={styles.decidedBannerText}>
                        {selected.status === DepartureRequestStatus.APPROVED
                          ? 'Départ approuvé — cagnottes recalculées'
                          : 'Départ refusé'}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countPill: {
    backgroundColor: '#D9A441',
  },
  countPillText: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bodySheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#074B36',
    borderColor: '#074B36',
  },
  filterChipText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 14,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 11,
  },
  requestRowLast: {
    borderBottomWidth: 0,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(7, 75, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#074B36',
  },
  rowInfo: {
    flex: 1,
    gap: 1,
  },
  rowName: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  rowMeta: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
  },
  statusBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 10.5,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 34,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#0F172A',
  },
  emptyText: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
  },
  hintText: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    lineHeight: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    width: '100%',
    gap: 12,
    maxHeight: '92%',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(7, 75, 54, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarText: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#074B36',
  },
  detailName: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#0F172A',
  },
  detailSub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeX: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#64748B',
  },
  detailScroll: {
    maxHeight: 380,
  },
  sectionLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 6,
    marginLeft: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
  },
  infoValue: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#0F172A',
    textAlign: 'right',
    flexShrink: 1,
  },
  noBadge: {
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9,
  },
  noBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#0B6E4F',
  },
  breakdownCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 18,
    padding: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  turnPill: {
    backgroundColor: 'rgba(7, 75, 54, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  turnPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#074B36',
    fontFamily: 'WorkSans',
  },
  breakdownName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: 'WorkSans',
  },
  breakdownAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E53E3E',
    fontFamily: 'WorkSans',
  },
  breakdownNote: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: 'WorkSans',
    marginTop: 10,
    lineHeight: 16,
  },
  breakdownEmpty: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'WorkSans',
  },
  recalcCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 18,
    padding: 14,
  },
  recalcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  recalcTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0369A1',
    fontFamily: 'Sora',
  },
  recalcText: {
    fontSize: 12.5,
    color: '#0C4A6E',
    fontFamily: 'WorkSans',
    lineHeight: 18,
  },
  approvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  approvedText: {
    flex: 1,
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#0B6E4F',
  },
  rejectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229, 62, 62, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  rejectedText: {
    flex: 1,
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#E53E3E',
  },
  approveBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B6E4F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#0B6E4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  approveBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  refuseBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  refuseBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#E53E3E',
  },
  decidedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  decidedBannerText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0B6E4F',
  },
});
