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
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Check,
  Clock,
  ChevronRight,
  X,
  BadgeCheck,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Button, Chip, IconButton, Sheet, TextField } from '../../../components/ui';
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
      return { label: 'En attente', color: colors.accent.dark, bg: colors.accent.tint };
    case MembershipRequestStatus.APPROVED:
      return { label: 'Approuvée', color: colors.primary.DEFAULT, bg: colors.primary.tint };
    case MembershipRequestStatus.REJECTED:
      return { label: 'Refusée', color: colors.danger.DEFAULT, bg: colors.danger.tint };
    default:
      return { label: 'Intégré', color: colors.primary.DEFAULT, bg: colors.primary.tint };
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* En-tête */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>Demandes d'adhésion</Text>
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
                  <UserCheck size={26} color={colors.primary.DEFAULT} />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'pending' ? 'Aucune demande en attente' : 'Aucune demande'}
                </Text>
                <Text style={styles.emptyText}>
                  Les nouvelles demandes d'adhésion apparaîtront ici pour approbation.
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
                      accessibilityLabel={`Demande de ${r.fullName}`}
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
                          Frais {formatXOF(r.joiningFee)} · Dépôt {formatXOF(r.depositAmount)}
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
              Touchez une demande pour vérifier l'identité (CNIB) puis approuver ou refuser.
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* FEUILLE DÉTAIL D'UNE DEMANDE */}
      <Sheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            {/* En-tête candidat */}
            <View style={styles.detailHeader}>
              {selected.user?.avatarUrl ? (
                <Image source={{ uri: selected.user.avatarUrl }} style={styles.detailAvatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatarFallback, styles.detailAvatar]}>
                  <Text style={styles.avatarFallbackText}>{initials(selected.fullName)}</Text>
                </View>
              )}
              <View style={styles.flexShrink}>
                <Text style={styles.detailName}>{selected.fullName}</Text>
                <Text style={styles.detailSub}>Demande reçue le {formatDate(selected.createdAt)}</Text>
              </View>
              <IconButton icon={X} variant="plain" accessibilityLabel="Fermer" onPress={() => setSelected(null)} />
            </View>

            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              {/* 1. Identité */}
              <Text style={styles.sectionLabel}>Identité</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Nom complet" value={selected.fullName} />
                <View style={styles.infoDivider} />
                <InfoRow label="Téléphone" value={selected.phoneNumber} />
                <View style={styles.infoDivider} />
                <InfoRow label="Numéro de dépôt (MM)" value={selected.depositNumber} />
              </View>

              {/* 2. Pièce d'identité CNIB */}
              <Text style={styles.sectionLabel}>Pièce d'identité (CNIB)</Text>
              <View style={styles.card}>
                <DocRow icon={FileText} title="Voir le recto" sub="Vérifier la pièce" onPress={() => setCnibFace('front')} />
                <View style={styles.docRowDivider} />
                <DocRow icon={FileText} title="Voir le verso" sub="Vérifier la pièce" onPress={() => setCnibFace('back')} />
                {selected.selfieUrl ? (
                  <>
                    <View style={styles.docRowDivider} />
                    <DocRow icon={UserCheck} title="Voir le selfie" sub="Vérification faciale" onPress={() => setShowSelfie(true)} />
                  </>
                ) : null}
              </View>

              {/* 3. Paiement de l'adhésion */}
              <Text style={styles.sectionLabel}>Paiement de l'adhésion</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Total à payer" value={formatXOF(selected.joiningFee + selected.depositAmount)} />
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Statut du paiement</Text>
                  {paymentReceived(selected) ? (
                    <View style={[styles.badge, styles.badgeRow, { backgroundColor: colors.primary.tint }]}>
                      <Check size={13} color={colors.primary.DEFAULT} />
                      <Text style={[styles.badgeText, { color: colors.primary.DEFAULT }]}>Payé</Text>
                    </View>
                  ) : paymentRequired(selected) ? (
                    <View style={[styles.badge, styles.badgeRow, { backgroundColor: colors.accent.tint }]}>
                      <Clock size={13} color={colors.accent.dark} />
                      <Text style={[styles.badgeText, { color: colors.accent.dark }]}>Non payé</Text>
                    </View>
                  ) : (
                    <Text style={styles.noPayValue}>Aucun paiement requis</Text>
                  )}
                </View>
                {selected.paymentReference ? (
                  <>
                    <View style={styles.infoDivider} />
                    <InfoRow label="Référence" value={selected.paymentReference} />
                  </>
                ) : null}
                {selected.paidAt ? (
                  <>
                    <View style={styles.infoDivider} />
                    <InfoRow label="Payé le" value={formatDate(selected.paidAt)} />
                  </>
                ) : null}
              </View>

              {/* 4. Engagements financiers */}
              <Text style={styles.sectionLabel}>Engagements financiers</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Frais de rachat" value={formatXOF(selected.joiningFee)} />
                <View style={styles.infoDivider} />
                <InfoRow label="Dépôt de garantie" value={formatXOF(selected.depositAmount)} />
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Conditions acceptées</Text>
                  {selected.conditionsAccepted ? (
                    <View style={[styles.badge, styles.badgeRow, { backgroundColor: colors.primary.tint }]}>
                      <Check size={13} color={colors.primary.DEFAULT} />
                      <Text style={[styles.badgeText, { color: colors.primary.DEFAULT }]}>Oui</Text>
                    </View>
                  ) : (
                    <Text style={styles.condNo}>Non</Text>
                  )}
                </View>
              </View>

              {selected.status === MembershipRequestStatus.REJECTED && selected.rejectionReason && (
                <View style={[styles.notice, { backgroundColor: colors.danger.tint }]}>
                  <XCircle size={16} color={colors.danger.DEFAULT} />
                  <Text style={[styles.noticeText, { color: colors.danger.dark }]}>
                    Motif du refus : {selected.rejectionReason}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              {selected.status === MembershipRequestStatus.PENDING ? (
                <>
                  {approveBlocked(selected) ? (
                    <View style={[styles.notice, styles.noticeFlat, { backgroundColor: colors.accent.tint }]}>
                      <Clock size={16} color={colors.accent.dark} />
                      <Text style={[styles.noticeText, { color: colors.accent.deep }]}>
                        Paiement non reçu — l'approbation est bloquée tant que le candidat
                        n'a pas réglé {formatXOF(selected.joiningFee + selected.depositAmount)}.
                      </Text>
                    </View>
                  ) : (
                    <Button
                      title="Approuver l'adhésion"
                      icon={BadgeCheck}
                      loading={actionLoading}
                      onPress={() => handleApprove(selected)}
                    />
                  )}
                  <Button
                    title="Refuser"
                    variant="secondary"
                    icon={XCircle}
                    disabled={actionLoading}
                    onPress={() => setShowRefuse(true)}
                  />
                </>
              ) : (
                <View style={[styles.notice, styles.noticeFlat, styles.noticeCenter, { backgroundColor: colors.primary.tint }]}>
                  <CheckCircle2 size={18} color={colors.primary.DEFAULT} />
                  <Text style={[styles.decidedText]}>
                    {selected.status === MembershipRequestStatus.APPROVED
                      ? 'Adhésion approuvée'
                      : 'Adhésion refusée'}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* VISIONNEUSE CNIB PLEIN ÉCRAN (imbriquée pour s'afficher au-dessus de la feuille) */}
        <Modal visible={!!cnibFace} animationType="fade" transparent onRequestClose={() => setCnibFace(null)}>
          <View style={styles.viewerOverlay}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerHeaderText}>
                CNIB — {cnibFace === 'front' ? 'Recto' : 'Verso'}
              </Text>
              <IconButton icon={X} color="#FFFFFF" style={styles.viewerClose} accessibilityLabel="Fermer" onPress={() => setCnibFace(null)} />
            </View>
            <View style={styles.docFrame}>
              <View style={styles.docCard}>
                <View style={styles.docTopRow}>
                  <ShieldCheck size={24} color={colors.primary.dark} />
                  <Text style={styles.docTitle}>RÉPUBLIQUE DE BURKINA FASO</Text>
                </View>
                <View style={styles.docPhotoRow}>
                  <View style={styles.docPhoto}>
                    <Text style={styles.docPhotoText}>{initials(selected?.fullName ?? '')}</Text>
                  </View>
                  <View style={styles.flexShrink}>
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
        <Modal visible={showSelfie} animationType="fade" transparent onRequestClose={() => setShowSelfie(false)}>
          <View style={styles.viewerOverlay}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerHeaderText}>Selfie du candidat</Text>
              <IconButton icon={X} color="#FFFFFF" style={styles.viewerClose} accessibilityLabel="Fermer" onPress={() => setShowSelfie(false)} />
            </View>
            <View style={styles.docFrame}>
              <View style={styles.selfieCard}>
                <Image
                  source={{ uri: selected?.user?.avatarUrl }}
                  style={styles.selfieImage}
                  contentFit="cover"
                />
                <View style={styles.selfieLabel}>
                  <ShieldCheck size={15} color="#FFFFFF" />
                  <Text style={styles.selfieLabelText}>
                    {selected?.fullName ?? 'Candidat'} — {selected?.phoneNumber ?? ''}
                  </Text>
                </View>
              </View>
              <Text style={styles.docHint}>Aperçu du selfie simulé pour la démo</Text>
            </View>
          </View>
        </Modal>

        {/* FEUILLE MOTIF DE REFUS */}
        <Sheet visible={showRefuse} onClose={() => setShowRefuse(false)} title="Refuser l'adhésion">
          <Text style={styles.sheetText}>
            Indiquez le motif du refus pour {selected?.fullName} (optionnel).
          </Text>
          <TextField
            label="Motif du refus"
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="Ex : pièce d'identité illisible"
            multiline
          />
          <View style={styles.actions}>
            <Button
              title="Confirmer le refus"
              variant="danger"
              icon={XCircle}
              loading={actionLoading}
              onPress={() => selected && handleRefuse(selected)}
            />
            <Button title="Annuler" variant="ghost" onPress={() => setShowRefuse(false)} />
          </View>
        </Sheet>
      </Sheet>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DocRow({
  icon: Icon,
  title,
  sub,
  onPress,
}: {
  icon: typeof FileText;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.docRow} activeOpacity={0.6} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <View style={styles.docIcon}>
        <Icon size={19} color={colors.primary.DEFAULT} />
      </View>
      <View style={styles.flexShrink}>
        <Text style={styles.docRowTitle}>{title}</Text>
        <Text style={styles.docRowSub}>{sub}</Text>
      </View>
      <ChevronRight size={18} color={colors.subtle} />
    </TouchableOpacity>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.primary.dark,
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
  rowPhone: {
    ...typography.footnote,
    color: colors.muted,
  },
  rowMeta: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.subtle,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  detailAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  noPayValue: {
    ...typography.callout,
    color: colors.muted,
  },
  condNo: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.danger.DEFAULT,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  docRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginLeft: 64,
  },
  docIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docRowTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.ink,
  },
  docRowSub: {
    ...typography.footnote,
    color: colors.muted,
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
  },
  actions: {
    gap: 10,
    marginTop: 16,
  },
  sheetText: {
    ...typography.callout,
    color: colors.muted,
    marginBottom: 16,
  },

  /* ── Visionneuses plein écran ── */
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 24, 29, 0.96)',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  viewerHeaderText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  viewerClose: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  docFrame: {
    flex: 1,
    justifyContent: 'center',
  },
  docCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 20,
    aspectRatio: 1.6,
    justifyContent: 'center',
    gap: 14,
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary.dark,
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
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docPhotoText: {
    ...typography.title,
    color: colors.subtle,
  },
  docName: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  docMeta: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.inkSoft,
    marginTop: 3,
  },
  docDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  docFoot: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },
  docHint: {
    ...typography.caption,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
  },
  selfieCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '86%',
    aspectRatio: 0.85,
  },
  selfieImage: {
    flex: 1,
  },
  selfieLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.primary.dark,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  selfieLabelText: {
    ...typography.footnote,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },
});
