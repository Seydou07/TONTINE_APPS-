import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Linking,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  UserPlus,
  Wallet,
  BadgeCheck,
  Clock,
  CheckCircle2,
  Crown,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageCircle,
  Send,
  Share2,
  ArrowUpRight,
  Coins,
  ArrowDownLeft,
  Settings2,
} from 'lucide-react-native';
import { colors, radius, typography, shadows } from '@venega/design-tokens';
import { Avatar, Button, IconButton, Sheet, ListRow, ListGroup, Chip } from '../../../components/ui';
import {
  getCircle,
  getCircles,
  getActiveCycle,
  getCycles,
  getFounderCircleIds,
} from '../circleStore';
import RotationWheel from '../components/RotationWheel';
import { mockMemberships, mockUsers, mockCurrentUser, mockTransactions } from '@venega/types';
import { Role, PaymentStatus, TransactionType, PaymentMethod, CircleType } from '@venega/types';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

export default function CircleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; action?: string }>();
  const circleId = params.id;
  const action = params.action;

  const circle = getCircle(circleId) ?? getCircles()[0];

  if (!circle) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.notFoundText}>Cercle introuvable</Text>
      </View>
    );
  }

  if (circle.type === CircleType.SOLIDARITY_ONLY) {
    return <Redirect href={`/circle/${circle.id}/solidarity` as any} />;
  }

  if (circle.type === CircleType.TONTINE_ONLY) {
    return <Redirect href={`/circle/${circle.id}/tontine` as any} />;
  }

  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circle.id);

  const [membersList, setMembersList] = useState(
    memberships.length > 0
      ? memberships
      : mockUsers.slice(0, Math.min(circle.memberCount, 8)).map((u, idx) => ({
          userId: u.id,
          circleId: circle.id,
          role: idx === 0 ? Role.PRESIDENT : Role.MEMBER,
          turnOrder: idx + 1,
          paymentStatus: idx === 0 || idx === 1 ? PaymentStatus.PAID : PaymentStatus.PENDING,
          joinedAt: '',
          user: u,
          reliabilityScore: 88,
          hasReceivedPayout: idx < 2,
          hasDeposit: true,
        }))
  );

  // L'utilisateur connecté est le fondateur des cercles de sa liste
  const isFounder = getFounderCircleIds().includes(circle.id);

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<number>(cycle?.currentTurn ?? 1);

  // Modales
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const orderedMembers = [...membersList].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  const displayedMembers = showAllMembers ? orderedMembers : orderedMembers.slice(0, 3);
  const inviteCode = circle.inviteCode || 'VENE2026';
  const inviteLink = `https://venega.app/join/${inviteCode}`;

  const paidCount = orderedMembers.filter((m) => m.paymentStatus === PaymentStatus.PAID).length;

  // Modèle financier exact :
  // Cotisation tontine de base (ex: 10 000 F) + Frais de gestion fondateur (ex: 500 F)
  const baseTontineAmount = circle.tontineAmount || 10000;
  const founderManagementFeePerTurn = circle.managementFee || 500;
  const totalAmountPerMember = baseTontineAmount + founderManagementFeePerTurn;

  // Total collecté pour le tour (ex: 6 x 10 500 = 63 000 F)
  const totalGrossCollected = totalAmountPerMember * membersList.length;
  // 1. Cagnotte bénéficiaire (ex: 6 x 10 000 = 60 000 F)
  const beneficiaryPotAmount = baseTontineAmount * membersList.length;
  // 2. Frais totaux récoltés (ex: 6 x 500 = 3 000 F)
  const totalFounderFeesCollected = founderManagementFeePerTurn * membersList.length;
  // 3. Commission Venega (10% sur les frais du fondateur = 300 F)
  const venegaCommission = Math.round(totalFounderFeesCollected * 0.10);
  // 4. Frais net du Fondateur (90% des frais = 2 700 F)
  const netFounderFees = totalFounderFeesCollected - venegaCommission;

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins notre cercle "${circle.name}" sur Venega ! Code: ${inviteCode} \nLien: ${inviteLink}`);
    Linking.openURL(`whatsapp://send?text=${text}`).catch(() => {
      Alert.alert('Partage', `Lien d'invitation : ${inviteLink}`);
    });
  };

  const handleShareSMS = () => {
    const text = encodeURIComponent(`Rejoins mon cercle Venega "${circle.name}" avec le code ${inviteCode} : ${inviteLink}`);
    Linking.openURL(`sms:?body=${text}`).catch(() => {
      Alert.alert('Partage', `Code : ${inviteCode}`);
    });
  };

  const handleShareNative = async () => {
    try {
      await Share.share({
        message: `Rejoins mon cercle Venega "${circle.name}" !\nCode : ${inviteCode}\nLien : ${inviteLink}`,
      });
    } catch (e) {}
  };

  // Historique personnel de l'utilisateur connecté dans ce cercle
  const myTxns = mockTransactions
    .filter((t) => t.circleId === circle.id && t.userId === mockCurrentUser.id && !!t.paymentMethod)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myPaid = myTxns.filter((t) => t.type === TransactionType.TONTINE_CONTRIBUTION || t.type === TransactionType.SOLIDARITY_CONTRIBUTION);
  const myReceived = myTxns.filter((t) => t.type === TransactionType.PAYOUT);
  const totalPaid = myPaid.reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalReceived = myReceived.reduce((s, t) => s + (t.amount ?? 0), 0);

  const paymentMethodLabel = (m?: PaymentMethod) =>
    m === PaymentMethod.ORANGE_MONEY ? 'Orange Money'
    : m === PaymentMethod.MOOV_MONEY ? 'Moov Money'
    : m === PaymentMethod.WAVE ? 'Wave'
    : m === PaymentMethod.MTN_MOBILE_MONEY ? 'MTN MoMo'
    : 'Mobile Money';

  // Détails par tour
  const getMemberTurnDetails = (userId: string, memberIndex: number) => {
    const isCurrentTurn = selectedTurn === (cycle?.currentTurn ?? 1);
    if (isCurrentTurn) {
      const isPaid = membersList.find((m) => m.userId === userId)?.paymentStatus === PaymentStatus.PAID;
      return {
        isPaid,
        date: isPaid ? '11/08/2026' : '—',
        time: isPaid ? '10:15' : '—',
        ref: isPaid ? `PAY-${884900 + memberIndex * 13}` : '—',
        operator: memberIndex % 2 === 0 ? 'Orange Money' : 'Moov Africa',
      };
    } else {
      return {
        isPaid: true,
        date: selectedTurn === 1 ? '01/06/2026' : '01/07/2026',
        time: `09:${15 + memberIndex * 10}`,
        ref: `PAY-${774200 + selectedTurn * 100 + memberIndex}`,
        operator: memberIndex % 2 === 0 ? 'Orange Money' : 'Moov Africa',
      };
    }
  };

  const typeLabel =
    (circle.type as string) === 'NATURE' ? 'Nature' : (circle.type as string) === 'TONTINE_ONLY' ? 'Tontine' : 'Solidarité';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* En-tête */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {circle.name}
          </Text>
          <IconButton
            icon={UserPlus}
            variant="plain"
            accessibilityLabel="Inviter des membres"
            onPress={() => setShowInviteModal(true)}
          />
        </View>

        <View style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Nom complet et badges */}
            <View style={styles.intro}>
              <Text style={styles.circleName}>{circle.name}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{typeLabel}</Text>
                </View>
                {isFounder && (
                  <View style={styles.founderBadge}>
                    <Crown size={12} color={colors.accent.deep} />
                    <Text style={styles.founderBadgeText}>Fondateur</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 1. Roue du tour actuel */}
            <RotationWheel
              members={orderedMembers.map((m) => ({
                userId: m.userId,
                name: `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`,
                avatarUrl: m.user?.avatarUrl,
                hasReceived: m.hasReceivedPayout,
              }))}
              beneficiaryUserId={beneficiary?.userId}
              centerName={beneficiary?.user?.firstName ?? '—'}
              centerCaption={`Tour ${cycle?.currentTurn ?? 1} / ${membersList.length}`}
            />

            {/* 2. Actions */}
            <View style={styles.actions}>
              {isFounder && (
                <ListGroup>
                  <ListRow
                    icon={Settings2}
                    tone="primary"
                    title="Gérer le cercle"
                    subtitle="Versements, membres, adhésions, règles"
                    onPress={() => router.push(`/circle/${circle.id}/manage` as any)}
                    last
                  />
                </ListGroup>
              )}
              <Button
                title={`Cotiser (${formatXOF(totalAmountPerMember)})`}
                icon={Wallet}
                onPress={() => router.push(`/payment?circleId=${circle.id}&amount=${totalAmountPerMember}` as any)}
              />
              {circle.solidarityAmount > 0 && (
                <Button
                  title="Caisse de solidarité"
                  icon={Coins}
                  variant="secondary"
                  onPress={() => router.push(`/circle/${circle.id}/solidarity` as any)}
                />
              )}
            </View>

            {/* 3. Historique des cotisations par tour */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historique des cotisations</Text>
              <View style={styles.chipsRow}>
                {[1, 2, 3].map((t) => (
                  <Chip key={t} label={`Tour ${t}`} selected={selectedTurn === t} onPress={() => setSelectedTurn(t)} />
                ))}
              </View>

              <View style={styles.listCard}>
                {displayedMembers.map((m, idx) => {
                  const details = getMemberTurnDetails(m.userId, idx);
                  const isFounderRole = m.role === Role.PRESIDENT;
                  const memberName = `${m.user?.firstName} ${m.user?.lastName}`;
                  const isLast = idx === displayedMembers.length - 1 && orderedMembers.length <= 3;

                  return (
                    <View key={m.userId} style={[styles.row, !isLast && styles.rowBorder]}>
                      <Avatar name={memberName} uri={m.user?.avatarUrl} size={40} />
                      <View style={styles.rowBody}>
                        <View style={styles.nameLine}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {memberName}
                          </Text>
                          {m.user?.kycStatus === 'VERIFIED' && (
                            <BadgeCheck size={14} color={colors.primary.DEFAULT} />
                          )}
                        </View>
                        <Text style={styles.rowSubtitle}>
                          {isFounderRole ? 'Fondateur' : `Passage : tour ${m.turnOrder}`} · {details.operator}
                        </Text>
                        {details.isPaid && (
                          <Text style={styles.rowMeta}>
                            Payé le {details.date} à {details.time} ({details.ref})
                          </Text>
                        )}
                      </View>

                      <View style={[styles.statusTag, details.isPaid ? styles.statusTagPaid : styles.statusTagPending]}>
                        {details.isPaid ? (
                          <CheckCircle2 size={12} color={colors.primary.DEFAULT} />
                        ) : (
                          <Clock size={12} color={colors.accent.deep} />
                        )}
                        <Text style={[styles.statusTagText, details.isPaid ? styles.statusTagTextPaid : styles.statusTagTextPending]}>
                          {details.isPaid ? formatXOF(totalAmountPerMember) : 'En attente'}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {orderedMembers.length > 3 && (
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    onPress={() => setShowAllMembers(!showAllMembers)}
                  >
                    <Text style={styles.toggleText}>
                      {showAllMembers ? 'Réduire la liste' : `Voir les ${orderedMembers.length - 3} autres membres`}
                    </Text>
                    {showAllMembers ? (
                      <ChevronUp size={16} color={colors.primary.DEFAULT} />
                    ) : (
                      <ChevronDown size={16} color={colors.primary.DEFAULT} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 4. Mes transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mes transactions</Text>

              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total cotisé</Text>
                  <Text style={styles.summaryValue}>{formatXOF(totalPaid)}</Text>
                  <Text style={styles.summarySub}>{myPaid.length} paiement(s)</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total reçu</Text>
                  <Text style={styles.summaryValue}>{formatXOF(totalReceived)}</Text>
                  <Text style={styles.summarySub}>{myReceived.length} cagnotte(s)</Text>
                </View>
              </View>

              <View style={styles.listCard}>
                {myTxns.length === 0 && (
                  <View style={styles.emptyBox}>
                    <View style={styles.emptyIcon}>
                      <Wallet size={24} color={colors.subtle} strokeWidth={1.8} />
                    </View>
                    <Text style={styles.emptyTitle}>Aucune transaction</Text>
                    <Text style={styles.emptyText}>
                      Aucune transaction pour vous dans ce cercle pour le moment.
                    </Text>
                  </View>
                )}
                {myTxns.map((t, idx) => {
                  const isReceived = t.type === TransactionType.PAYOUT;
                  const label = isReceived
                    ? 'Cagnotte reçue'
                    : t.type === TransactionType.SOLIDARITY_CONTRIBUTION
                    ? 'Cotisation solidarité'
                    : 'Cotisation tontine';
                  const date = new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                  return (
                    <View key={t.id} style={[styles.row, idx !== myTxns.length - 1 && styles.rowBorder]}>
                      <View style={[styles.txnIcon, isReceived ? styles.txnIconReceived : styles.txnIconPaid]}>
                        {isReceived ? (
                          <ArrowDownLeft size={18} color={colors.primary.DEFAULT} />
                        ) : (
                          <ArrowUpRight size={18} color={colors.inkSoft} />
                        )}
                      </View>
                      <View style={styles.rowBody}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {label}
                        </Text>
                        <Text style={styles.rowSubtitle}>
                          {date} · {paymentMethodLabel(t.paymentMethod)}
                        </Text>
                        {t.providerReference && <Text style={styles.rowMetaMuted}>Réf. {t.providerReference}</Text>}
                      </View>
                      <Text style={[styles.txnAmount, isReceived ? styles.txnAmountReceived : styles.txnAmountPaid]}>
                        {isReceived ? '+' : '−'}
                        {formatXOF(t.amount ?? 0)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 5. Partage du code / lien */}
            <Button
              title={`Partager le cercle (${inviteCode})`}
              icon={UserPlus}
              variant="secondary"
              onPress={() => setShowInviteModal(true)}
            />
          </ScrollView>

          {/* Bouton flottant : discussion du cercle */}
          <TouchableOpacity
            style={styles.chatFab}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Discussion du cercle"
            onPress={() => router.push(`/circle/${circle.id}/chat` as any)}
          >
            <MessageCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Feuille d'invitation */}
        <Sheet visible={showInviteModal} onClose={() => setShowInviteModal(false)} title="Inviter des membres">
          <View style={styles.sheetBody}>
            <View style={styles.inviteRow}>
              <View style={styles.flex}>
                <Text style={styles.inviteLabel}>Code du cercle</Text>
                <Text style={styles.inviteCode}>{inviteCode}</Text>
              </View>
              <TouchableOpacity
                style={[styles.copyBtn, copiedCode && styles.copyBtnDone]}
                onPress={handleCopyCode}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Copier le code"
              >
                {copiedCode ? <Check size={18} color="#FFFFFF" /> : <Copy size={18} color={colors.primary.DEFAULT} />}
              </TouchableOpacity>
            </View>

            <View style={styles.inviteRow}>
              <View style={styles.flex}>
                <Text style={styles.inviteLabel}>Lien d'invitation</Text>
                <Text style={styles.inviteLink} numberOfLines={1}>
                  {inviteLink}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.copyBtn, copiedLink && styles.copyBtnDone]}
                onPress={handleCopyLink}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Copier le lien"
              >
                {copiedLink ? <Check size={18} color="#FFFFFF" /> : <Copy size={18} color={colors.primary.DEFAULT} />}
              </TouchableOpacity>
            </View>

            {/* Partage direct : WhatsApp, SMS, partage natif */}
            <View style={styles.shareRow}>
              <ShareAction label="WhatsApp" color="#25D366" icon={<MessageCircle size={22} color="#FFFFFF" />} onPress={handleShareWhatsApp} />
              <ShareAction label="SMS" color={colors.info.DEFAULT} icon={<Send size={20} color="#FFFFFF" />} onPress={handleShareSMS} />
              <ShareAction label="Autre" color={colors.primary.DEFAULT} icon={<Share2 size={20} color="#FFFFFF" />} onPress={handleShareNative} />
            </View>
          </View>
        </Sheet>
      </SafeAreaView>
    </View>
  );
}

function ShareAction({
  label,
  color,
  icon,
  onPress,
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.shareItem}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Partager via ${label}`}
    >
      <View style={[styles.shareCircle, { backgroundColor: color }]}>{icon}</View>
      <Text style={styles.shareLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    ...typography.callout,
    color: colors.muted,
  },

  /* En-tête */
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerTitle: {
    flex: 1,
    ...typography.headline,
    color: colors.ink,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 24,
  },

  /* Intro */
  intro: {
    gap: 8,
  },
  circleName: {
    ...typography.title,
    color: colors.ink,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: colors.primary.tint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  typeBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary.dark,
  },
  founderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.tint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  founderBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.accent.deep,
  },

  /* Carte générique */
  card: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  cardTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
  },

  /* Actions */
  actions: {
    gap: 12,
  },

  /* Sections */
  section: {
    gap: 12,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.ink,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.ink,
    flexShrink: 1,
  },
  rowSubtitle: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 2,
  },
  rowMeta: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.primary.DEFAULT,
    marginTop: 2,
  },
  rowMetaMuted: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.subtle,
    marginTop: 2,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  statusTagPaid: {
    backgroundColor: colors.primary.tint,
  },
  statusTagPending: {
    backgroundColor: colors.accent.tint,
  },
  statusTagText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusTagTextPaid: {
    color: colors.primary.DEFAULT,
  },
  statusTagTextPending: {
    color: colors.accent.deep,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  toggleText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },

  /* Synthèse transactions */
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryLabel: {
    ...typography.footnote,
    color: colors.muted,
  },
  summaryValue: {
    ...typography.bodyStrong,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 4,
  },
  summarySub: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.subtle,
    marginTop: 2,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnIconReceived: {
    backgroundColor: colors.primary.tint,
  },
  txnIconPaid: {
    backgroundColor: colors.fill,
  },
  txnAmount: {
    ...typography.callout,
    fontWeight: '600',
    flexShrink: 0,
  },
  txnAmountReceived: {
    color: colors.primary.DEFAULT,
  },
  txnAmountPaid: {
    color: colors.ink,
  },
  emptyBox: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.ink,
  },
  emptyText: {
    ...typography.callout,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },

  /* Bouton discussion */
  chatFab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },

  /* Feuille d'invitation */
  sheetBody: {
    gap: 12,
    paddingBottom: 4,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  inviteLabel: {
    ...typography.footnote,
    color: colors.muted,
  },
  inviteCode: {
    ...typography.headline,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 1,
    marginTop: 2,
  },
  inviteLink: {
    ...typography.callout,
    fontWeight: '500',
    color: colors.primary.DEFAULT,
    marginTop: 2,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtnDone: {
    backgroundColor: colors.primary.DEFAULT,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginTop: 8,
  },
  shareItem: {
    alignItems: 'center',
    gap: 6,
  },
  shareCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.inkSoft,
  },
});
