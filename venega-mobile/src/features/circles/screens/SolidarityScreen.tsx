import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  X,
  Check,
  HeartHandshake,
  Wallet,
  Plus,
  UserPlus,
  Receipt,
  Inbox,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import TransactionDetailModal from '../../../components/TransactionDetailModal';
import AvatarViewerModal from '../../../components/AvatarViewerModal';
import { Avatar, Button, Chip, IconButton, Sheet, TextField, initialsOf } from '../../../components/ui';
import {
  Badge,
  EmptyState,
  RoleBadge,
  ScreenHeader,
  cardStyle,
} from '../components/SolidarityParts';
import {
  ActionCard,
  CircleTab,
  CircleTabBar,
  DueCard,
  HistoryFilterButton,
  OverviewSectionHeader,
  OverviewStack,
  OverviewSummaryCard,
} from '../components/CircleOverview';
import {
  getCircle,
  getCircles,
  getFounderCircleIds,
  getCurrentUser,
  getLedgerEntries,
  getSolidarityTotals,
  getSolidarityRequests,
  submitSolidarityRequest,
  getSolidarityValidators,
  getBureauDecisions,
  setBureauDecision,
  isBureauFullyApproved,
  getCircleMembers,
  getMembershipRequests,
  updateMembershipRequest,
} from '../circleStore';
import { AidRequestStatus, EventType, Role, MembershipRequestStatus } from '@venega/types';
import type { SolidarityRequest, LedgerEntry, MembershipRequest } from '@venega/types';


const eventTypeLabel: Record<EventType, string> = {
  [EventType.MALADIE]: 'Maladie',
  [EventType.HOSPITALISATION]: 'Hospitalisation',
  [EventType.MARIAGE]: 'Mariage',
  [EventType.DECES]: 'Décès',
  [EventType.NAISSANCE]: 'Naissance',
  [EventType.AUTRE]: 'Autre',
};

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Présidente',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

const rolePriority: Record<Role, number> = {
  [Role.PRESIDENT]: 0,
  [Role.TREASURER]: 1,
  [Role.SECRETARY]: 2,
  [Role.MEMBER]: 3,
};

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

type Tab = 'apercu' | 'decaissements' | 'membres' | 'demandes';

export default function SolidarityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();

  const entries = getLedgerEntries(circle.id);
  const totals = getSolidarityTotals(circle.id);
  const monthsWithActivity = [...new Set(entries.map((e) => new Date(e.createdAt).getMonth()))].sort((a, b) => a - b);

  const [tab, setTab] = useState<Tab>('apercu');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [viewedProfile, setViewedProfile] = useState<{ name: string; photoUrl?: string; initials: string; color: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [requests, setRequests] = useState<SolidarityRequest[]>(() => getSolidarityRequests(circle.id));
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>(() => getMembershipRequests(circle.id));
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqBeneficiaryId, setReqBeneficiaryId] = useState<string | null>(null);
  const [reqEventType, setReqEventType] = useState<EventType>(EventType.MALADIE);
  const [reqReason, setReqReason] = useState('');
  const [reqAmount, setReqAmount] = useState('');

  const filteredEntries = monthFilter === null
    ? entries
    : entries.filter((e) => new Date(e.createdAt).getMonth() === monthFilter);

  const members = getCircleMembers(circle.id);
  const sortedMembers = [...members].sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
  const validators = getSolidarityValidators(circle.id);
  const myMembership = members.find((m) => m.userId === me.id);
  const isValidator = validators.includes(me.id);
  const isTreasurer = myMembership?.role === Role.TREASURER;
  const pendingMembership = membershipRequests.filter((r) => r.status === MembershipRequestStatus.PENDING);

  const refreshRequests = () => setRequests(getSolidarityRequests(circle.id));
  const refreshMembershipRequests = () => setMembershipRequests(getMembershipRequests(circle.id));

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
      refreshMembershipRequests();
    }, [circle.id])
  );

  const handleDecideMembership = (id: string, approved: boolean) => {
    updateMembershipRequest(id, { status: approved ? MembershipRequestStatus.APPROVED : MembershipRequestStatus.REJECTED, decidedAt: new Date().toISOString() });
    refreshMembershipRequests();
  };

  const openRequestModal = () => {
    setReqBeneficiaryId(null);
    setReqEventType(EventType.MALADIE);
    setReqReason('');
    setReqAmount('');
    setShowRequestModal(true);
  };

  const handleInvite = () => {
    router.push({ pathname: '/circle/[id]/invite', params: { id: circle.id } });
  };

  const handleSubmitRequest = () => {
    const amount = parseInt(reqAmount.replace(/\D/g, ''), 10);
    const beneficiary = members.find((m) => m.userId === reqBeneficiaryId);
    if (!beneficiary || !reqReason.trim() || !amount) return;
    submitSolidarityRequest({
      circleId: circle.id,
      userId: beneficiary.userId,
      requesterName: `${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      eventType: reqEventType,
      reason: reqReason.trim(),
      amountRequested: amount,
    });
    setShowRequestModal(false);
    setTab('decaissements');
    refreshRequests();
  };

  const handleSetDecision = (requestId: string, approved: boolean) => {
    setBureauDecision(requestId, me.id, approved);
    refreshRequests();
  };

  const handlePayNow = () => {
    router.push(`/payment?circleId=${circle.id}&amount=${circle.solidarityAmount || 1000}&type=SOLIDARITY` as any);
  };


  const canSubmit = !!reqBeneficiaryId && !!reqReason.trim() && !!reqAmount;
  const showFooter = isFounder && tab === 'decaissements';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader
          title={circle.name}
          subtitle={`Solidarité · ${isFounder ? 'Vous êtes fondateur' : `Vous êtes ${roleLabel[myMembership?.role ?? Role.MEMBER].toLowerCase()}`}`}
          onBack={() => router.back()}
          right={<IconButton icon={UserPlus} variant="plain" accessibilityLabel="Inviter un membre" onPress={handleInvite} />}
        />

        {/* Onglets */}
        <CircleTabBar>
          <CircleTab label="Aperçu" active={tab === 'apercu'} onPress={() => setTab('apercu')} />
          <CircleTab label="Décaissements" active={tab === 'decaissements'} onPress={() => setTab('decaissements')} />
          <CircleTab label="Membres" active={tab === 'membres'} onPress={() => setTab('membres')} />
          <CircleTab label="Demandes" active={tab === 'demandes'} badge={pendingMembership.length} onPress={() => setTab('demandes')} />
        </CircleTabBar>

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {tab === 'apercu' && (
            <View>
              <OverviewStack>
                <OverviewSummaryCard
                  label="Solde de la caisse"
                  amount={`${totals.balance < 0 ? '−' : ''}${formatXOF(Math.abs(totals.balance))}`}
                  negative={totals.balance < 0}
                  stats={[
                    { label: 'Cotisé', value: formatXOF(totals.totalCredits) },
                    { label: 'Versé', value: formatXOF(totals.totalDebits) },
                  ]}
                />

                <DueCard amount={formatXOF(circle.solidarityAmount || 1000)} onPay={handlePayNow} />

                {isFounder && (
                  <ActionCard
                    icon={HeartHandshake}
                    title="Un membre traverse un coup dur ?"
                    sub="Initiez une aide, validée par les approbateurs."
                    actionLabel="Initier"
                    onPress={openRequestModal}
                  />
                )}
              </OverviewStack>

              <OverviewSectionHeader
                title="Historique"
                right={
                  monthsWithActivity.length > 1 ? (
                    <HistoryFilterButton
                      label={monthFilter !== null ? `${monthLabels[monthFilter]} 2026` : 'Filtrer'}
                      active={monthFilter !== null}
                      onPress={() => setShowMonthFilter((v) => !v)}
                    />
                  ) : null
                }
              />

              {filteredEntries.length === 0 ? (
                <View style={cardStyle}>
                  <EmptyState icon={Receipt} title="Aucune opération" text="Les cotisations et les aides versées apparaîtront ici." />
                </View>
              ) : (
                <View style={[cardStyle, styles.listCard]}>
                  {filteredEntries.slice(0, visibleCount).map((e, idx, arr) => {
                    const isCredit = e.type === 'CREDIT';
                    return (
                      <TouchableOpacity
                        key={e.id}
                        activeOpacity={0.6}
                        onPress={() => setSelectedEntry(e)}
                        style={styles.row}
                      >
                        <View style={[styles.iconTile, { backgroundColor: isCredit ? colors.primary.tint : colors.danger.tint }]}>
                          {isCredit
                            ? <ArrowDownLeft size={18} color={colors.primary.DEFAULT} strokeWidth={1.8} />
                            : <ArrowUpRight size={18} color={colors.danger.DEFAULT} strokeWidth={1.8} />}
                        </View>
                        <View style={[styles.rowBody, idx < arr.length - 1 && styles.rowBorder]}>
                          <View style={styles.flex}>
                            <Text style={styles.rowTitle} numberOfLines={1}>
                              {isCredit ? `Cotisation — ${e.memberName ?? ''}` : e.description}
                            </Text>
                            <Text style={styles.rowSub}>{formatDate(e.createdAt)}</Text>
                          </View>
                          <Text style={[styles.amount, { color: isCredit ? colors.primary.DEFAULT : colors.danger.DEFAULT }]}>
                            {isCredit ? '+' : '−'}{formatXOF(e.amount)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {filteredEntries.length > visibleCount && (
                <Button title="Voir plus" variant="ghost" size="sm" onPress={() => setVisibleCount((n) => n + 5)} />
              )}

              <Text style={styles.hintText}>
                La caisse est transparente : chaque cotisation et chaque déboursement est tracé et visible
                de tous les membres du cercle.
              </Text>
            </View>
          )}

          {tab === 'decaissements' && (
            <>
              {!isFounder && (
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
                    Un événement à annoncer ? Contactez le Président du cercle — lui seul peut initier une
                    demande d'aide. Vous pouvez suivre ici l'avancement de chaque décaissement.
                  </Text>
                </View>
              )}

              {requests.length === 0 && (
                <View style={cardStyle}>
                  <EmptyState icon={HeartHandshake} title="Aucun décaissement" text="Les demandes d'aide du cercle apparaîtront ici." />
                </View>
              )}

              {requests.map((r) => {
                const decisions = getBureauDecisions(r.id);
                const fullyApproved = isBureauFullyApproved(circle.id, r.id);
                const approvedCount = validators.filter((v) => decisions[v] === true).length;
                const myDecision = decisions[me.id];
                const isExpanded = expandedRequestId === r.id;
                const isPendingBureau = r.status === AidRequestStatus.APPROVED;

                return (
                  <TouchableOpacity
                    key={r.id}
                    activeOpacity={0.8}
                    onPress={() => setExpandedRequestId((prev) => (prev === r.id ? null : r.id))}
                    style={[cardStyle, styles.requestCard]}
                  >
                    <View style={styles.requestTop}>
                      <Avatar
                        name={r.requesterName}
                        uri={members.find((m) => m.userId === r.userId)?.user.avatarUrl}
                        size={40}
                      />
                      <View style={styles.flex}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{r.requesterName}</Text>
                        <Text style={styles.rowSub}>{eventTypeLabel[r.eventType]} · {formatXOF(r.amountRequested)}</Text>
                      </View>
                      <StatusPill status={r.status} />
                    </View>

                    {isExpanded && (
                      <View style={styles.requestExpanded}>
                        <Text style={styles.requestReason}>{r.reason}</Text>

                        {isPendingBureau && validators.length === 0 && isFounder && (
                          <Text style={styles.hintTextLeft}>
                            Aucun approbateur désigné — rendez-vous dans Gestion du cercle pour en choisir.
                          </Text>
                        )}

                        {isPendingBureau && validators.length > 0 && (
                          <>
                            <View style={styles.progressBlock}>
                              <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${(approvedCount / validators.length) * 100}%` }]} />
                              </View>
                              <Text style={styles.progressText}>{approvedCount}/{validators.length} approbateurs</Text>
                            </View>

                            {isValidator && (
                              <View style={styles.decisionRow}>
                                <Button
                                  title="Désapprouver"
                                  size="sm"
                                  icon={X}
                                  variant={myDecision === false ? 'danger' : 'secondary'}
                                  onPress={() => handleSetDecision(r.id, false)}
                                  style={styles.flex}
                                />
                                <Button
                                  title="Approuver"
                                  size="sm"
                                  icon={Check}
                                  variant={myDecision === true ? 'primary' : 'secondary'}
                                  onPress={() => handleSetDecision(r.id, true)}
                                  style={styles.flex}
                                />
                              </View>
                            )}

                            {isTreasurer && (
                              <Button
                                title={fullyApproved ? 'Décaisser' : 'En attente des approbateurs'}
                                size="sm"
                                icon={Wallet}
                                disabled={!fullyApproved}
                                onPress={() => router.push({ pathname: '/circle/[id]/solidarity-disburse/[requestId]', params: { id: circle.id, requestId: r.id } })}
                              />
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {tab === 'membres' && (
            <>
              <Text style={styles.sectionTitle}>{sortedMembers.length} membre(s)</Text>
              <View style={[cardStyle, styles.listCard]}>
                {sortedMembers.map((m, idx) => {
                  const fullName = `${m.user.firstName} ${m.user.lastName}`;
                  const initialsText = initialsOf(fullName);
                  return (
                    <TouchableOpacity
                      key={m.userId}
                      activeOpacity={0.6}
                      style={styles.row}
                      onPress={() => router.push({ pathname: '/circle/[id]/solidarity-member/[userId]', params: { id: circle.id, userId: m.userId } })}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        accessibilityLabel={`Voir la photo de ${fullName}`}
                        onPress={() => setViewedProfile({ name: m.userId === me.id ? 'Moi' : fullName, photoUrl: m.user.avatarUrl, initials: initialsText, color: colors.primary.DEFAULT })}
                      >
                        <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                      </TouchableOpacity>
                      <View style={[styles.rowBody, idx < sortedMembers.length - 1 && styles.rowBorder]}>
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {fullName}{m.userId === me.id ? ' (Moi)' : ''}
                          </Text>
                          <View style={styles.memberMeta}>
                            <RoleBadge role={m.role} label={roleLabel[m.role]} />
                            <Text style={styles.rowSub}>Membre depuis {formatMonthYear(m.joinedAt)}</Text>
                          </View>
                        </View>
                        <ChevronRight size={18} color={colors.subtle} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {tab === 'demandes' && (
            <>
              <Text style={styles.sectionTitle}>Demandes d'adhésion</Text>
              {pendingMembership.length === 0 ? (
                <View style={cardStyle}>
                  <EmptyState icon={Inbox} title="Aucune demande" text="Aucune demande d'adhésion en attente." />
                </View>
              ) : (
                pendingMembership.map((r) => (
                  <View key={r.id} style={[cardStyle, styles.requestCard]}>
                    <View style={styles.requestTop}>
                      <Avatar name={r.fullName} size={40} />
                      <View style={styles.flex}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{r.fullName}</Text>
                        <Text style={styles.rowSub}>{r.phoneNumber}</Text>
                      </View>
                    </View>
                    <View style={styles.decisionRow}>
                      <Button title="Refuser" size="sm" variant="secondary" onPress={() => handleDecideMembership(r.id, false)} style={styles.flex} />
                      <Button title="Valider" size="sm" onPress={() => handleDecideMembership(r.id, true)} style={styles.flex} />
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>

        {showFooter && (
          <View style={styles.footer}>
            <Button title="Initier une aide" icon={Plus} onPress={openRequestModal} />
          </View>
        )}

        {/* Filtre par mois */}
        <Sheet visible={showMonthFilter} onClose={() => setShowMonthFilter(false)} title="Filtrer par mois">
          <View style={styles.chipWrap}>
            <Chip
              label="Tous les mois"
              selected={monthFilter === null}
              onPress={() => { setMonthFilter(null); setVisibleCount(5); setShowMonthFilter(false); }}
            />
            {monthsWithActivity.map((mIdx) => (
              <Chip
                key={mIdx}
                label={`${monthLabels[mIdx]} 2026`}
                selected={monthFilter === mIdx}
                onPress={() => { setMonthFilter(mIdx); setVisibleCount(5); setShowMonthFilter(false); }}
              />
            ))}
          </View>
        </Sheet>

        {/* Initier une demande (Président uniquement) */}
        <Sheet visible={showRequestModal} onClose={() => setShowRequestModal(false)} title="Initier une demande">
          <Text style={styles.sheetIntro}>
            À utiliser une fois le membre contacté et son événement connu — la demande part directement
            en validation auprès des approbateurs désignés.
          </Text>

          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.formLabel}>Membre concerné</Text>
            <View style={styles.beneficiaryRow}>
              {members.map((m) => {
                const active = reqBeneficiaryId === m.userId;
                const fullName = `${m.user.firstName} ${m.user.lastName}`;
                return (
                  <TouchableOpacity
                    key={m.userId}
                    style={styles.beneficiary}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={fullName}
                    onPress={() => setReqBeneficiaryId(m.userId)}
                  >
                    <Avatar name={fullName} uri={m.user.avatarUrl} size={40} highlighted={active} />
                    <Text style={[styles.beneficiaryName, active && styles.beneficiaryNameActive]} numberOfLines={1}>
                      {m.user.firstName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Type d'événement</Text>
            <View style={styles.chipWrap}>
              {Object.values(EventType).map((et) => (
                <Chip key={et} label={eventTypeLabel[et]} selected={reqEventType === et} onPress={() => setReqEventType(et)} />
              ))}
            </View>

            <View style={styles.fields}>
              <TextField
                label="Motif de la demande"
                placeholder="Expliquez brièvement la situation aux membres du cercle…"
                value={reqReason}
                onChangeText={setReqReason}
                multiline
                numberOfLines={3}
              />
              <TextField
                label="Montant à décaisser"
                placeholder="Ex : 45000"
                value={reqAmount}
                onChangeText={setReqAmount}
                keyboardType="numeric"
                suffix="F CFA"
              />
            </View>
          </ScrollView>

          <Button title="Envoyer aux approbateurs" disabled={!canSubmit} onPress={handleSubmitRequest} style={styles.sheetSubmit} />
        </Sheet>

        {selectedEntry && (
          <TransactionDetailModal
            visible={!!selectedEntry}
            onClose={() => setSelectedEntry(null)}
            isCredit={selectedEntry.type === 'CREDIT'}
            name={selectedEntry.memberName ?? '—'}
            amount={formatXOF(selectedEntry.amount)}
            fields={[
              { label: 'Type', value: selectedEntry.type === 'CREDIT' ? 'Cotisation' : 'Aide versée' },
              { label: 'Membre', value: selectedEntry.memberName ?? '—' },
              ...(selectedEntry.reason ? [{ label: 'Motif', value: selectedEntry.reason }] : []),
              { label: 'Statut', value: selectedEntry.type === 'CREDIT' ? 'Confirmée' : 'Justifié' },
              { label: 'Date', value: formatDate(selectedEntry.createdAt) },
            ]}
          />
        )}

        {viewedProfile && (
          <AvatarViewerModal
            visible={!!viewedProfile}
            onClose={() => setViewedProfile(null)}
            name={viewedProfile.name}
            photoUrl={viewedProfile.photoUrl}
            initials={viewedProfile.initials}
            color={viewedProfile.color}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function StatusPill({ status }: { status: AidRequestStatus }) {
  const meta: Record<AidRequestStatus, { label: string; bg: string; fg: string }> = {
    [AidRequestStatus.PENDING]: { label: 'En attente', bg: colors.accent.tint, fg: colors.accent.deep },
    [AidRequestStatus.VOTING]: { label: 'En attente', bg: colors.accent.tint, fg: colors.accent.deep },
    [AidRequestStatus.APPROVED]: { label: 'À valider', bg: colors.accent.tint, fg: colors.accent.deep },
    [AidRequestStatus.REJECTED]: { label: 'Rejetée', bg: colors.danger.tint, fg: colors.danger.DEFAULT },
    [AidRequestStatus.DISBURSED]: { label: 'Décaissée', bg: colors.primary.tint, fg: colors.primary.DEFAULT },
  };
  const m = meta[status];
  return <Badge label={m.label} bg={m.bg} fg={m.fg} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.bg },
  contentScroll: { flex: 1, backgroundColor: colors.fill },
  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginTop: 4 },

  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },

  /* Listes */
  listCard: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 12 },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingRight: 14,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  iconTile: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  amount: { ...typography.callout, fontWeight: '600' },
  memberMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 3 },

  hintText: { ...typography.footnote, color: colors.muted, textAlign: 'center', marginTop: 16, paddingHorizontal: 8 },
  hintTextLeft: { ...typography.footnote, color: colors.muted },
  notice: {
    backgroundColor: colors.info.tint,
    borderRadius: radius.md,
    padding: 14,
  },
  noticeText: { ...typography.footnote, color: colors.inkSoft },

  /* Demandes */
  requestCard: { padding: 14, gap: 12 },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requestExpanded: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  requestReason: { ...typography.callout, color: colors.inkSoft },
  progressBlock: { gap: 6 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.fill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary.DEFAULT },
  progressText: { ...typography.caption, color: colors.muted },
  decisionRow: { flexDirection: 'row', gap: 10 },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  /* Feuilles */
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetIntro: { ...typography.callout, color: colors.muted, marginBottom: 8 },
  sheetScroll: { flexGrow: 0, maxHeight: 440 },
  formLabel: { ...typography.callout, fontWeight: '600', color: colors.inkSoft, marginTop: 16, marginBottom: 10 },
  beneficiaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  beneficiary: { alignItems: 'center', gap: 6, width: 60 },
  beneficiaryName: { ...typography.caption, fontWeight: '400', color: colors.muted },
  beneficiaryNameActive: { fontWeight: '600', color: colors.primary.DEFAULT },
  fields: { gap: 20, marginTop: 20, paddingBottom: 8 },
  sheetSubmit: { marginTop: 12 },
});
