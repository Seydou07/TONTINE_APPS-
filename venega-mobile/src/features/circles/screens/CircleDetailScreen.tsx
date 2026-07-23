import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Users, MessageSquare, Shield, Send, Clock, Check, AlertCircle, ChevronDown, ChevronUp, ChevronRight, Calendar, Settings, LogOut, UserMinus, Calculator, Ban, Link, Copy, Flag, ExternalLink } from 'lucide-react-native';
import { colors, spacing, radius } from '@venega/design-tokens';
import { mockCircles, mockMemberships, mockUsers, mockCycles, mockTransactions, mockTurnValidation, mockReliabilityEvents } from '@venega/types';
import { TransactionType } from '@venega/types';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function CircleDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id;
  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];
  if (!circle) return null;
  const cycle = mockCycles.find((c) => c.circleId === circleId && c.isActive);
  const turnValidation = mockTurnValidation;
  const memberships = mockMemberships.filter((m) => m.circleId === circleId);
  const circleEvents = mockReliabilityEvents.filter((e: typeof mockReliabilityEvents[0]) => e.circleId === circleId);
  const [expandedTurn, setExpandedTurn] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(true);
  const [showReliability, setShowReliability] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentMembership = memberships.find((m) => m.user?.id === 'u1');
  const isPresident = currentMembership?.role === 'PRESIDENT';

  const circleTransactions = mockTransactions.filter((t) => t.circleId === circleId);
  const monthlyGroups = circleTransactions.reduce((acc: Record<string, typeof circleTransactions>, t) => {
    const date = new Date(t.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const inviteLink = circle.inviteCode ? `https://venega.app/join/${circle.inviteCode}` : null;

  const copyInviteLink = () => {
    if (inviteLink) {
      Alert.alert('Lien copié', inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{circle.name}</Text>
        </View>

        <View style={styles.hero} />

        <View style={styles.infoSection}>
          <View style={styles.typeRow}>
            <Text style={styles.circleType}>
              {circle.type === 'TONTINE_ONLY' ? 'Tontine' : circle.type === 'SOLIDARITY_ONLY' ? 'Solidarité' : 'Hybride'}
            </Text>
            <Text style={styles.turnInfo}>Tour {cycle?.currentTurn}/{cycle?.totalTurns}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatXOF(circle.tontineAmount)}</Text>
              <Text style={styles.statLabel}>Cotisation</Text>
            </View>
            <View style={[styles.statCard, { marginLeft: spacing[3] }]}>
              <Text style={styles.statValue}>{circle.memberCount}</Text>
              <Text style={styles.statLabel}>Membres</Text>
            </View>
          </View>

          {/* Conditions — ALWAYS VISIBLE FIRST */}
          {circle.conditions ? (
            <View style={styles.conditionsCard}>
              <View style={styles.conditionsHeader}>
                <Shield size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.conditionsTitle}>Conditions du cercle</Text>
              </View>
              <Text style={styles.conditionsText}>{circle.conditions}</Text>
              {circle.managementFee > 0 && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Frais de gestion : </Text>
                  <Text style={styles.feeValue}>{formatXOF(circle.managementFee)}/tour</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Invite Link — President only */}
          {isPresident && inviteLink && (
            <View style={styles.inviteCard}>
              <View style={styles.inviteHeader}>
                <Link size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.inviteTitle}>Lien d'invitation</Text>
              </View>
              <Text style={styles.inviteLink} numberOfLines={1}>{inviteLink}</Text>
              <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnOk]} onPress={copyInviteLink}>
                {copied ? <Check size={14} color="#fff" /> : <Copy size={14} color={colors.primary.DEFAULT} />}
                <Text style={[styles.copyBtnText, copied && { color: '#fff' }]}>{copied ? 'Copié' : 'Copier le lien'}</Text>
              </TouchableOpacity>
              {circle.inviteCode && (
                <Text style={styles.inviteCode}>Code : <Text style={{ fontWeight: '700', fontFamily: 'Sora' }}>{circle.inviteCode}</Text></Text>
              )}
            </View>
          )}

          {/* Turn Validation — President only */}
          {isPresident && turnValidation && (
            <View style={styles.validationCard}>
              <View style={styles.validationHeader}>
                <Shield size={18} color={colors.primary.DEFAULT} />
                <Text style={styles.validationTitle}>Validation du tour {turnValidation.turnNumber}</Text>
              </View>
              <View style={styles.validationStats}>
                <View style={styles.validationStat}>
                  <Text style={styles.validationStatValue}>{turnValidation.totalValidated}/{turnValidation.totalRequired}</Text>
                  <Text style={styles.validationStatLabel}>Cotisations</Text>
                </View>
                <View style={styles.validationStat}>
                  <Text style={[styles.validationStatValue, { color: colors.primary.DEFAULT }]}>{formatXOF(turnValidation.poolAmount)}</Text>
                  <Text style={styles.validationStatLabel}>Pool</Text>
                </View>
                <View style={styles.validationStat}>
                  <Text style={[styles.validationStatValue, { color: colors.success }]}>{formatXOF(turnValidation.beneficiaryAmount)}</Text>
                  <Text style={styles.validationStatLabel}>Bénéficiaire</Text>
                </View>
              </View>

              {circle.nextPaymentRequired && (
                <View style={[styles.statusBanner, turnValidation.nextPaymentDone ? styles.statusBannerOk : styles.statusBannerWarn]}>
                  {turnValidation.nextPaymentDone ? <Check size={14} color={colors.success} /> : <Clock size={14} color="#D97706" />}
                  <Text style={[styles.statusBannerText, turnValidation.nextPaymentDone ? { color: colors.success } : { color: '#D97706' }]}>
                    {turnValidation.nextPaymentDone ? 'Bénéficiaire a payé le tour suivant' : 'Bénéficiaire doit payer le tour suivant'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.virementBtn, !turnValidation.canRelease && styles.virementBtnDisabled]}
                disabled={!turnValidation.canRelease}
              >
                <Send size={18} color="#fff" />
                <Text style={styles.virementBtnText}>Valider le virement</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reliability Scores — President only */}
          {isPresident && (
            <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowReliability(!showReliability)}>
              <View style={styles.sectionToggleLeft}>
                <Flag size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.sectionToggleText}>Scores de fiabilité</Text>
              </View>
              {showReliability ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
            </TouchableOpacity>
          )}
          {isPresident && showReliability && (
            <View style={styles.reliabilityCard}>
              {memberships.map((membership) => {
                const user = mockUsers.find((u) => u.id === membership.userId);
                if (!user) return null;
                const isIrregular = membership.reliabilityScore < 0;
                return (
                  <View key={membership.userId} style={[styles.reliabilityRow, isIrregular && styles.reliabilityRowBad]}>
                    <Image
                      source={{ uri: user.avatarUrl || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=48&h=48&fit=crop&crop=face' }}
                      style={styles.memberAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{user.firstName} {user.lastName}</Text>
                        {isIrregular && <Text style={styles.irregularBadge}>Irrégulier</Text>}
                      </View>
                      <Text style={styles.memberPhone}>{user.phoneNumber}</Text>
                    </View>
                    <View style={[styles.scoreBadge, membership.reliabilityScore >= 80 ? styles.scoreGood : membership.reliabilityScore >= 50 ? styles.scoreMid : styles.scoreBad]}>
                      <Text style={[styles.scoreBadgeText, membership.reliabilityScore >= 80 ? { color: colors.success } : membership.reliabilityScore >= 50 ? { color: '#D97706' } : { color: '#DC2626' }]}>
                        {membership.reliabilityScore}/100
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Members — Visible to all */}
          <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowMembers(!showMembers)}>
            <View style={styles.sectionToggleLeft}>
              <Users size={16} color={colors.text} />
              <Text style={styles.sectionToggleText}>Membres ({memberships.length})</Text>
            </View>
            {showMembers ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
          </TouchableOpacity>
          {showMembers && (
            <View style={styles.membersCard}>
              {memberships.map((membership) => {
                const user = mockUsers.find((u) => u.id === membership.userId);
                if (!user) return null;
                return (
                  <View key={membership.userId} style={styles.memberRow}>
                    <Image
                      source={{ uri: user.avatarUrl || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=48&h=48&fit=crop&crop=face' }}
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{user.firstName} {user.lastName}</Text>
                        {membership.role !== 'MEMBER' && (
                          <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>
                              {membership.role === 'PRESIDENT' ? 'Président' : membership.role === 'TREASURER' ? 'Trésorier' : 'Secrétaire'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberPhone}>{user.phoneNumber}</Text>
                    </View>
                    <View style={styles.memberRight}>
                      {!isPresident && (
                        <View style={[styles.payBadge, membership.paymentStatus === 'PAID' ? styles.payBadgeOk : membership.paymentStatus === 'PENDING' ? styles.payBadgeWarn : styles.payBadgeBad]}>
                          <Text style={[styles.payBadgeText, membership.paymentStatus === 'PAID' ? { color: colors.success } : membership.paymentStatus === 'PENDING' ? { color: '#D97706' } : { color: colors.danger.DEFAULT }]}>
                            {membership.paymentStatus === 'PAID' ? 'Payé' : membership.paymentStatus === 'PENDING' ? 'En attente' : 'Retard'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Actions — Context-aware: different for president vs member */}
          {isPresident && (
            <>
              <Text style={styles.sectionTitle}>Actions (Président)</Text>
              <View style={styles.actionsCard}>
                <TouchableOpacity style={styles.actionRow} onPress={() => router.push(`/circle/${circleId}/replacement`)}>
                  <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                    <UserMinus size={18} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>Remplacer un membre</Text>
                    <Text style={styles.actionDesc}>Inviter un remplaçant (rachat requis)</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionRow} onPress={() => router.push(`/circle/${circleId}/recalculate`)}>
                  <View style={[styles.actionIcon, { backgroundColor: '#F0F9FF' }]}>
                    <Calculator size={18} color="#0369A1" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>Recalculer les cotisations</Text>
                    <Text style={styles.actionDesc}>Ajuster après départ sans remplaçant</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionRow} onPress={() => router.push(`/circle/${circleId}/exclusion`)}>
                  <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                    <Ban size={18} color={colors.danger.DEFAULT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>Exclure un membre</Text>
                    <Text style={styles.actionDesc}>Après {circle.exclusionThreshold} retards minimum</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Payment History */}
          <Text style={styles.sectionTitle}>Historique des paiements</Text>
          {Object.entries(monthlyGroups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, txs]) => {
              const [, month] = key.split('-');
              const monthIdx = parseInt(month || '1') - 1;
              const turnNumber = monthIdx - 5;
              const contributions = txs.filter((t: typeof txs[0]) => t.type === TransactionType.TONTINE_CONTRIBUTION);
              const payouts = txs.filter((t: typeof txs[0]) => t.type === TransactionType.PAYOUT);
              const isExpanded = expandedTurn === key;

              return (
                <View key={key} style={styles.turnCard}>
                  <TouchableOpacity style={styles.turnHeader} onPress={() => setExpandedTurn(isExpanded ? null : key)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Calendar size={16} color={colors.textMuted} />
                      <View>
                        <Text style={styles.turnMonth}>{monthNames[monthIdx] || month} {key.split('-')[0]}</Text>
                        <Text style={styles.turnMeta}>Tour {turnNumber > 0 ? turnNumber : '—'} — {contributions.length} cotisations</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.turnAmount}>{formatXOF(contributions.reduce((s: number, t: typeof contributions[0]) => s + t.amount, 0))}</Text>
                      {isExpanded ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.turnBody}>
                      {contributions.map((tx) => (
                        <View key={tx.id} style={styles.txRow}>
                          <View style={[styles.txDot, tx.status === 'COMPLETED' ? { backgroundColor: colors.success } : tx.status === 'PENDING' ? { backgroundColor: '#D97706' } : { backgroundColor: colors.danger.DEFAULT }]} />
                          <Text style={styles.txName}>{tx.memberName}</Text>
                          <Text style={styles.txAmount}>{formatXOF(tx.amount)}</Text>
                          <View style={[styles.txStatus, tx.status === 'COMPLETED' ? styles.txStatusOk : tx.status === 'PENDING' ? styles.txStatusWarn : styles.txStatusBad]}>
                            <Text style={[styles.txStatusText, tx.status === 'COMPLETED' ? { color: colors.success } : tx.status === 'PENDING' ? { color: '#D97706' } : { color: colors.danger.DEFAULT }]}>
                              {tx.status === 'COMPLETED' ? 'OK' : tx.status === 'PENDING' ? 'Attente' : 'Échoué'}
                            </Text>
                          </View>
                        </View>
                      ))}
                      {payouts.map((tx) => (
                        <View key={tx.id} style={[styles.txRow, { backgroundColor: '#ECFDF5', marginHorizontal: -spacing[4], paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderRadius: 10 }]}>
                          <Text style={[styles.txName, { color: colors.success }]}>Virement → {tx.memberName}</Text>
                          <Text style={[styles.txAmount, { color: colors.success, fontWeight: '700' }]}>{formatXOF(tx.amount)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

          {/* Reliability Events */}
          {circleEvents.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Événements de fiabilité</Text>
              <View style={styles.eventsCard}>
                {circleEvents.map((event: typeof circleEvents[0]) => {
                  const user = mockUsers.find((u) => u.id === event.userId);
                  return (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={[styles.eventDot, event.type === 'ON_TIME' ? { backgroundColor: colors.success } : event.type === 'LATE' ? { backgroundColor: '#D97706' } : { backgroundColor: colors.danger.DEFAULT }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventDesc}>{event.description}</Text>
                        <Text style={styles.eventMeta}>{user?.firstName} {user?.lastName} — {new Date(event.createdAt).toLocaleDateString('fr-FR')}</Text>
                      </View>
                      <Text style={[styles.eventImpact, event.scoreImpact > 0 ? { color: colors.success } : event.scoreImpact < 0 ? { color: colors.danger.DEFAULT } : {}]}>
                        {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar — Member sees pay button, president sees chat */}
      <View style={styles.bottomBar}>
        {!isPresident && (
          <TouchableOpacity style={styles.btnChat}>
            <MessageSquare size={20} color={colors.text} />
            <Text style={styles.btnChatText}>Discussion</Text>
          </TouchableOpacity>
        )}
        {!isPresident && (
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push(`/circle/${circleId}/pay`)}>
            <Text style={styles.btnPrimaryText}>
              Payer {formatXOF(circle.tontineAmount)}
            </Text>
          </TouchableOpacity>
        )}
        {isPresident && (
          <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]}>
            <MessageSquare size={18} color="#fff" />
            <Text style={styles.btnPrimaryText}>Discussion</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollView: { flex: 1 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingHorizontal: spacing[6], paddingVertical: spacing[6], flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Sora', fontSize: 20, fontWeight: '700', color: '#fff', marginLeft: spacing[4] },
  hero: { width: '100%', height: 200, backgroundColor: colors.primary.DEFAULT },
  infoSection: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, marginTop: -24, paddingTop: spacing[6], paddingHorizontal: spacing[6], paddingBottom: 120 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[5] },
  circleType: { fontFamily: 'WorkSans', fontSize: 14, color: colors.primary.DEFAULT, fontWeight: '600' },
  turnInfo: { fontFamily: 'WorkSans', fontSize: 13, color: colors.textMuted },
  statsRow: { flexDirection: 'row', marginBottom: spacing[5] },
  statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4] },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: 2 },
  statLabel: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },
  conditionsCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  conditionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing[2] },
  conditionsTitle: { fontSize: 14, fontWeight: '700', color: '#166534', fontFamily: 'WorkSans' },
  conditionsText: { fontSize: 13, color: '#166534', fontFamily: 'WorkSans', lineHeight: 19 },
  feeRow: { flexDirection: 'row', marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: '#BBF7D0' },
  feeLabel: { fontSize: 13, color: '#166534', fontFamily: 'WorkSans' },
  feeValue: { fontSize: 13, fontWeight: '600', color: '#166534', fontFamily: 'WorkSans' },
  inviteCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  inviteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing[2] },
  inviteTitle: { fontSize: 14, fontWeight: '700', color: colors.text, fontFamily: 'WorkSans' },
  inviteLink: { fontSize: 12, color: colors.primary.DEFAULT, fontFamily: 'Sora', marginBottom: spacing[3] },
  copyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.primary.DEFAULT, borderRadius: 10, paddingVertical: 10, marginBottom: spacing[2] },
  copyBtnOk: { backgroundColor: colors.success, borderColor: colors.success },
  copyBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary.DEFAULT, fontFamily: 'WorkSans' },
  inviteCode: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', textAlign: 'center' },
  validationCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  validationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[4] },
  validationTitle: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  validationStats: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  validationStat: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 10, padding: spacing[3], alignItems: 'center' },
  validationStatValue: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  validationStatLabel: { fontSize: 10, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: 2 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, padding: spacing[3], marginBottom: spacing[3] },
  statusBannerOk: { backgroundColor: '#ECFDF5' },
  statusBannerWarn: { backgroundColor: '#FEF3C7' },
  statusBannerText: { fontSize: 12, fontWeight: '600', fontFamily: 'WorkSans' },
  virementBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.success, borderRadius: 12, paddingVertical: 14 },
  virementBtnDisabled: { backgroundColor: '#D1D5DB' },
  virementBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: 'WorkSans' },
  sectionTitle: { fontFamily: 'Sora', fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing[4], marginTop: spacing[3] },
  sectionToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[3] },
  sectionToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionToggleText: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  reliabilityCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[3], overflow: 'hidden' },
  reliabilityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  reliabilityRowBad: { backgroundColor: '#FEF2F2' },
  irregularBadge: { fontSize: 9, fontWeight: '700', color: '#DC2626', fontFamily: 'WorkSans', backgroundColor: '#FEE2E2', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, overflow: 'hidden' },
  membersCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[4], overflow: 'hidden' },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  memberAvatar: { width: 40, height: 40, borderRadius: 20 },
  memberInfo: { flex: 1, marginLeft: spacing[3] },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontFamily: 'WorkSans', fontSize: 14, color: colors.text, fontWeight: '600' },
  roleBadge: { backgroundColor: colors.primary.tint, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  roleBadgeText: { fontSize: 9, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'WorkSans' },
  memberPhone: { fontFamily: 'WorkSans', fontSize: 12, color: colors.textMuted },
  memberRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  scoreBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  scoreGood: { backgroundColor: '#ECFDF5' },
  scoreMid: { backgroundColor: '#FEF3C7' },
  scoreBad: { backgroundColor: '#FEE2E2' },
  scoreBadgeText: { fontSize: 10, fontWeight: '700', fontFamily: 'Sora' },
  payBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  payBadgeOk: { backgroundColor: '#ECFDF5' },
  payBadgeWarn: { backgroundColor: '#FEF3C7' },
  payBadgeBad: { backgroundColor: '#FEE2E2' },
  payBadgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'WorkSans' },
  actionsCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[5], overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[4] },
  actionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  actionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: 2 },
  actionDesc: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },
  actionDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing[4] },
  turnCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[3], overflow: 'hidden' },
  turnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4] },
  turnMonth: { fontFamily: 'WorkSans', fontSize: 15, fontWeight: '600', color: colors.text },
  turnMeta: { fontFamily: 'WorkSans', fontSize: 11, color: colors.textMuted },
  turnAmount: { fontSize: 14, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
  turnBody: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing[4], gap: spacing[2] },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  txDot: { width: 6, height: 6, borderRadius: 3 },
  txName: { flex: 1, fontSize: 13, color: colors.text, fontFamily: 'WorkSans' },
  txAmount: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  txStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  txStatusOk: { backgroundColor: '#ECFDF5' },
  txStatusWarn: { backgroundColor: '#FEF3C7' },
  txStatusBad: { backgroundColor: '#FEE2E2' },
  txStatusText: { fontSize: 10, fontWeight: '600', fontFamily: 'WorkSans' },
  eventsCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[5], overflow: 'hidden' },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  eventDot: { width: 6, height: 6, borderRadius: 3, marginRight: spacing[3] },
  eventDesc: { fontSize: 13, color: colors.text, fontFamily: 'WorkSans' },
  eventMeta: { fontSize: 11, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: 2 },
  eventImpact: { fontSize: 13, fontWeight: '700', fontFamily: 'Sora' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, paddingHorizontal: spacing[6], paddingVertical: spacing[6], borderTopWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: spacing[4] },
  btnChat: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[6], backgroundColor: colors.bg, borderRadius: radius.lg, gap: spacing[2] },
  btnChatText: { fontFamily: 'WorkSans', fontSize: 16, color: colors.text, fontWeight: '500' },
  btnPrimary: { flex: 1, backgroundColor: colors.primary.DEFAULT, paddingVertical: spacing[6], borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: spacing[2] },
  btnPrimaryText: { fontFamily: 'WorkSans', fontSize: 16, color: '#fff', fontWeight: '600' },
});
