import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import {
  ArrowLeft,
  Settings2,
  Check,
  Clock,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  CalendarClock,
  RotateCw,
  Inbox,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Role, AidRequestStatus, MembershipRequestStatus, EventType } from '@venega/types';
import {
  getCircle,
  getCircles,
  getActiveCycle,
  getCircleMembers,
  getFounderCircleIds,
  getMembershipRequests,
  updateMembershipRequest,
  getSolidarityRequests,
  getBureauDecisions,
  setBureauDecision,
  isBureauFullyApproved,
  disburseSolidarityRequest,
  getSolidarityValidators,
  getSolidarityTotals,
  getLedgerEntries,
  getCurrentUser,
} from '../circleStore';
import { Button, IconButton } from '../../../components/ui';

const frequencyLabel: Record<string, string> = {
  DAILY: 'Journalière',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bimensuelle',
  MONTHLY: 'Mensuelle',
  CUSTOM: 'Personnalisée',
};

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const eventTypeLabel: Record<EventType, string> = {
  [EventType.MALADIE]: 'Maladie',
  [EventType.HOSPITALISATION]: 'Hospitalisation',
  [EventType.MARIAGE]: 'Mariage',
  [EventType.DECES]: 'Décès',
  [EventType.NAISSANCE]: 'Naissance',
  [EventType.AUTRE]: 'Autre',
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '')).toUpperCase();
}

type Tab = 'overview' | 'members' | 'requests' | 'treasury';

export default function CircleAdminScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0];
  const [tab, setTab] = useState<Tab>('requests');
  const [, forceRender] = useState(0);
  const refresh = () => forceRender((n) => n + 1);

  if (!circle) return null;

  if (circle.type === 'SOLIDARITY_ONLY') {
    return <Redirect href={`/circle/${circle.id}/solidarity` as any} />;
  }

  if (circle.type === 'TONTINE_ONLY') {
    return <Redirect href={`/circle/${circle.id}/tontine` as any} />;
  }

  const me = getCurrentUser();
  const isPresident = getFounderCircleIds().includes(circle.id);
  const cycle = getActiveCycle(circle);
  const members = getCircleMembers(circle.id);
  const myMembership = members.find((m) => m.userId === me.id);
  const isTreasurer = myMembership?.role === Role.TREASURER;

  const pendingMembership = getMembershipRequests(circle.id).filter((r) => r.status === MembershipRequestStatus.PENDING);
  const solidarityRequests = getSolidarityRequests(circle.id);
  const bureauPending = solidarityRequests.filter((r) => r.status === AidRequestStatus.APPROVED);
  const requestsCount = pendingMembership.length + bureauPending.length;

  const validators = getSolidarityValidators(circle.id);
  const totals = getSolidarityTotals(circle.id);
  const ledger = getLedgerEntries(circle.id).slice(0, 8);

  const handleDecideMembership = (id: string, approved: boolean) => {
    updateMembershipRequest(id, { status: approved ? MembershipRequestStatus.APPROVED : MembershipRequestStatus.REJECTED });
    refresh();
  };

  const typeLabel =
    circle.type === 'NATURE' ? 'En nature'
    : 'Tontine';

  const roleLabel = isPresident ? 'Président' : isTreasurer ? 'Trésorier' : 'Membre';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.headerWrap}>
          <View style={styles.header}>
            <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
            <Text style={styles.headerTitle}>Administration</Text>
            <IconButton
              icon={Settings2}
              variant="plain"
              accessibilityLabel="Gérer le cercle"
              onPress={() => router.push(`/circle/${circle.id}/manage` as any)}
            />
          </View>

          <View style={styles.identity}>
            <Text style={styles.circleName} numberOfLines={2}>
              {circle.name}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{typeLabel}</Text>
              </View>
              <View style={[styles.badge, styles.badgeRole]}>
                <Text style={[styles.badgeText, styles.badgeRoleText]}>Vous êtes {roleLabel.toLowerCase()}</Text>
              </View>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            <TabButton label="Vue d'ensemble" active={tab === 'overview'} onPress={() => setTab('overview')} />
            <TabButton label="Membres" active={tab === 'members'} onPress={() => setTab('members')} />
            <TabButton
              label="Demandes"
              active={tab === 'requests'}
              badge={requestsCount}
              onPress={() => setTab('requests')}
            />
            <TabButton label="Trésorerie" active={tab === 'treasury'} onPress={() => setTab('treasury')} />
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'overview' && (
            <View style={styles.stack}>
              {(!!circle.tontineAmount || !!circle.solidarityAmount) && (
                <View style={styles.card}>
                  {!!circle.tontineAmount && (
                    <View style={[styles.kvRow, !!circle.solidarityAmount && styles.rowBorder]}>
                      <Text style={styles.kvLabel}>Cotisation tontine par tour</Text>
                      <Text style={styles.kvValue}>{formatXOF(circle.tontineAmount)}</Text>
                    </View>
                  )}
                  {!!circle.solidarityAmount && (
                    <View style={styles.kvRow}>
                      <Text style={styles.kvLabel}>Cotisation solidarité par tour</Text>
                      <Text style={styles.kvValue}>{formatXOF(circle.solidarityAmount)}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.statGrid}>
                <StatTile icon={Users} value={`${members.length}`} label="Membres" />
                <StatTile
                  icon={CalendarClock}
                  value={circle.frequency ? frequencyLabel[circle.frequency] ?? circle.frequency : '—'}
                  label="Fréquence"
                />
                <StatTile
                  icon={RotateCw}
                  value={cycle ? `${cycle.currentTurn} / ${cycle.totalTurns || members.length}` : '—'}
                  label="Tour actuel"
                />
              </View>
            </View>
          )}

          {tab === 'members' && (
            <View style={styles.listCard}>
              {members.map((m, idx) => (
                <View key={m.userId} style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(`${m.user.firstName} ${m.user.lastName}`)}</Text>
                  </View>
                  <View style={[styles.rowBody, idx < members.length - 1 && styles.rowBorder]}>
                    <View style={styles.flex}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {m.user.firstName} {m.user.lastName}
                      </Text>
                      <Text style={styles.rowSub}>
                        {m.role === Role.PRESIDENT ? 'Président' : m.role === Role.TREASURER ? 'Trésorier' : 'Membre'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {tab === 'requests' && (
            <View>
              <Text style={styles.sectionTitle}>Demandes d'adhésion</Text>
              {pendingMembership.length === 0 ? (
                <EmptyLine text="Aucune demande en attente." />
              ) : (
                <View style={styles.stack}>
                  {pendingMembership.map((r) => (
                    <View key={r.id} style={styles.requestCard}>
                      <View style={styles.requestHeader}>
                        <View style={[styles.avatar, styles.avatarTint]}>
                          <Text style={[styles.avatarText, styles.avatarTintText]}>{initials(r.fullName)}</Text>
                        </View>
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {r.fullName}
                          </Text>
                          <Text style={styles.rowSub}>{r.phoneNumber}</Text>
                        </View>
                      </View>
                      <View style={styles.docsRow}>
                        <DocTag label="CNIB fournie" />
                        {r.selfieUrl && <DocTag label="Selfie fourni" />}
                      </View>
                      {r.joiningFee > 0 && (
                        <View style={styles.feeRow}>
                          <Text style={styles.feeLabel}>Frais de rachat</Text>
                          <Text style={styles.feeAmount}>{formatXOF(r.joiningFee)}</Text>
                        </View>
                      )}
                      <View style={styles.actionRow}>
                        <Button
                          title="Refuser"
                          variant="secondary"
                          size="sm"
                          onPress={() => handleDecideMembership(r.id, false)}
                          style={styles.flex}
                        />
                        <Button
                          title="Valider"
                          size="sm"
                          onPress={() => handleDecideMembership(r.id, true)}
                          style={styles.flex}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <Text style={[styles.sectionTitle, styles.section]}>Demandes d'aide à valider</Text>
              {bureauPending.length === 0 ? (
                <EmptyLine text="Aucune demande en attente du bureau." />
              ) : (
                <View style={styles.stack}>
                  {bureauPending.map((r) => {
                    const votesFor = r.votes.filter((v) => v.approved).length;
                    const votesAgainst = r.votes.filter((v) => !v.approved).length;
                    const bureauDecisions = getBureauDecisions(r.id);
                    const fullyApproved = isBureauFullyApproved(circle.id, r.id);
                    const iApproved = bureauDecisions[me.id] === true;
                    const isValidator = validators.includes(me.id);

                    return (
                      <View key={r.id} style={styles.requestCard}>
                        <View style={styles.requestHeader}>
                          <View style={[styles.avatar, styles.avatarDanger]}>
                            <Text style={[styles.avatarText, styles.avatarDangerText]}>
                              {initials(r.requesterName)}
                            </Text>
                          </View>
                          <View style={styles.flex}>
                            <Text style={styles.rowTitle} numberOfLines={1}>
                              {r.requesterName}
                            </Text>
                            <Text style={styles.rowSub}>
                              {eventTypeLabel[r.eventType]} · {formatXOF(r.amountRequested)} demandés
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.tally}>
                          Vote des membres : {votesFor} pour · {votesAgainst} contre
                        </Text>

                        <View style={styles.approvals}>
                          {validators.map((vId, i) => {
                            const vMember = members.find((m) => m.userId === vId);
                            const done = bureauDecisions[vId] === true;
                            const isMe = vId === me.id;
                            return (
                              <ApprovalRow
                                key={vId}
                                label={
                                  isMe
                                    ? `Votre validation (${vMember?.role === Role.TREASURER ? 'Trésorier' : 'Président'})`
                                    : `${vMember?.user.firstName} ${vMember?.user.lastName}`
                                }
                                done={done}
                                last={i === validators.length - 1}
                              />
                            );
                          })}
                        </View>

                        <Text style={styles.hint}>
                          Le décaissement nécessite l'accord de tous les validateurs désignés.
                        </Text>

                        {isValidator && !iApproved && (
                          <Button
                            title="Approuver le décaissement"
                            size="sm"
                            onPress={() => {
                              setBureauDecision(r.id, me.id, true);
                              refresh();
                            }}
                          />
                        )}
                        {isTreasurer && (
                          <Button
                            title={fullyApproved ? 'Décaisser' : 'En attente du bureau'}
                            icon={Wallet}
                            size="sm"
                            disabled={!fullyApproved}
                            onPress={() => {
                              disburseSolidarityRequest(r.id);
                              refresh();
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {tab === 'treasury' && (
            <View style={styles.stack}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Solde de la caisse de solidarité</Text>
                <Text style={styles.balanceValue}>{formatXOF(totals.balance)}</Text>
              </View>

              <Text style={[styles.sectionTitle, styles.subSection]}>Dernières opérations</Text>
              {ledger.length === 0 ? (
                <EmptyLine text="Aucune opération pour le moment." />
              ) : (
                <View style={styles.listCard}>
                  {ledger.map((e, idx) => {
                    const credit = e.type === 'CREDIT';
                    const Icon = credit ? ArrowDownLeft : ArrowUpRight;
                    return (
                      <View key={e.id} style={styles.row}>
                        <View style={[styles.ledgerIcon, credit ? styles.ledgerIconIn : styles.ledgerIconOut]}>
                          <Icon size={18} color={credit ? colors.primary.DEFAULT : colors.danger.DEFAULT} />
                        </View>
                        <View style={[styles.rowBody, idx < ledger.length - 1 && styles.rowBorder]}>
                          <Text style={[styles.rowTitle, styles.flex]} numberOfLines={1}>
                            {e.description}
                          </Text>
                          <Text style={[styles.amount, { color: credit ? colors.primary.DEFAULT : colors.danger.DEFAULT }]}>
                            {credit ? '+' : '−'}
                            {formatXOF(e.amount)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TabButton({ label, active, badge, onPress }: { label: string; active: boolean; badge?: number; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.tabBtn}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <View style={styles.tabInner}>
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
        {!!badge && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {active && <View style={styles.tabUnderline} />}
    </TouchableOpacity>
  );
}

function StatTile({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIcon}>
        <Icon size={18} color={colors.primary.DEFAULT} strokeWidth={1.8} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DocTag({ label }: { label: string }) {
  return (
    <View style={styles.docTag}>
      <Check size={14} color={colors.primary.DEFAULT} strokeWidth={2.5} />
      <Text style={styles.docTagText}>{label}</Text>
    </View>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <View style={styles.emptyLine}>
      <Inbox size={18} color={colors.subtle} strokeWidth={1.8} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function ApprovalRow({ label, done, last }: { label: string; done: boolean; last?: boolean }) {
  return (
    <View style={[styles.approvalRow, !last && styles.rowBorder]}>
      <Text style={styles.approvalLabel}>{label}</Text>
      {done ? (
        <View style={styles.approvalState}>
          <Check size={14} color={colors.primary.DEFAULT} strokeWidth={2.5} />
          <Text style={[styles.approvalText, { color: colors.primary.DEFAULT }]}>Approuvée</Text>
        </View>
      ) : (
        <View style={styles.approvalState}>
          <Clock size={14} color={colors.accent.dark} />
          <Text style={[styles.approvalText, { color: colors.accent.deep }]}>En attente</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },

  headerWrap: {
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  identity: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  circleName: { ...typography.title, color: colors.ink },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.fill },
  badgeText: { ...typography.caption, color: colors.inkSoft },
  badgeRole: { backgroundColor: colors.primary.tint },
  badgeRoleText: { color: colors.primary.dark },

  tabRow: { flexDirection: 'row', gap: 20, paddingHorizontal: 20 },
  tabBtn: { minHeight: 44, justifyContent: 'center' },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { ...typography.callout, fontWeight: '500', color: colors.muted },
  tabTextActive: { fontWeight: '600', color: colors.ink },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary.DEFAULT,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: colors.danger.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: { fontSize: 11, lineHeight: 14, fontWeight: '700', color: '#FFFFFF' },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  stack: { gap: 12 },
  section: { marginTop: 28 },
  subSection: { marginTop: 8, marginBottom: -4 },
  sectionTitle: { ...typography.callout, fontWeight: '600', color: colors.ink, marginBottom: 10, marginLeft: 4 },

  card: {
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  kvRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 14 },
  kvLabel: { flex: 1, ...typography.callout, color: colors.muted },
  kvValue: { ...typography.bodyStrong, color: colors.ink, textAlign: 'right' },

  statGrid: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { ...typography.callout, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  statLabel: { ...typography.caption, fontWeight: '400', color: colors.muted },

  listCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16 },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingRight: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  amount: { ...typography.callout, fontWeight: '700' },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...typography.footnote, fontWeight: '700', color: colors.inkSoft },
  avatarTint: { backgroundColor: colors.primary.tint },
  avatarTintText: { color: colors.primary.dark },
  avatarDanger: { backgroundColor: colors.danger.tint },
  avatarDangerText: { color: colors.danger.DEFAULT },

  ledgerIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  ledgerIconIn: { backgroundColor: colors.primary.tint },
  ledgerIconOut: { backgroundColor: colors.danger.tint },

  requestCard: {
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  docTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
  },
  docTagText: { ...typography.footnote, color: colors.inkSoft },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.accent.tint,
  },
  feeLabel: { flex: 1, ...typography.footnote, color: colors.accent.deep },
  feeAmount: { ...typography.callout, fontWeight: '700', color: colors.accent.deep },
  actionRow: { flexDirection: 'row', gap: 10 },

  tally: { ...typography.footnote, color: colors.muted },
  approvals: {
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  approvalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 10 },
  approvalLabel: { flex: 1, ...typography.footnote, color: colors.inkSoft },
  approvalState: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  approvalText: { ...typography.footnote, fontWeight: '600' },
  hint: { ...typography.footnote, color: colors.muted },

  balanceCard: { padding: 20, borderRadius: 24, backgroundColor: colors.primary.dark },
  balanceLabel: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8 },
  balanceValue: { ...typography.display, color: '#FFFFFF', marginTop: 4 },

  emptyLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  emptyText: { flex: 1, ...typography.callout, color: colors.muted },
});
