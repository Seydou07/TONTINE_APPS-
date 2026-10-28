import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Wallet,
  BellRing,
  UserCheck,
  Users,
  UserX,
  UserMinus,
  Calculator,
  Settings2,
  ShieldCheck,
  LogOut,
  Check,
  Send,
  CheckCircle2,
  Coins,
  UserCog,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import {
  getCircles,
  getCircle,
  getActiveCycle,
  getCycles,
  getMembershipRequests,
  getDepartureRequests,
} from '../circleStore';
import {
  mockMemberships,
  MembershipRequestStatus,
  DepartureRequestStatus,
  CircleType,
  RefundRule,
  ReplacementRule,
  UnlockRule,
  PaymentStatus,
} from '@venega/types';
import { Avatar, Button, IconButton, ListGroup, ListRow, Sheet } from '../../../components/ui';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

export default function ManageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circle.id);

  const orderedMembers = [...memberships].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  const pendingRequests = getMembershipRequests(circle.id).filter(
    (r) => r.status === MembershipRequestStatus.PENDING
  );
  const pendingDepartures = getDepartureRequests(circle.id).filter(
    (r) => r.status === DepartureRequestStatus.PENDING
  );
  const paidCount = orderedMembers.filter((m) => m.paymentStatus === 'PAID').length;
  const unpaidCount = Math.max(orderedMembers.length - paidCount, 0);

  const lateMembers = orderedMembers.filter((m) => m.paymentStatus !== PaymentStatus.PAID);

  const delayDaysOf = (m: (typeof orderedMembers)[number], idx: number) =>
    m.paymentStatus === PaymentStatus.LATE ? 5 + idx : 2 + idx;

  const rules = circle.rules;

  const refundLabel =
    rules?.refundRule === RefundRule.IMMEDIATE
      ? 'Remboursement immédiat'
      : rules?.refundRule === RefundRule.AT_CYCLE_END
      ? 'Attente de la fin du cycle'
      : '—';

  const replacementLabel =
    rules?.replacementRule === ReplacementRule.PAY_PAST_TURNS
      ? 'Le nouveau paie les tours passés'
      : rules?.replacementRule === ReplacementRule.REDUCED_POT
      ? 'Prise réduite des tours manqués'
      : rules?.replacementRule === ReplacementRule.NONE
      ? 'Réajustement sans remplacement'
      : '—';

  const unlockLabel =
    rules?.unlockRule === UnlockRule.ALL_APPROVERS
      ? 'Tous les approbateurs doivent valider'
      : rules?.unlockRule === UnlockRule.MAJORITY
      ? 'Majorité des approbateurs'
      : '—';

  const isAidAppeal = circle.type === CircleType.AID_APPEAL;
  const isNature = circle.type === CircleType.NATURE;

  const openPayout = () => router.push(`/circle/${circle.id}/payout` as any);

  const [showRemindModal, setShowRemindModal] = useState(false);
  const [selectedLate, setSelectedLate] = useState<Record<string, boolean>>({});
  const [remindSending, setRemindSending] = useState(false);
  const [remindSent, setRemindSent] = useState(false);

  const openRemind = () => {
    const init: Record<string, boolean> = {};
    lateMembers.forEach((m) => {
      init[m.userId] = true;
    });
    setSelectedLate(init);
    setRemindSending(false);
    setRemindSent(false);
    setShowRemindModal(true);
  };

  const selectedRemindCount = lateMembers.filter((m) => selectedLate[m.userId]).length;

  const toggleLateMember = (userId: string) => {
    setSelectedLate((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleSendReminders = () => {
    if (selectedRemindCount === 0) return;
    setRemindSending(true);
    setTimeout(() => {
      setRemindSending(false);
      setRemindSent(true);
    }, 1500);
  };

  const pendingLabel = (n: number) => (n > 0 ? `${n} en attente` : undefined);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* En-tête */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Gérer le cercle</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Résumé du cercle */}
          <View style={styles.summary}>
            <View style={styles.summaryText}>
              <Text style={styles.summaryName} numberOfLines={2}>
                {circle.name}
              </Text>
              <Text style={styles.summaryMeta}>
                {isAidAppeal
                  ? `Objectif ${formatXOF(circle.rules?.goalAmount ?? 0)}`
                  : isNature
                  ? `Objectif : ${circle.rules?.goalItem ?? '—'}`
                  : `Cotisation ${formatXOF(circle.tontineAmount || circle.solidarityAmount)}`}
                {' · '}
                {orderedMembers.length} membre(s)
              </Text>
            </View>
            {beneficiary?.user ? (
              <Avatar
                name={`${beneficiary.user.firstName} ${beneficiary.user.lastName}`}
                uri={beneficiary.user.avatarUrl}
                size={40}
                highlighted
              />
            ) : null}
          </View>

          <ListGroup title="Tour et versements" style={styles.group}>
            <ListRow
              icon={Wallet}
              tone="primary"
              title={isNature ? 'Remettre le bien' : 'Verser la cagnotte'}
              subtitle={`Bénéficiaire : ${beneficiary?.user?.firstName ?? '—'} ${beneficiary?.user?.lastName ?? ''} (tour ${cycle?.currentTurn ?? 1})`}
              onPress={openPayout}
            />
            <ListRow
              icon={BellRing}
              tone="primary"
              title="Relancer les cotisations"
              subtitle={
                unpaidCount > 0 ? `${unpaidCount} membre(s) n'ont pas encore cotisé` : 'Tous les membres ont cotisé'
              }
              onPress={openRemind}
              last
            />
          </ListGroup>

          <ListGroup title="Membres" style={styles.group}>
            <ListRow
              icon={UserCheck}
              title="Demandes d'adhésion"
              subtitle="Approuver ou refuser les entrées"
              value={pendingLabel(pendingRequests.length)}
              valueTone="success"
              onPress={() => router.push(`/circle/${circle.id}/requests` as any)}
            />
            <ListRow
              icon={UserMinus}
              title="Demandes de départ"
              subtitle="Approuver un départ, recalculer les cagnottes"
              value={pendingLabel(pendingDepartures.length)}
              valueTone="success"
              onPress={() => router.push(`/circle/${circle.id}/departure-requests` as any)}
            />
            <ListRow
              icon={Users}
              title="Remplacer un membre"
              subtitle="Rachat des tours passés ou prise réduite"
              onPress={() => router.push(`/circle/${circle.id}/replacement` as any)}
            />
            <ListRow
              icon={UserX}
              title="Exclure un membre"
              subtitle="Retirer un membre du cercle"
              onPress={() => router.push(`/circle/${circle.id}/exclusion` as any)}
              last
            />
          </ListGroup>

          <ListGroup title="Bureau et gouvernance" style={styles.group}>
            <ListRow
              icon={UserCog}
              title="Trésorier et validateurs"
              subtitle="Nommer le trésorier, désigner qui approuve un décaissement"
              onPress={() => router.push(`/circle/${circle.id}/governance` as any)}
              last
            />
          </ListGroup>

          <ListGroup title="Calculs" style={styles.group}>
            <ListRow
              icon={Calculator}
              title="Recalcul des cotisations"
              subtitle="Réajuster les montants après un départ"
              onPress={() => router.push(`/circle/${circle.id}/recalculate` as any)}
              last
            />
          </ListGroup>

          {circle.solidarityAmount > 0 && (
            <ListGroup title="Solidarité" style={styles.group}>
              <ListRow
                icon={Coins}
                title="Caisse de solidarité"
                subtitle="Contributions par membre, traces et justificatifs"
                onPress={() => router.push(`/circle/${circle.id}/solidarity` as any)}
                last
              />
            </ListGroup>
          )}

          <ListGroup title="Règles du cercle" style={styles.group}>
            <ListRow
              icon={Settings2}
              title="Modifier le cercle"
              subtitle="Nom, conditions, règles de remplacement, adhésion"
              onPress={() => router.push(`/circle/${circle.id}/edit` as any)}
              last
            />
          </ListGroup>

          <View style={styles.rulesCard}>
            <View style={styles.rulesHeader}>
              <ShieldCheck size={18} color={colors.primary.DEFAULT} strokeWidth={1.8} />
              <Text style={styles.rulesTitle}>Paramètres de gestion</Text>
            </View>
            <RuleRow label="Remboursement au départ" value={refundLabel} />
            <RuleRow label="Remplacement d'un membre" value={replacementLabel} />
            <RuleRow label="Déblocage caisse solidarité" value={unlockLabel} />
            <RuleRow label="Approbateurs requis" value={`${rules?.approversRequired ?? 0} approbateur(s)`} />
            <RuleRow
              label="Réserve de sécurité"
              value={`${rules?.reservePercent ?? 0} %`}
              last={!isAidAppeal}
            />
            {isAidAppeal && (
              <RuleRow
                label="Contributions publiques"
                value={rules?.allowPublicContributions ? 'Ouvert sans adhésion' : 'Membres uniquement'}
                last={!rules?.minContribution}
              />
            )}
            {isAidAppeal && rules?.minContribution ? (
              <RuleRow label="Montant minimum" value={formatXOF(rules.minContribution)} last />
            ) : null}
          </View>

          <ListGroup style={styles.group}>
            <ListRow
              icon={LogOut}
              tone="danger"
              title="Quitter ce cercle"
              subtitle="Règles de départ et remboursement"
              onPress={() => router.push(`/circle/${circle.id}/departure` as any)}
              last
            />
          </ListGroup>
        </ScrollView>
      </SafeAreaView>

      {/* Relance des cotisations */}
      <Sheet visible={showRemindModal} onClose={() => setShowRemindModal(false)} title="Relancer les cotisations">
        {lateMembers.length === 0 ? (
          <>
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <UserCheck size={24} color={colors.primary.DEFAULT} strokeWidth={1.8} />
              </View>
              <Text style={styles.emptyTitle}>Aucun membre en retard</Text>
              <Text style={styles.emptyText}>Tous les membres ont cotisé pour le tour {cycle?.currentTurn ?? 1}.</Text>
            </View>
            <Button title="Fermer" variant="secondary" onPress={() => setShowRemindModal(false)} />
          </>
        ) : (
          <>
            <Text style={styles.sheetText}>
              {lateMembers.length} membre(s) en retard pour le tour {cycle?.currentTurn ?? 1}. Décochez ceux que vous
              ne voulez pas relancer.
            </Text>

            <ScrollView style={styles.lateList} showsVerticalScrollIndicator={false}>
              {lateMembers.map((m, idx) => {
                const isChecked = !!selectedLate[m.userId];
                const last = idx === lateMembers.length - 1;
                return (
                  <TouchableOpacity
                    key={m.userId}
                    style={styles.lateRow}
                    activeOpacity={0.6}
                    onPress={() => toggleLateMember(m.userId)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                  >
                    <Avatar name={`${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`} uri={m.user?.avatarUrl} size={40} />
                    <View style={[styles.lateBody, !last && styles.lateBorder]}>
                      <View style={styles.lateInfo}>
                        <Text style={styles.lateName} numberOfLines={1}>
                          {m.user?.firstName} {m.user?.lastName}
                        </Text>
                        <Text style={styles.lateMeta}>
                          {delayDaysOf(m, idx)} jour(s) de retard · {m.user?.phoneNumber}
                        </Text>
                      </View>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {!remindSent ? (
              <Button
                title={remindSending ? 'Envoi des rappels…' : `Envoyer (${selectedRemindCount})`}
                icon={Send}
                loading={remindSending}
                disabled={selectedRemindCount === 0}
                onPress={handleSendReminders}
              />
            ) : (
              <>
                <View style={styles.success}>
                  <CheckCircle2 size={18} color={colors.primary.DEFAULT} />
                  <Text style={styles.successText}>
                    Rappel envoyé à {selectedRemindCount} membre(s). Les notifications sont parties.
                  </Text>
                </View>
                <Button title="Fermer" variant="secondary" onPress={() => setShowRemindModal(false)} />
              </>
            )}
          </>
        )}
      </Sheet>
    </View>
  );
}

function RuleRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.ruleRow, !last && styles.ruleBorder]}>
      <Text style={styles.ruleLabel}>{label}</Text>
      <Text style={styles.ruleValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSpacer: { width: 40 },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  group: { marginTop: 20 },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  summaryText: { flex: 1 },
  summaryName: { ...typography.headline, color: colors.ink },
  summaryMeta: { ...typography.footnote, color: colors.muted, marginTop: 4 },

  rulesCard: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rulesTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 12 },
  ruleBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  ruleLabel: { flex: 1, ...typography.footnote, color: colors.muted },
  ruleValue: { flexShrink: 1, ...typography.footnote, fontWeight: '600', color: colors.ink, textAlign: 'right' },

  /* ── Feuille de relance ── */
  sheetText: { ...typography.callout, color: colors.muted, marginBottom: 12 },
  lateList: {
    maxHeight: 280,
    marginBottom: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  lateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 14 },
  lateBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingRight: 14,
  },
  lateBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  lateInfo: { flex: 1 },
  lateName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  lateMeta: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },

  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginBottom: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary.tint,
  },
  successText: { flex: 1, ...typography.footnote, fontWeight: '500', color: colors.primary.dark },

  empty: { alignItems: 'center', paddingVertical: 16, marginBottom: 12 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: { ...typography.headline, color: colors.ink },
  emptyText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 4 },
});
