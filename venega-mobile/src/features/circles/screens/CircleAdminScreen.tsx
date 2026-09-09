import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { ArrowLeft, Settings2, Check, Clock, Wallet, TrendingUp, TrendingDown, Coins, Users, CalendarClock, RotateCw } from 'lucide-react-native';
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
    circle.type === 'HYBRID' ? 'Hybride'
    : circle.type === 'NATURE' ? 'En nature'
    : 'Tontine';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push(`/circle/${circle.id}/manage` as any)}>
              <Settings2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeLabel}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{isPresident ? 'Vous êtes Président' : isTreasurer ? 'Vous êtes Trésorier' : 'Vous êtes Membre'}</Text>
            </View>
          </View>
          <Text style={styles.circleName} numberOfLines={2}>{circle.name}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            <TabButton label="Vue d'ensemble" active={tab === 'overview'} onPress={() => setTab('overview')} />
            <TabButton label="Membres" active={tab === 'members'} onPress={() => setTab('members')} />
            <TabButton label="Demandes" active={tab === 'requests'} badge={requestsCount} onPress={() => setTab('requests')} />
            <TabButton label="Trésorerie" active={tab === 'treasury'} onPress={() => setTab('treasury')} />
          </ScrollView>
        </View>

        <View style={styles.body}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {tab === 'overview' && (
              <View style={{ gap: 12 }}>
                {!!circle.tontineAmount && (
                  <View style={styles.heroCard}>
                    <Text style={styles.heroLabel}>Cotisation tontine par tour</Text>
                    <Text style={styles.heroValue}>{formatXOF(circle.tontineAmount)}</Text>
                  </View>
                )}
                {!!circle.solidarityAmount && (
                  <View style={styles.heroCard}>
                    <Text style={styles.heroLabel}>Cotisation solidarité par tour</Text>
                    <Text style={styles.heroValue}>{formatXOF(circle.solidarityAmount)}</Text>
                  </View>
                )}

                <View style={styles.statGrid}>
                  <View style={styles.statTile}>
                    <View style={[styles.statTileIcon, { backgroundColor: '#EFE6F4' }]}>
                      <Users size={18} color="#7A4E9C" />
                    </View>
                    <Text style={styles.statTileValue}>{members.length}</Text>
                    <Text style={styles.statTileLabel}>Membres</Text>
                  </View>
                  <View style={styles.statTile}>
                    <View style={[styles.statTileIcon, { backgroundColor: '#EBF8FF' }]}>
                      <CalendarClock size={18} color="#3182CE" />
                    </View>
                    <Text style={styles.statTileValue}>{circle.frequency ?? '—'}</Text>
                    <Text style={styles.statTileLabel}>Fréquence</Text>
                  </View>
                  <View style={styles.statTile}>
                    <View style={[styles.statTileIcon, { backgroundColor: '#E4F0EB' }]}>
                      <RotateCw size={18} color="#0B6E4F" />
                    </View>
                    <Text style={styles.statTileValue}>
                      {cycle ? `${cycle.currentTurn} / ${cycle.totalTurns || members.length}` : '—'}
                    </Text>
                    <Text style={styles.statTileLabel}>Tour actuel</Text>
                  </View>
                </View>
              </View>
            )}

            {tab === 'members' && (
              <View style={styles.card}>
                {members.map((m, idx) => (
                  <React.Fragment key={m.userId}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.memberRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials(`${m.user.firstName} ${m.user.lastName}`)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>{m.user.firstName} {m.user.lastName}</Text>
                        <Text style={styles.memberRole}>
                          {m.role === Role.PRESIDENT ? 'Président' : m.role === Role.TREASURER ? 'Trésorier' : 'Membre'}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}

            {tab === 'requests' && (
              <View style={{ gap: 22 }}>
                <View style={{ gap: 10 }}>
                  <Text style={styles.sectionLabel}>Demande d'adhésion</Text>
                  {pendingMembership.length === 0 ? (
                    <Text style={styles.emptyText}>Aucune demande en attente.</Text>
                  ) : (
                    pendingMembership.map((r) => (
                      <View key={r.id} style={styles.requestCard}>
                        <View style={styles.requestHeaderRow}>
                          <View style={styles.avatarPurple}>
                            <Text style={styles.avatarPurpleText}>{initials(r.fullName)}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.requestName}>{r.fullName}</Text>
                            <Text style={styles.requestMeta}>{r.phoneNumber}</Text>
                          </View>
                        </View>
                        <View style={styles.docsRow}>
                          <View style={styles.docTag}>
                            <Check size={12} color="#0B6E4F" strokeWidth={3} />
                            <Text style={styles.docTagText}>CNIB fournie</Text>
                          </View>
                          {r.selfieUrl && (
                            <View style={styles.docTag}>
                              <Check size={12} color="#0B6E4F" strokeWidth={3} />
                              <Text style={styles.docTagText}>Selfie fourni</Text>
                            </View>
                          )}
                        </View>
                        {r.joiningFee > 0 && (
                          <View style={styles.feeRow}>
                            <Text style={styles.feeRowText}>Frais de rachat</Text>
                            <Text style={styles.feeRowAmount}>{formatXOF(r.joiningFee)}</Text>
                          </View>
                        )}
                        <View style={styles.actionRow}>
                          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleDecideMembership(r.id, false)}>
                            <Text style={styles.rejectBtnText}>Refuser</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.approveBtn} onPress={() => handleDecideMembership(r.id, true)}>
                            <Text style={styles.approveBtnText}>Valider l'adhésion</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>

                <View style={{ gap: 10 }}>
                  <Text style={styles.sectionLabel}>Demande d'aide — Validation du bureau</Text>
                  {bureauPending.length === 0 ? (
                    <Text style={styles.emptyText}>Aucune demande en attente du bureau.</Text>
                  ) : (
                    bureauPending.map((r) => {
                      const votesFor = r.votes.filter((v) => v.approved).length;
                      const votesAgainst = r.votes.filter((v) => !v.approved).length;
                      const bureauDecisions = getBureauDecisions(r.id);
                      const fullyApproved = isBureauFullyApproved(circle.id, r.id);
                      const iApproved = bureauDecisions[me.id] === true;
                      const isValidator = validators.includes(me.id);

                      return (
                        <View key={r.id} style={styles.requestCard}>
                          <View style={styles.requestHeaderRow}>
                            <View style={styles.avatarRed}>
                              <Text style={styles.avatarRedText}>{initials(r.requesterName)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.requestName}>{r.requesterName}</Text>
                              <Text style={styles.requestMeta}>{eventTypeLabel[r.eventType]} · {formatXOF(r.amountRequested)} demandés</Text>
                            </View>
                          </View>

                          <View style={styles.voteTallyRow}>
                            <Text style={styles.voteTallyText}>{votesFor} pour</Text>
                            <View style={styles.voteTallyDot} />
                            <Text style={styles.voteTallyText}>{votesAgainst} contre</Text>
                          </View>

                          <View style={{ gap: 6 }}>
                            {validators.map((vId) => {
                              const vMember = members.find((m) => m.userId === vId);
                              const done = bureauDecisions[vId] === true;
                              const isMe = vId === me.id;
                              return (
                                <ApprovalRow
                                  key={vId}
                                  label={isMe ? `Votre validation (${vMember?.role === Role.TREASURER ? 'Trésorier' : 'Président'})` : `${vMember?.user.firstName} ${vMember?.user.lastName}`}
                                  done={done}
                                />
                              );
                            })}
                          </View>

                          <Text style={styles.hintText}>Le décaissement nécessite l'accord de tous les validateurs désignés.</Text>

                          {isValidator && !iApproved && (
                            <TouchableOpacity style={styles.approveBureauBtn} onPress={() => { setBureauDecision(r.id, me.id, true); refresh(); }}>
                              <Text style={styles.approveBtnText}>Approuver le décaissement</Text>
                            </TouchableOpacity>
                          )}
                          {isTreasurer && (
                            <TouchableOpacity
                              style={[styles.disburseBtn, !fullyApproved && styles.disburseBtnDisabled]}
                              disabled={!fullyApproved}
                              onPress={() => { disburseSolidarityRequest(r.id); refresh(); }}
                            >
                              <Wallet size={15} color="#FFFFFF" />
                              <Text style={styles.approveBtnText}>{fullyApproved ? 'Décaisser' : 'En attente du bureau'}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            )}

            {tab === 'treasury' && (
              <View style={{ gap: 16 }}>
                <View style={styles.balanceCard}>
                  <Coins size={20} color="#074B36" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.balanceLabel}>Solde de la caisse de solidarité</Text>
                    <Text style={styles.balanceValue}>{formatXOF(totals.balance)}</Text>
                  </View>
                </View>
                <View style={styles.card}>
                  {ledger.length === 0 ? (
                    <Text style={styles.emptyText}>Aucune opération pour le moment.</Text>
                  ) : (
                    ledger.map((e, idx) => (
                      <React.Fragment key={e.id}>
                        {idx > 0 && <View style={styles.divider} />}
                        <View style={styles.memberRow}>
                          {e.type === 'CREDIT'
                            ? <TrendingUp size={16} color="#0B6E4F" />
                            : <TrendingDown size={16} color="#E53E3E" />}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.memberName} numberOfLines={1}>{e.description}</Text>
                          </View>
                          <Text style={[styles.ledgerAmount, { color: e.type === 'CREDIT' ? '#0B6E4F' : '#E53E3E' }]}>
                            {e.type === 'CREDIT' ? '+' : '−'}{formatXOF(e.amount)}
                          </Text>
                        </View>
                      </React.Fragment>
                    ))
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

function TabButton({ label, active, badge, onPress }: { label: string; active: boolean; badge?: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress}>
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
      {!!badge && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
      {active && <View style={styles.tabUnderline} />}
    </TouchableOpacity>
  );
}

function ApprovalRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.approvalRow}>
      <Text style={styles.approvalLabel}>{label}</Text>
      {done ? (
        <View style={styles.approvalDone}>
          <Check size={13} color="#0B6E4F" strokeWidth={3} />
          <Text style={styles.approvalDoneText}>Approuvée</Text>
        </View>
      ) : (
        <View style={styles.approvalPending}>
          <Clock size={13} color="#B9852A" />
          <Text style={styles.approvalPendingText}>En attente</Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  topSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingTop: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 7, marginTop: 10 },
  typeBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.14)' },
  typeBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 10.5, color: '#FFFFFF' },
  roleBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(217,164,65,0.22)' },
  roleBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 10.5, color: '#F5D38A' },
  circleName: { fontFamily: 'SoraBold', fontSize: 19, color: '#FFFFFF', marginTop: 5, marginBottom: 14 },
  tabRow: { flexDirection: 'row', gap: 18, paddingRight: 20 },
  tabBtn: { paddingBottom: 11, position: 'relative' },
  tabBtnText: { fontFamily: 'WorkSansMedium', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  tabBtnTextActive: { fontFamily: 'WorkSansSemiBold', color: '#FFFFFF' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: '#D9A441', borderRadius: 2 },
  tabBadge: { position: 'absolute', top: -4, right: -14, width: 15, height: 15, borderRadius: 8, backgroundColor: '#E53E3E', justifyContent: 'center', alignItems: 'center' },
  tabBadgeText: { fontFamily: 'WorkSansBold', fontSize: 9, color: '#FFFFFF' },
  body: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, marginTop: 14, paddingTop: 18 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  sectionLabel: { fontFamily: 'SoraBold', fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 },
  emptyText: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#94A3B8' },
  card: { borderWidth: 1.5, borderColor: '#E7EAEE', borderRadius: 16, overflow: 'hidden' },
  heroCard: { backgroundColor: '#E4F0EB', borderRadius: 18, padding: 16 },
  heroLabel: { fontFamily: 'WorkSansMedium', fontSize: 12, color: '#0B6E4F' },
  heroValue: { fontFamily: 'SoraBold', fontSize: 24, color: '#074B36', marginTop: 4 },
  statGrid: { flexDirection: 'row', gap: 10 },
  statTile: { flex: 1, borderWidth: 1.5, borderColor: '#E7EAEE', borderRadius: 16, padding: 12, alignItems: 'center', gap: 6 },
  statTileIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  statTileValue: { fontFamily: 'SoraBold', fontSize: 14, color: '#1A202C' },
  statTileLabel: { fontFamily: 'WorkSans', fontSize: 10.5, color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#F1F3F6' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F3F6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'SoraBold', fontSize: 11.5, color: '#475569' },
  memberName: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#1A202C' },
  memberRole: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8', marginTop: 1 },
  ledgerAmount: { fontFamily: 'SoraBold', fontSize: 12.5 },
  requestCard: { borderWidth: 1.5, borderColor: '#E7EAEE', borderRadius: 16, padding: 14, gap: 12 },
  requestHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarPurple: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFE6F4', justifyContent: 'center', alignItems: 'center' },
  avatarPurpleText: { fontFamily: 'SoraBold', fontSize: 13, color: '#7A4E9C' },
  avatarRed: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFECEC', justifyContent: 'center', alignItems: 'center' },
  avatarRedText: { fontFamily: 'SoraBold', fontSize: 13, color: '#E53E3E' },
  requestName: { fontFamily: 'SoraBold', fontSize: 13.5, color: '#1A202C' },
  requestMeta: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8', marginTop: 1 },
  docsRow: { flexDirection: 'row', gap: 8 },
  docTag: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#F8FAFB' },
  docTagText: { fontFamily: 'WorkSans', fontSize: 11, color: '#475569' },
  feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 11, backgroundColor: '#FBF1DD' },
  feeRowText: { fontFamily: 'WorkSans', fontSize: 12, color: '#B9852A' },
  feeRowAmount: { fontFamily: 'SoraBold', fontSize: 13, color: '#B9852A' },
  actionRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: { flex: 1, height: 40, borderRadius: 11, borderWidth: 1.5, borderColor: '#FFECEC', justifyContent: 'center', alignItems: 'center' },
  rejectBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#E53E3E' },
  approveBtn: { flex: 1, height: 40, borderRadius: 11, backgroundColor: '#0B6E4F', justifyContent: 'center', alignItems: 'center' },
  approveBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#FFFFFF' },
  voteTallyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFB', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  voteTallyText: { fontFamily: 'WorkSansSemiBold', fontSize: 11.5, color: '#64748B' },
  voteTallyDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
  approvalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  approvalLabel: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#475569' },
  approvalDone: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  approvalDoneText: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#0B6E4F' },
  approvalPending: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  approvalPendingText: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#B9852A' },
  hintText: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8', textAlign: 'center' },
  approveBureauBtn: { height: 40, borderRadius: 11, backgroundColor: '#074B36', justifyContent: 'center', alignItems: 'center' },
  disburseBtn: { flexDirection: 'row', gap: 7, height: 42, borderRadius: 12, backgroundColor: '#0B6E4F', justifyContent: 'center', alignItems: 'center' },
  disburseBtnDisabled: { backgroundColor: '#CBD5E1' },
  balanceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#E7EAEE', borderRadius: 16, padding: 14 },
  balanceLabel: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8' },
  balanceValue: { fontFamily: 'SoraBold', fontSize: 18, color: '#1A202C', marginTop: 2 },
});
