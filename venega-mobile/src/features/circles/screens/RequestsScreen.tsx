import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  UserCheck,
  Phone,
  Wallet,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Check,
  Clock,
  ChevronRight,
  Eye,
  X,
  Loader,
  BadgeCheck,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  getCircle,
  getCircles,
  getMembershipRequests,
  updateMembershipRequest,
} from '../circleStore';
import { MembershipRequestStatus, AdhesionPaymentStatus } from '@venega/types';
import type { MembershipRequest } from '@venega/types';

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

const statusInfo = (s: MembershipRequestStatus) => {
  switch (s) {
    case MembershipRequestStatus.PENDING:
      return { label: 'En attente', color: '#B9852A', bg: 'rgba(217, 164, 65, 0.14)' };
    case MembershipRequestStatus.APPROVED:
      return { label: 'Approuvée', color: '#0B6E4F', bg: 'rgba(11, 110, 79, 0.1)' };
    case MembershipRequestStatus.REJECTED:
      return { label: 'Refusée', color: '#E53E3E', bg: 'rgba(229, 62, 62, 0.1)' };
    default:
      return { label: 'Intégré', color: '#0B6E4F', bg: 'rgba(11, 110, 79, 0.1)' };
  }
};

export default function RequestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;

  const [requests, setRequests] = useState<MembershipRequest[]>(() =>
    getMembershipRequests(circle.id)
  );
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selected, setSelected] = useState<MembershipRequest | null>(null);
  const [cnibFace, setCnibFace] = useState<'front' | 'back' | null>(null);
  const [showSelfie, setShowSelfie] = useState(false);
  const [showRefuse, setShowRefuse] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === MembershipRequestStatus.PENDING);
  const visibleRequests = filter === 'pending' ? pendingRequests : requests;
  const pendingCount = pendingRequests.length;

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  };

  /** Un paiement est requis quand le candidat doit verser une somme (rachat + dépôt). */
  const paymentRequired = (r: MembershipRequest) => r.joiningFee + r.depositAmount > 0;
  /** Le paiement est reçu si le statut est explicitement PAYÉ. */
  const paymentReceived = (r: MembershipRequest) => r.paymentStatus === AdhesionPaymentStatus.PAID;
  /** L'approbation est bloquée tant que le paiement requis n'est pas reçu. */
  const approveBlocked = (r: MembershipRequest) => paymentRequired(r) && !paymentReceived(r);

  const handleApprove = (r: MembershipRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      const patch = { status: MembershipRequestStatus.APPROVED, decidedAt: new Date().toISOString() };
      updateMembershipRequest(r.id, patch);
      setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
      setActionLoading(false);
      setSelected(null);
    }, 1200);
  };

  const handleRefuse = (r: MembershipRequest) => {
    setActionLoading(true);
    setTimeout(() => {
      const patch = {
        status: MembershipRequestStatus.REJECTED,
        decidedAt: new Date().toISOString(),
        rejectionReason: rejectReason.trim() || undefined,
      };
      updateMembershipRequest(r.id, patch);
      setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
      setActionLoading(false);
      setShowRefuse(false);
      setRejectReason('');
      setSelected(null);
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
            <Text style={styles.headerTitle} numberOfLines={1}>Demandes d'adhésion</Text>
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
                  <UserCheck size={34} color="#10B981" />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'pending' ? 'Aucune demande en attente' : 'Aucune demande'}
                </Text>
                <Text style={styles.emptyText}>
                  Les nouvelles demandes d'adhésion apparaîtront ici pour approbation.
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
                      {r.user?.avatarUrl ? (
                        <Image source={{ uri: r.user.avatarUrl }} style={styles.avatar} contentFit="cover" />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarFallbackText}>{initials(r.fullName)}</Text>
                        </View>
                      )}
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName} numberOfLines={1}>{r.fullName}</Text>
                        <Text style={styles.rowPhone}>{r.phoneNumber}</Text>
                        <Text style={styles.rowMeta}>
                          Frais {formatXOF(r.joiningFee)} • Dépôt {formatXOF(r.depositAmount)}
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
              Cliquez sur une demande pour vérifier l'identité (CNIB) puis approuver ou refuser.
            </Text>
          </ScrollView>
        </View>

        {/* MODALE DÉTAIL D'UNE DEMANDE */}
        <Modal visible={!!selected} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              {selected && (
                <>
                  {/* En-tête candidat */}
                  <View style={styles.detailHeader}>
                    {selected.user?.avatarUrl ? (
                      <Image source={{ uri: selected.user.avatarUrl }} style={styles.detailAvatar} contentFit="cover" />
                    ) : (
                      <View style={styles.detailAvatarFallback}>
                        <Text style={styles.detailAvatarFallbackText}>{initials(selected.fullName)}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailName}>{selected.fullName}</Text>
                      <Text style={styles.detailSub}>Demande reçue le {formatDate(selected.createdAt)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <X size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                    {/* 1. Identité */}
                    <Text style={styles.sectionLabel}>Identité</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nom complet</Text>
                        <Text style={styles.infoValue}>{selected.fullName}</Text>
                      </View>
                      <View style={styles.infoDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Téléphone</Text>
                        <Text style={styles.infoValue}>{selected.phoneNumber}</Text>
                      </View>
                      <View style={styles.infoDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Numéro de dépôt (MM)</Text>
                        <Text style={styles.infoValue}>{selected.depositNumber}</Text>
                      </View>
                    </View>

                    {/* 2. Pièce d'identité CNIB */}
                    <Text style={styles.sectionLabel}>Pièce d'identité (CNIB)</Text>
                    <View style={styles.cnibRow}>
                      <TouchableOpacity style={styles.cnibBtn} activeOpacity={0.8} onPress={() => setCnibFace('front')}>
                        <View style={styles.cnibIconWrap}>
                          <FileText size={20} color="#074B36" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cnibBtnTitle}>Voir le recto</Text>
                          <Text style={styles.cnibBtnSub}>Vérifier la pièce</Text>
                        </View>
                        <Eye size={17} color="#074B36" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cnibBtn} activeOpacity={0.8} onPress={() => setCnibFace('back')}>
                        <View style={styles.cnibIconWrap}>
                          <FileText size={20} color="#074B36" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cnibBtnTitle}>Voir le verso</Text>
                          <Text style={styles.cnibBtnSub}>Vérifier la pièce</Text>
                        </View>
                        <Eye size={17} color="#074B36" />
                      </TouchableOpacity>
                      {selected.selfieUrl ? (
                        <TouchableOpacity style={styles.cnibBtn} activeOpacity={0.8} onPress={() => setShowSelfie(true)}>
                          <View style={styles.cnibIconWrap}>
                            <UserCheck size={20} color="#074B36" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.cnibBtnTitle}>Voir le selfie</Text>
                            <Text style={styles.cnibBtnSub}>Vérification faciale</Text>
                          </View>
                          <Eye size={17} color="#074B36" />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {/* 3. Paiement de l'adhésion */}
                    <Text style={styles.sectionLabel}>Paiement de l'adhésion</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total à payer</Text>
                        <Text style={styles.infoValue}>{formatXOF(selected.joiningFee + selected.depositAmount)}</Text>
                      </View>
                      <View style={styles.infoDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Statut du paiement</Text>
                        {paymentReceived(selected) ? (
                          <View style={styles.paidBadge}>
                            <Check size={13} color="#0B6E4F" />
                            <Text style={styles.paidBadgeText}>Payé</Text>
                          </View>
                        ) : paymentRequired(selected) ? (
                          <View style={styles.unpaidBadge}>
                            <Clock size={13} color="#B9852A" />
                            <Text style={styles.unpaidBadgeText}>Non payé</Text>
                          </View>
                        ) : (
                          <Text style={styles.noPayValue}>Aucun paiement requis</Text>
                        )}
                      </View>
                      {selected.paymentReference ? (
                        <>
                          <View style={styles.infoDivider} />
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Référence</Text>
                            <Text style={styles.infoValue}>{selected.paymentReference}</Text>
                          </View>
                        </>
                      ) : null}
                      {selected.paidAt ? (
                        <>
                          <View style={styles.infoDivider} />
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Payé le</Text>
                            <Text style={styles.infoValue}>{formatDate(selected.paidAt)}</Text>
                          </View>
                        </>
                      ) : null}
                    </View>

                    {/* 4. Engagements financiers */}
                    <Text style={styles.sectionLabel}>Engagements financiers</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Frais de rachat</Text>
                        <Text style={styles.infoValue}>{formatXOF(selected.joiningFee)}</Text>
                      </View>
                      <View style={styles.infoDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Dépôt de garantie</Text>
                        <Text style={styles.infoValue}>{formatXOF(selected.depositAmount)}</Text>
                      </View>
                      <View style={styles.infoDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Conditions acceptées</Text>
                        {selected.conditionsAccepted ? (
                          <View style={styles.condOk}>
                            <Check size={13} color="#0B6E4F" />
                            <Text style={styles.condOkText}>Oui</Text>
                          </View>
                        ) : (
                          <Text style={styles.condNo}>Non</Text>
                        )}
                      </View>
                    </View>

                    {selected.status === MembershipRequestStatus.REJECTED && selected.rejectionReason && (
                      <View style={styles.reasonBox}>
                        <XCircle size={16} color="#E53E3E" />
                        <Text style={styles.reasonText}>
                          Motif du refus : {selected.rejectionReason}
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* Actions */}
                  {selected.status === MembershipRequestStatus.PENDING ? (
                    <>
                      {approveBlocked(selected) ? (
                        <View style={styles.blockedBanner}>
                          <Clock size={17} color="#B9852A" />
                          <Text style={styles.blockedBannerText}>
                            Paiement non reçu — l'approbation est bloquée tant que le candidat
                            n'a pas réglé {formatXOF(selected.joiningFee + selected.depositAmount)}.
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.approveBtn, actionLoading && styles.btnDisabled]}
                          activeOpacity={0.88}
                          onPress={() => handleApprove(selected)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader size={18} color="#FFFFFF" />
                          ) : (
                            <BadgeCheck size={18} color="#FFFFFF" />
                          )}
                          <Text style={styles.approveBtnText}>
                            {actionLoading ? 'Approbation en cours…' : 'Approuver l\'adhésion'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.refuseBtn}
                        activeOpacity={0.8}
                        onPress={() => setShowRefuse(true)}
                        disabled={actionLoading}
                      >
                        <XCircle size={17} color="#E53E3E" />
                        <Text style={styles.refuseBtnText}>Refuser</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.decidedBanner}>
                      <CheckCircle2 size={18} color="#0B6E4F" />
                      <Text style={styles.decidedBannerText}>
                        {selected.status === MembershipRequestStatus.APPROVED
                          ? 'Adhésion approuvée'
                          : 'Adhésion refusée'}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </Animated.View>
          </View>
        </Modal>

        {/* VISIONNEUSE CNIB PLEIN ÉCRAN */}
        <Modal visible={!!cnibFace} animationType="fade" transparent={true}>
          <View style={styles.viewerOverlay}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerHeaderText}>
                CNIB — {cnibFace === 'front' ? 'Recto' : 'Verso'}
              </Text>
              <TouchableOpacity style={styles.viewerClose} onPress={() => setCnibFace(null)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.docFrame}>
              <View style={styles.docCard}>
                <View style={styles.docTopRow}>
                  <ShieldCheck size={26} color="#074B36" />
                  <Text style={styles.docTitle}>RÉPUBLIQUE DE BURKINA FASO</Text>
                </View>
                <View style={styles.docPhotoRow}>
                  <View style={styles.docPhoto}>
                    <Text style={styles.docPhotoText}>{initials(selected?.fullName ?? '')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>{selected?.fullName ?? '—'}</Text>
                    <Text style={styles.docMeta}>N° BFA-CNIB-00945271</Text>
                    <Text style={styles.docMeta}>Né(e) le 12/04/1990</Text>
                  </View>
                </View>
                <View style={styles.docDivider} />
                <Text style={styles.docFoot}>
                  {cnibFace === 'front'
                    ? 'Recto — Photo, identité et numéro'
                    : 'Verso — Adresse et détails biométriques'}
                </Text>
              </View>
              <Text style={styles.docHint}>Aperçu du document simulé pour la démo</Text>
            </View>
          </View>
        </Modal>

        {/* VISIONNEUSE SELFIE PLEIN ÉCRAN */}
        <Modal visible={showSelfie} animationType="fade" transparent={true}>
          <View style={styles.viewerOverlay}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerHeaderText}>Selfie du candidat</Text>
              <TouchableOpacity style={styles.viewerClose} onPress={() => setShowSelfie(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.docFrame}>
              <View style={styles.selfieCard}>
                <Image
                  source={{ uri: selected?.user?.avatarUrl }}
                  style={styles.selfieImage}
                  contentFit="cover"
                />
                <View style={styles.selfieLabel}>
                  <ShieldCheck size={15} color="#074B36" />
                  <Text style={styles.selfieLabelText}>
                    {selected?.fullName ?? 'Candidat'} — {selected?.phoneNumber ?? ''}
                  </Text>
                </View>
              </View>
              <Text style={styles.docHint}>Aperçu du selfie simulé pour la démo</Text>
            </View>
          </View>
        </Modal>

        {/* MODALE MOTIF DE REFUS */}
        <Modal visible={showRefuse} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Refuser l'adhésion</Text>
                <TouchableOpacity onPress={() => setShowRefuse(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>
                Indiquez le motif du refus pour {selected?.fullName} (optionnel).
              </Text>
              <TextInput
                style={styles.reasonInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Ex : pièce d'identité illisible"
                placeholderTextColor="#94A3B8"
                multiline
              />
              <TouchableOpacity
                style={styles.refuseConfirmBtn}
                activeOpacity={0.88}
                onPress={() => selected && handleRefuse(selected)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader size={18} color="#FFFFFF" />
                ) : (
                  <XCircle size={18} color="#FFFFFF" />
                )}
                <Text style={styles.refuseConfirmBtnText}>
                  {actionLoading ? 'Refus en cours…' : 'Confirmer le refus'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => setShowRefuse(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  rowPhone: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
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
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#074B36',
  },
  modalSub: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
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
  },
  detailAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(7, 75, 54, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarFallbackText: {
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
  detailScroll: {
    maxHeight: 340,
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
  cnibRow: {
    gap: 8,
  },
  cnibBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  cnibIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cnibBtnTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  cnibBtnSub: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  condOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9,
  },
  condOkText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#0B6E4F',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9,
  },
  paidBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#0B6E4F',
  },
  unpaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217, 164, 65, 0.14)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9,
  },
  unpaidBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#B9852A',
  },
  noPayValue: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#64748B',
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(217, 164, 65, 0.14)',
    borderRadius: 14,
    padding: 13,
    marginTop: 10,
  },
  blockedBannerText: {
    flex: 1,
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    lineHeight: 17,
    color: '#92400E',
  },
  selfieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '86%',
    aspectRatio: 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  selfieImage: {
    flex: 1,
  },
  selfieLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#074B36',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  selfieLabelText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  condNo: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#E53E3E',
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229, 62, 62, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  reasonText: {
    flex: 1,
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#B91C1C',
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
    color: '#065F46',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.96)',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  viewerHeaderText: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  viewerClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docFrame: {
    flex: 1,
    justifyContent: 'center',
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    aspectRatio: 1.6,
    justifyContent: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docTitle: {
    fontFamily: 'SoraBold',
    fontSize: 12,
    color: '#074B36',
    letterSpacing: 0.5,
  },
  docPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  docPhoto: {
    width: 72,
    height: 88,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docPhotoText: {
    fontFamily: 'SoraBold',
    fontSize: 22,
    color: '#94A3B8',
  },
  docName: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
  },
  docMeta: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  docDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  docFoot: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  docHint: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
  },
  reasonInput: {
    minHeight: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  refuseConfirmBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  refuseConfirmBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  cancelBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#64748B',
  },
});
