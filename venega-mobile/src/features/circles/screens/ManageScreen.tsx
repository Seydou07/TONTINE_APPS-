import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import {
  BellRing,
  Calculator,
  Check,
  CheckCircle2,
  Coins,
  Play,
  Send,
  Settings2,
  Shuffle,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
  UserX,
  Wallet,
  LogOut,
} from 'lucide-react-native';
import { colors, motion, numeric, radius, shadows, typography } from '@venega/design-tokens';
import { MembershipRequestStatus, DepartureRequestStatus, CircleType, PaymentStatus, TurnOrderMethod } from '@venega/types';
import {
  canPayout,
  canStartRotation,
  describeSchedule,
  formatDayMonth,
  formatDueIn,
  getCircle,
  getCircles,
  getContributionTimeline,
  getDepartureRequests,
  getFounderCircleIds,
  getMembershipRequests,
  getTurnOrderMethod,
  getTurnState,
  isRotationStarted,
  isRotative,
  startRotation,
} from '../circleStore';
import { formatXOF, turnOrderLabel } from '../circleLabels';
import {
  Avatar,
  Button,
  HeroHeader,
  HeroNav,
  HeroStatusBar,
  KeyFiguresCard,
  PressableScale,
  SettingsRow,
  SettingsSection,
  Sheet,
  EmptyState,
  useCascade,
} from '../../../components/ui';

const SHORT_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const shortDay = (d: Date) => `${d.getDate() === 1 ? '1er' : d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;

/** Gestion d'une tontine par son fondateur : tour en cours, membres, bureau, paramètres. */
export default function ManageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  // Relu au retour d'un écran (versement, demandes, départs…) pour afficher le tour à jour.
  const [, refresh] = useState(0);
  useFocusEffect(useCallback(() => refresh((n) => n + 1), []));
  const cascade = useCascade();
  const reduced = useReducedMotion();

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const isFounder = getFounderCircleIds().includes(circle.id);
  const tontine = isRotative(circle);
  const isNature = circle.type === CircleType.NATURE;
  const started = isRotationStarted(circle);
  const turnState = getTurnState(circle.id);
  const members = turnState.members;
  const beneficiary = turnState.beneficiary;
  const payout = canPayout(turnState);
  const timeline = getContributionTimeline(circle);
  const startCheck = canStartRotation(circle.id);
  const method = getTurnOrderMethod(circle);

  const pendingRequests = getMembershipRequests(circle.id).filter((r) => r.status === MembershipRequestStatus.PENDING);
  const pendingDepartures = getDepartureRequests(circle.id).filter((r) => r.status === DepartureRequestStatus.PENDING);
  const unpaid = turnState.unpaid;

  const [showRemind, setShowRemind] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [showStart, setShowStart] = useState(false);
  const [startError, setStartError] = useState<string | undefined>();
  const [startedOrder, setStartedOrder] = useState<string[] | null>(null);

  const openRemind = () => {
    setSelected(Object.fromEntries(unpaid.map((m) => [m.userId, true])));
    setSending(false);
    setSent(false);
    setShowRemind(true);
  };
  const selectedCount = unpaid.filter((m) => selected[m.userId]).length;
  const sendReminders = () => {
    if (selectedCount === 0) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1200);
  };

  const confirmStart = () => {
    const r = startRotation(circle.id);
    if (!r.ok) {
      setStartError(r.reason);
      return;
    }
    setStartedOrder(r.order ?? []);
    refresh((n) => n + 1);
  };

  const name = (m: { user: { firstName: string; lastName: string } }) => `${m.user.firstName} ${m.user.lastName}`;

  /** Échéance du tour en clair, sans retard inventé : « en retard depuis le 1er déc. » ou « à payer demain ». */
  const dueLine = (status: PaymentStatus) => {
    if (!timeline) return status === PaymentStatus.LATE ? 'En retard' : 'Pas encore payé';
    if (status === PaymentStatus.LATE && timeline.previous) return `En retard · échéance du ${shortDay(timeline.previous)}`;
    return `À payer ${formatDueIn(timeline.daysLeft)} (${shortDay(timeline.next)})`;
  };

  const figures = tontine
    ? [
        { label: 'Tour en cours', value: started ? `${turnState.turn} / ${members.length}` : 'Pas démarré' },
        { label: 'Cotisations reçues', value: `${turnState.paidCount} / ${members.length}` },
        {
          label: isNature ? 'Bien du tour' : 'Cagnotte du tour',
          value: isNature ? circle.rules.goalItem ?? '—' : formatXOF(circle.tontineAmount * members.length),
        },
        { label: 'Prochaine échéance', value: timeline ? shortDay(timeline.next) : '—' },
      ]
    : [
        { label: 'Membres', value: `${members.length}` },
        { label: 'Membres à jour', value: `${turnState.paidCount} / ${members.length}` },
      ];

  return (
    <View style={styles.container}>
      <HeroStatusBar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HeroHeader>
          <HeroNav title="Gérer le cercle" onBack={() => router.back()} />
          <KeyFiguresCard
            eyebrow={tontine ? describeSchedule(circle) : 'Caisse de solidarité'}
            title={circle.name}
            figures={figures}
            status={
              tontine && started && beneficiary
                ? `Bénéficiaire du tour : ${name(beneficiary)}`
                : tontine
                  ? `Ordre de passage : ${turnOrderLabel(circle.turnOrderMethod).toLowerCase()}`
                  : undefined
            }
            statusIcon={tontine && started ? Wallet : Shuffle}
          />
        </HeroHeader>

        <View style={styles.body}>
          {/* ── Démarrage du premier tour ── */}
          {tontine && !started && isFounder && (
            <Animated.View entering={cascade(0)} style={styles.startCard}>
              <View style={styles.startIcon}>
                <Play size={20} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.startTitle}>Démarrer la tontine</Text>
              <Text style={styles.startText}>
                {method === TurnOrderMethod.RANDOM_DRAW
                  ? 'Le tirage au sort de l’ordre de passage aura lieu à ce moment-là, une seule fois, devant tous les membres.'
                  : method === TurnOrderMethod.ARRIVAL_ORDER
                    ? 'L’ordre de passage suivra l’ordre d’arrivée des membres.'
                    : 'L’ordre de passage que vous avez fixé sera appliqué.'}{' '}
                Montant, calendrier et ordre seront ensuite verrouillés.
              </Text>
              {!startCheck.ok ? <Text style={styles.startBlocked}>{startCheck.reason}</Text> : null}
              <Button
                title="Démarrer le premier tour"
                icon={Play}
                disabled={!startCheck.ok}
                onPress={() => {
                  setStartError(undefined);
                  setStartedOrder(null);
                  setShowStart(true);
                }}
                style={styles.startBtn}
              />
            </Animated.View>
          )}

          {/* ── Tour en cours ── */}
          {tontine && (
            <SettingsSection title={started ? `Tour ${turnState.turn}` : 'Versements'} index={1}>
              <SettingsRow
                icon={Wallet}
                title={isNature ? 'Remettre le bien' : 'Verser la cagnotte'}
                subtitle={
                  !started
                    ? 'Possible une fois la tontine démarrée'
                    : payout.ok
                      ? `Tout est prêt pour ${beneficiary ? name(beneficiary) : 'le bénéficiaire'}`
                      : !turnState.allPaid
                        ? `En attente de ${unpaid.length} cotisation${unpaid.length > 1 ? 's' : ''}`
                        : payout.reason
                }
                badge={started && payout.ok ? 'Prêt' : undefined}
                onPress={() => router.push(`/circle/${circle.id}/payout` as any)}
              />
              <SettingsRow
                icon={BellRing}
                title="Relancer les cotisations"
                subtitle={unpaid.length > 0 ? `${unpaid.length} membre${unpaid.length > 1 ? 's n’ont' : ' n’a'} pas encore cotisé` : 'Tout le monde a cotisé'}
                onPress={openRemind}
                last
              />
            </SettingsSection>
          )}

          {/* ── Membres ── */}
          <SettingsSection title="Membres" index={2}>
            <SettingsRow
              icon={UserCheck}
              title="Demandes d’adhésion"
              subtitle="Approuver ou refuser les entrées"
              badge={pendingRequests.length > 0 ? `${pendingRequests.length}` : undefined}
              onPress={() => router.push(`/circle/${circle.id}/requests` as any)}
            />
            <SettingsRow
              icon={UserMinus}
              title="Demandes de départ"
              subtitle="Approuver un départ, recalculer les cagnottes"
              badge={pendingDepartures.length > 0 ? `${pendingDepartures.length}` : undefined}
              onPress={() => router.push(`/circle/${circle.id}/departure-requests` as any)}
            />
            <SettingsRow
              icon={Users}
              title="Remplacer un membre"
              subtitle="Rachat des tours passés ou cagnotte ajustée"
              onPress={() => router.push(`/circle/${circle.id}/replacement` as any)}
            />
            <SettingsRow
              icon={UserX}
              title="Exclure un membre"
              subtitle="Après le nombre de retards toléré"
              onPress={() => router.push(`/circle/${circle.id}/exclusion` as any)}
              last
            />
          </SettingsSection>

          {/* ── Bureau et calculs ── */}
          <SettingsSection title="Bureau" index={3}>
            <SettingsRow
              icon={UserCog}
              title="Trésorier et validateurs"
              subtitle="Qui exécute et qui approuve un décaissement"
              onPress={() => router.push(`/circle/${circle.id}/governance` as any)}
            />
            <SettingsRow
              icon={Calculator}
              title="Recalcul des cotisations"
              subtitle="Réajuster les montants après un départ"
              onPress={() => router.push(`/circle/${circle.id}/recalculate` as any)}
              last={circle.solidarityAmount <= 0}
            />
            {circle.solidarityAmount > 0 && (
              <SettingsRow
                icon={Coins}
                title="Caisse de solidarité"
                subtitle="Contributions, traces et justificatifs"
                onPress={() => router.push(`/circle/${circle.id}/solidarity` as any)}
                last
              />
            )}
          </SettingsSection>

          {/* ── Paramètres ── */}
          <SettingsSection title="Paramètres" index={4}>
            <SettingsRow
              icon={Settings2}
              title="Paramètres du cercle"
              subtitle={tontine && started ? 'Montant, calendrier et ordre verrouillés depuis le premier tour' : 'Cotisations, calendrier, ordre, règles, sécurité'}
              onPress={() => router.push(`/circle/${circle.id}/edit` as any)}
              last
            />
          </SettingsSection>

          <SettingsSection title="Zone sensible" index={5}>
            <SettingsRow
              icon={LogOut}
              tone="danger"
              title="Quitter ce cercle"
              subtitle="Règles de départ et remboursement"
              onPress={() => router.push(`/circle/${circle.id}/departure` as any)}
              last
            />
          </SettingsSection>
        </View>
      </ScrollView>

      {/* ── Relance des cotisations ── */}
      <Sheet visible={showRemind} onClose={() => setShowRemind(false)} title="Relancer les cotisations">
        {unpaid.length === 0 ? (
          <>
            <EmptyState icon={UserCheck} title="Personne à relancer" text={`Tous les membres ont cotisé pour le tour ${turnState.turn}.`} />
            <Button title="Fermer" variant="secondary" onPress={() => setShowRemind(false)} />
          </>
        ) : (
          <>
            <Text style={styles.sheetText}>
              {timeline ? `Échéance : ${describeSchedule(circle).toLowerCase()}. ` : ''}Un rappel amical, sans pénalité.
              Décochez ceux que vous ne voulez pas relancer.
            </Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {unpaid.map((m, idx) => {
                const checked = !!selected[m.userId];
                return (
                  <TouchableOpacity
                    key={m.userId}
                    style={styles.listRow}
                    activeOpacity={0.6}
                    onPress={() => setSelected((p) => ({ ...p, [m.userId]: !p[m.userId] }))}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                  >
                    <Avatar name={name(m)} uri={m.user?.avatarUrl} size={40} />
                    <View style={[styles.listBody, idx < unpaid.length - 1 && styles.listBorder]}>
                      <View style={styles.flex}>
                        <Text style={styles.listName} numberOfLines={1}>
                          {name(m)}
                        </Text>
                        <Text style={[styles.listMeta, m.paymentStatus === PaymentStatus.LATE && styles.listMetaLate]}>
                          {dueLine(m.paymentStatus)}
                        </Text>
                      </View>
                      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                        {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {!sent ? (
              <Button
                title={sending ? 'Envoi des rappels…' : `Envoyer (${selectedCount})`}
                icon={Send}
                loading={sending}
                disabled={selectedCount === 0}
                onPress={sendReminders}
              />
            ) : (
              <>
                <View style={styles.success}>
                  <CheckCircle2 size={18} color={colors.primary.DEFAULT} />
                  <Text style={styles.successText}>Rappel envoyé à {selectedCount} membre{selectedCount > 1 ? 's' : ''}.</Text>
                </View>
                <Button title="Fermer" variant="secondary" onPress={() => setShowRemind(false)} />
              </>
            )}
          </>
        )}
      </Sheet>

      {/* ── Démarrage : confirmation puis ordre obtenu ── */}
      <Sheet
        visible={showStart}
        onClose={() => setShowStart(false)}
        title={startedOrder ? (method === TurnOrderMethod.RANDOM_DRAW ? 'Résultat du tirage' : 'Ordre de passage') : 'Démarrer la tontine ?'}
      >
        {!startedOrder ? (
          <>
            <Text style={styles.sheetText}>
              {members.length} membres · {turnOrderLabel(circle.turnOrderMethod)}. {describeSchedule(circle)}.
            </Text>
            <Text style={styles.sheetText}>
              Une fois démarrée, la tontine ne peut plus changer de montant, de calendrier ni d’ordre de passage.
              {method === TurnOrderMethod.RANDOM_DRAW ? ' Le tirage est fait une seule fois et chaque membre verra le résultat.' : ''}
            </Text>
            {startError ? <Text style={styles.error}>{startError}</Text> : null}
            <Button title={method === TurnOrderMethod.RANDOM_DRAW ? 'Lancer le tirage et démarrer' : 'Démarrer'} onPress={confirmStart} />
            <Button title="Annuler" variant="ghost" onPress={() => setShowStart(false)} />
          </>
        ) : (
          <>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {startedOrder.map((userId, i) => {
                const m = getTurnState(circle.id).members.find((x) => x.userId === userId);
                if (!m) return null;
                return (
                  <Animated.View
                    key={userId}
                    entering={reduced ? undefined : FadeIn.duration(motion.base).delay(i * 120)}
                    style={styles.listRow}
                  >
                    <View style={styles.rank}>
                      <Text style={styles.rankText}>{i + 1}</Text>
                    </View>
                    <View style={[styles.listBody, i < startedOrder.length - 1 && styles.listBorder]}>
                      <Text style={[styles.listName, styles.flex]} numberOfLines={1}>
                        {name(m)}
                      </Text>
                      {i === 0 ? <Text style={styles.firstTag}>Tour 1</Text> : null}
                    </View>
                  </Animated.View>
                );
              })}
            </ScrollView>
            <Text style={styles.sheetHint}>
              {circle.turnOrderDrawnAt
                ? `Tirage effectué le ${formatDayMonth(new Date(circle.turnOrderDrawnAt))}, visible par tous les membres.`
                : 'Visible par tous les membres.'}
            </Text>
            <PressableScale onPress={() => setShowStart(false)} style={styles.doneBtn} accessibilityRole="button">
              <Text style={styles.doneText}>C’est parti</Text>
            </PressableScale>
          </>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },
  scroll: { paddingBottom: 48 },
  body: { paddingHorizontal: 16 },

  startCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.primary.soft,
    ...shadows.soft,
  },
  startIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  startTitle: { ...typography.headline, color: colors.ink },
  startText: { ...typography.callout, color: colors.muted, marginTop: 4 },
  startBlocked: { ...typography.footnote, fontWeight: '600', color: colors.accent.dark, marginTop: 12 },
  startBtn: { marginTop: 16 },

  sheetText: { ...typography.callout, color: colors.muted, marginBottom: 12 },
  sheetHint: { ...typography.footnote, color: colors.muted, marginBottom: 16 },
  error: { ...typography.footnote, color: colors.danger.DEFAULT, marginBottom: 12 },
  list: {
    maxHeight: 300,
    marginBottom: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 14 },
  listBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingRight: 14 },
  listBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  listName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  listMeta: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  listMetaLate: { color: colors.accent.dark },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { ...typography.callout, ...numeric, fontWeight: '700', color: colors.primary.dark },
  firstTag: {
    ...typography.caption,
    color: colors.accent.dark,
    backgroundColor: colors.accent.tint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  doneBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: { ...typography.bodyStrong, fontSize: 16, color: '#FFFFFF' },

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
});
