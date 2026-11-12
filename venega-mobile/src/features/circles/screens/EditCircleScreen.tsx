import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  AlarmClock,
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  Coins,
  FileText,
  Hash,
  IdCard,
  KeyRound,
  Lock,
  LogOut,
  Package,
  Percent,
  Repeat,
  Shuffle,
  ShieldCheck,
  Tag,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
  Wallet,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { CircleType, Frequency, TurnOrderMethod, UnlockRule } from '@venega/types';
import type { Circle, KycRequirement, ReplacementRule } from '@venega/types';
import {
  describeApprovalRule,
  describeSchedule,
  formatDayMonth,
  getActiveCycle,
  getApprovalProgress,
  getCircle,
  getCircleMembers,
  getFounderCircleIds,
  getNextContribution,
  getSolidarityTotals,
  getTurnState,
  isRotationStarted,
  isRotative,
  isSettingLocked,
  parseDay,
  setApprovalRule,
  toDayString,
  updateCircleSettings,
  WEEKDAY_NAMES,
} from '../circleStore';
import {
  EXCLUSION_OPTIONS,
  FREQUENCY_OPTIONS,
  KYC_OPTIONS,
  LEAVING_OPTIONS,
  TURN_ORDER_OPTIONS,
  UNLOCK_OPTIONS,
  circleTypeLabel,
  formatXOF,
  frequencyLabel,
  kycLabel,
  leavingLabel,
  toNumber,
  turnOrderLabel,
} from '../circleLabels';
import {
  Button,
  Chip,
  DatePickerSheet,
  HeroHeader,
  HeroNav,
  HeroStatusBar,
  KeyFiguresCard,
  MonthDayPicker,
  NumberStepper,
  OptionCard,
  Segmented,
  SettingsRow,
  SettingsSection,
  Sheet,
  TextField,
  Toast,
  Toggle,
  WeekdayPicker,
  useToast,
} from '../../../components/ui';

type EditKey =
  | 'name'
  | 'amount'
  | 'fee'
  | 'frequency'
  | 'day'
  | 'start'
  | 'maxMembers'
  | 'order'
  | 'perTurn'
  | 'exclusion'
  | 'leaving'
  | 'conditions'
  | 'kyc'
  | 'approvers'
  | 'invite'
  | 'locked';

const SHORT_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const shortDay = (d: Date) => `${d.getDate() === 1 ? '1er' : d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;

/** Jour de cotisation en clair (« Samedi », « Le 5 »), ou « À choisir ». */
function dayValue(c: Pick<Circle, 'frequency' | 'contributionWeekday' | 'contributionMonthDay'>): string {
  if (c.frequency === Frequency.DAILY) return 'Tous les jours';
  if (c.frequency === Frequency.MONTHLY) {
    const d = c.contributionMonthDay;
    return d ? `Le ${d === 1 ? '1er' : d}` : 'À choisir';
  }
  const w = c.contributionWeekday;
  return w ? WEEKDAY_NAMES[w - 1]!.replace(/^./, (x) => x.toUpperCase()) : 'À choisir';
}

/**
 * Paramètres d'un cercle : réglages regroupés par thème, chacun modifiable dans sa propre feuille.
 * Une tontine verrouille montant, calendrier et ordre de passage dès le premier tour.
 */
export default function EditCircleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const [, setVersion] = useState(0);
  const refresh = () => setVersion((n) => n + 1);
  const toast = useToast();

  const [editing, setEditing] = useState<EditKey | null>(null);
  const [lockedLabel, setLockedLabel] = useState('');
  /** Verrou « choisi à la création » (type, bien) ou « depuis le premier tour ». */
  const [lockedAtCreation, setLockedAtCreation] = useState(false);
  const [text, setText] = useState('');
  const [num, setNum] = useState(0);
  const [choice, setChoice] = useState<string>('');
  const [unlock, setUnlock] = useState<UnlockRule>(UnlockRule.ALL_APPROVERS);
  const [error, setError] = useState<string | undefined>();

  const circle = getCircle(circleId);
  if (!circle) return null;

  const isFounder = getFounderCircleIds().includes(circle.id);
  const tontine = isRotative(circle);
  const isNature = circle.type === CircleType.NATURE;
  const started = isRotationStarted(circle);
  const lockedKey = (k: keyof Circle) => isSettingLocked(circle, k);
  const members = getCircleMembers(circle.id);
  const memberCount = members.length || circle.memberCount;
  const next = getNextContribution(circle);
  const cycle = getActiveCycle(circle);
  const approval = getApprovalProgress(circle.id);
  const startedOn = parseDay(circle.rotationStartedAt ?? cycle?.startDate);

  const close = () => {
    setEditing(null);
    setError(undefined);
  };

  /** Ouvre l'éditeur d'un réglage, ou explique pourquoi il est verrouillé. */
  const open = (key: EditKey, locked = false, label = '', atCreation = false) => {
    if (!isFounder) return;
    if (locked) {
      setLockedLabel(label);
      setLockedAtCreation(atCreation);
      setEditing('locked');
      return;
    }
    setError(undefined);
    switch (key) {
      case 'name':
        setText(circle.name);
        break;
      case 'amount':
        setText(String(tontine ? circle.tontineAmount : circle.solidarityAmount));
        break;
      case 'fee':
        setText(String(circle.managementFee ?? 0));
        break;
      case 'frequency':
        setChoice(circle.frequency);
        break;
      case 'day':
        setNum(circle.frequency === Frequency.MONTHLY ? circle.contributionMonthDay ?? 0 : circle.contributionWeekday ?? 0);
        break;
      case 'maxMembers':
        setNum(circle.maxMembers ?? Math.max(memberCount, 10));
        break;
      case 'order':
        setChoice(circle.turnOrderMethod ?? TurnOrderMethod.FIXED_BY_FOUNDER);
        break;
      case 'perTurn':
        setNum(circle.beneficiariesPerTurn || 1);
        break;
      case 'exclusion':
        setNum(circle.exclusionThreshold || 3);
        break;
      case 'leaving':
        setChoice(circle.rules.replacementRule);
        break;
      case 'conditions':
        setText(circle.conditions ?? '');
        break;
      case 'kyc':
        setChoice(circle.rules.kycRequirement);
        break;
      case 'approvers':
        setNum(Math.max(circle.rules.approversRequired || approval.designated || 2, 1));
        setUnlock(circle.rules.unlockRule ?? UnlockRule.ALL_APPROVERS);
        break;
    }
    setEditing(key);
  };

  const save = (patch: Partial<Circle>, message = 'Réglage enregistré') => {
    const result = updateCircleSettings(circle.id, patch);
    if (!result.ok) {
      setError('Ce réglage est verrouillé depuis le démarrage du premier tour.');
      return;
    }
    close();
    refresh();
    toast.show(message);
  };

  const saveApprovers = () => {
    const r = setApprovalRule(circle.id, num, num === 1 ? UnlockRule.ALL_APPROVERS : unlock);
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    close();
    refresh();
    toast.show('Règle de validation enregistrée');
  };

  const regenerateCode = () => {
    const prefix = (circle.name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    save({ inviteCode: prefix + Math.floor(1000 + Math.random() * 9000).toString() }, 'Nouveau code créé');
  };

  // ── Récapitulatif ──
  const turnState = tontine ? getTurnState(circle.id) : undefined;
  const figures = tontine
    ? [
        { label: 'Cotisation par tour', value: formatXOF(circle.tontineAmount) },
        {
          label: isNature ? 'Bien remis' : 'Cagnotte par tour',
          value: isNature ? circle.rules.goalItem ?? '—' : formatXOF(circle.tontineAmount * memberCount),
        },
        { label: 'Membres', value: circle.maxMembers ? `${memberCount} / ${circle.maxMembers}` : `${memberCount}` },
        { label: 'Prochaine échéance', value: next ? shortDay(next.date) : '—' },
      ]
    : [
        { label: 'Cotisation habituelle', value: formatXOF(circle.solidarityAmount) },
        { label: 'Solde de la caisse', value: formatXOF(getSolidarityTotals(circle.id).balance) },
        { label: 'Membres', value: circle.maxMembers ? `${memberCount} / ${circle.maxMembers}` : `${memberCount}` },
        { label: 'Validateurs', value: `${approval.designated} / ${approval.required}` },
      ];
  const status = tontine
    ? started
      ? `Tour ${turnState?.turn ?? 1} sur ${memberCount} en cours · montant, calendrier et ordre verrouillés`
      : 'Pas encore démarrée · tout reste modifiable jusqu’au premier tour'
    : describeApprovalRule(approval.required || 1, circle.rules.unlockRule);

  const lockNote = started
    ? `Verrouillé depuis le premier tour${startedOn ? ` (${formatDayMonth(startedOn)})` : ''}.`
    : 'Modifiable avant le premier tour, verrouillé ensuite.';

  let index = 0;
  const nextIndex = () => index++;

  return (
    <View style={styles.container}>
      <HeroStatusBar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HeroHeader>
          <HeroNav title="Paramètres du cercle" onBack={() => router.back()} />
          <KeyFiguresCard
            eyebrow={circleTypeLabel(circle)}
            title={circle.name}
            figures={figures}
            status={status}
            statusIcon={tontine && started ? Lock : ShieldCheck}
          />
        </HeroHeader>

        <View style={styles.body}>
          {!isFounder && (
            <Text style={styles.readOnly}>Seul le fondateur peut modifier ces réglages. Vous les consultez en lecture.</Text>
          )}

          {/* ── Cercle ── */}
          <SettingsSection title="Cercle" index={nextIndex()}>
            <SettingsRow icon={Tag} title="Nom" subtitle={circle.name} onPress={isFounder ? () => open('name') : undefined} />
            <SettingsRow
              icon={BadgeCheck}
              tone="neutral"
              title="Type"
              subtitle="Choisi à la création"
              value={circleTypeLabel(circle)}
              locked
              onPress={isFounder ? () => open('name', true, 'Le type du cercle', true) : undefined}
              last={!isNature}
            />
            {isNature && (
              <SettingsRow
                icon={Package}
                title="Bien remis à chaque tour"
                value={circle.rules.goalItem ?? '—'}
                locked
                onPress={isFounder ? () => open('name', true, 'Le bien remis', true) : undefined}
                last
              />
            )}
          </SettingsSection>

          {/* ── Cotisations ── */}
          <SettingsSection
            title="Cotisations"
            index={nextIndex()}
            footer={tontine ? lockNote : 'La cotisation reste volontaire : aucune pénalité en cas d’oubli.'}
          >
            <SettingsRow
              icon={Coins}
              title={tontine ? 'Montant par tour' : 'Cotisation habituelle'}
              subtitle={tontine ? 'Versé par chaque membre' : 'Versement volontaire'}
              value={formatXOF(tontine ? circle.tontineAmount : circle.solidarityAmount)}
              locked={lockedKey('tontineAmount')}
              onPress={isFounder ? () => open('amount', lockedKey('tontineAmount'), 'Le montant') : undefined}
            />
            {tontine && (
              <SettingsRow
                icon={Percent}
                title="Frais de gestion"
                subtitle="Votre commission, par membre et par tour"
                value={circle.managementFee ? formatXOF(circle.managementFee) : 'Aucun'}
                locked={lockedKey('managementFee')}
                onPress={isFounder ? () => open('fee', lockedKey('managementFee'), 'Les frais de gestion') : undefined}
              />
            )}
            <SettingsRow
              icon={Repeat}
              title="Fréquence"
              value={frequencyLabel(circle.frequency)}
              locked={lockedKey('frequency')}
              onPress={isFounder ? () => open('frequency', lockedKey('frequency'), 'La fréquence') : undefined}
            />
            {circle.frequency !== Frequency.DAILY && (
              <SettingsRow
                icon={CalendarDays}
                title="Jour de cotisation"
                subtitle={describeSchedule(circle)}
                value={dayValue(circle)}
                locked={lockedKey('contributionWeekday')}
                onPress={isFounder ? () => open('day', lockedKey('contributionWeekday'), 'Le jour de cotisation') : undefined}
              />
            )}
            <SettingsRow
              icon={CalendarRange}
              title="Date de début"
              subtitle={next ? `Prochaine échéance : ${formatDayMonth(next.date)}` : undefined}
              value={circle.startDate ? shortDay(parseDay(circle.startDate)!) : 'À choisir'}
              locked={lockedKey('startDate')}
              onPress={isFounder ? () => open('start', lockedKey('startDate'), 'La date de début') : undefined}
            />
            <SettingsRow
              icon={Users}
              title="Nombre de membres"
              subtitle="Vous compris"
              value={`${circle.maxMembers ?? memberCount}`}
              locked={lockedKey('maxMembers')}
              onPress={isFounder ? () => open('maxMembers', lockedKey('maxMembers'), 'Le nombre de membres') : undefined}
              last
            />
          </SettingsSection>

          {/* ── Ordre de passage (tontine) ── */}
          {tontine && (
            <SettingsSection
              title="Ordre de passage"
              index={nextIndex()}
              footer={
                circle.turnOrderDrawnAt
                  ? `Tirage au sort effectué le ${formatDayMonth(parseDay(circle.turnOrderDrawnAt)!)}, visible par tous les membres.`
                  : circle.turnOrderMethod === TurnOrderMethod.RANDOM_DRAW
                    ? 'Le tirage aura lieu une seule fois, au démarrage du premier tour.'
                    : undefined
              }
            >
              <SettingsRow
                icon={Shuffle}
                title="Méthode"
                value={turnOrderLabel(circle.turnOrderMethod)}
                locked={lockedKey('turnOrderMethod')}
                onPress={isFounder ? () => open('order', lockedKey('turnOrderMethod'), 'La méthode d’ordre de passage') : undefined}
              />
              <SettingsRow
                icon={UserCheck}
                title="Bénéficiaires par tour"
                value={`${circle.beneficiariesPerTurn || 1}`}
                locked={lockedKey('beneficiariesPerTurn')}
                onPress={isFounder ? () => open('perTurn', lockedKey('beneficiariesPerTurn'), 'Le nombre de bénéficiaires') : undefined}
                last
              />
            </SettingsSection>
          )}

          {/* ── Règles ── */}
          <SettingsSection title="Règles" index={nextIndex()}>
            {tontine && (
              <SettingsRow
                icon={Wallet}
                title="Payer le tour suivant d’abord"
                subtitle="Le bénéficiaire paie sa prochaine cotisation avant de recevoir"
                locked={lockedKey('nextPaymentRequired')}
                onPress={
                  isFounder && lockedKey('nextPaymentRequired')
                    ? () => open('name', true, 'La règle du tour suivant')
                    : undefined
                }
                accessory={
                  lockedKey('nextPaymentRequired') ? (
                    <Text style={styles.lockedValue}>{circle.nextPaymentRequired ? 'Oui' : 'Non'}</Text>
                  ) : (
                    <Toggle
                      value={circle.nextPaymentRequired}
                      onValueChange={(v) => isFounder && save({ nextPaymentRequired: v }, v ? 'Règle activée' : 'Règle désactivée')}
                    />
                  )
                }
              />
            )}
            {tontine && (
              <SettingsRow
                icon={ShieldCheck}
                title="Dépôt de garantie"
                subtitle="Une cotisation déposée par qui rejoint en cours de route"
                accessory={
                  <Toggle
                    value={circle.depositRequired}
                    onValueChange={(v) => isFounder && save({ depositRequired: v })}
                  />
                }
              />
            )}
            {tontine && (
              <SettingsRow
                icon={AlarmClock}
                title="Retards tolérés"
                subtitle="Au-delà, le fondateur peut proposer l’exclusion"
                value={`${circle.exclusionThreshold || 3}`}
                onPress={isFounder ? () => open('exclusion') : undefined}
              />
            )}
            {tontine && (
              <SettingsRow
                icon={UserMinus}
                title="Départ d’un membre"
                value={leavingLabel(circle.rules.replacementRule)}
                onPress={isFounder ? () => open('leaving') : undefined}
              />
            )}
            <SettingsRow
              icon={FileText}
              title="Règlement du cercle"
              subtitle={circle.conditions?.trim() ? circle.conditions.trim() : 'Aucun texte pour le moment'}
              onPress={isFounder ? () => open('conditions') : undefined}
              last
            />
          </SettingsSection>

          {/* ── Validation des aides (solidarité) ── */}
          {!tontine && (
            <SettingsSection
              title="Validation des aides"
              index={nextIndex()}
              footer="L’argent reste bloqué tant que la règle n’est pas respectée. Le Trésorier verse ensuite l’aide directement sur le numéro du membre."
            >
              <SettingsRow
                icon={UserCheck}
                title="Règle de validation"
                subtitle={describeApprovalRule(approval.required || 1, circle.rules.unlockRule)}
                onPress={isFounder ? () => open('approvers') : undefined}
              />
              <SettingsRow
                icon={UserCog}
                title="Trésorier et validateurs"
                subtitle={approval.missing > 0 ? `Encore ${approval.missing} à désigner` : 'Tous désignés'}
                badge={approval.missing > 0 ? `${approval.missing}` : undefined}
                onPress={() => router.push(`/circle/${circle.id}/governance` as any)}
                last
              />
            </SettingsSection>
          )}

          {/* ── Sécurité ── */}
          <SettingsSection title="Sécurité" index={nextIndex()}>
            <SettingsRow
              icon={IdCard}
              title="Documents demandés"
              subtitle="Pour chaque nouvelle adhésion"
              value={kycLabel(circle.rules.kycRequirement)}
              onPress={isFounder ? () => open('kyc') : undefined}
            />
            <SettingsRow
              icon={Hash}
              title="Code d’invitation"
              value={circle.inviteCode}
              onPress={isFounder ? () => open('invite') : undefined}
              last
            />
          </SettingsSection>

          {/* ── Membres ── */}
          <SettingsSection title="Membres" index={nextIndex()}>
            <SettingsRow
              icon={Users}
              title="Demandes d’adhésion"
              onPress={() => router.push(`/circle/${circle.id}/requests` as any)}
            />
            {tontine ? (
              <SettingsRow
                icon={UserCog}
                title="Gérer les membres"
                subtitle="Versement, relances, départs"
                onPress={() => router.push(`/circle/${circle.id}/manage` as any)}
                last
              />
            ) : (
              <SettingsRow
                icon={UserCog}
                title="Liste des membres"
                onPress={() => router.push(`/circle/${circle.id}/solidarity-members` as any)}
                last
              />
            )}
          </SettingsSection>

          {/* ── Zone sensible ── */}
          <SettingsSection title="Zone sensible" index={nextIndex()}>
            {isFounder && (
              <SettingsRow
                icon={KeyRound}
                tone="accent"
                title="Changer le code d’invitation"
                subtitle="L’ancien code ne fonctionnera plus"
                onPress={() => open('invite')}
              />
            )}
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

      {/* ── Feuilles d'édition ── */}
      <Sheet
        visible={!!editing && editing !== 'start'}
        onClose={close}
        title={editing ? SHEET_TITLES[editing] : undefined}
      >
        {editing === 'locked' && (
          <>
            <View style={styles.lockHero}>
              <View style={styles.lockIcon}>
                <Lock size={22} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.sheetText}>
                {lockedLabel} ne peut plus changer.{' '}
                {!lockedAtCreation
                  ? 'Il était modifiable avant le premier tour : le changer maintenant serait injuste pour les membres qui ont déjà reçu leur cagnotte.'
                  : 'Il est fixé à la création du cercle.'}
              </Text>
            </View>
            <Button title="Compris" variant="secondary" onPress={close} />
          </>
        )}

        {editing === 'name' && (
          <>
            <TextField label="Nom du cercle" value={text} onChangeText={setText} maxLength={48} error={error} autoFocus />
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              disabled={text.trim().length < 3}
              onPress={() => save({ name: text.trim() })}
            />
          </>
        )}

        {(editing === 'amount' || editing === 'fee') && (
          <>
            <TextField
              label={editing === 'fee' ? 'Frais de gestion par membre et par tour' : tontine ? 'Montant par tour' : 'Cotisation habituelle'}
              value={text}
              onChangeText={(v) => setText(v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              suffix="F CFA"
              error={error}
              hint={editing === 'fee' ? 'Laissez 0 pour ne prendre aucun frais.' : undefined}
              autoFocus
            />
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              disabled={editing === 'amount' && toNumber(text) <= 0}
              onPress={() =>
                save(
                  editing === 'fee'
                    ? { managementFee: toNumber(text) }
                    : tontine
                      ? { tontineAmount: toNumber(text) }
                      : { solidarityAmount: toNumber(text) },
                )
              }
            />
          </>
        )}

        {editing === 'frequency' && (
          <>
            <View style={styles.stack}>
              {FREQUENCY_OPTIONS.map((o) => (
                <OptionCard key={o.key} title={o.label} selected={choice === o.key} onPress={() => setChoice(o.key)} />
              ))}
            </View>
            <Text style={styles.sheetHint}>Le jour de cotisation sera à choisir de nouveau si le rythme change.</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              onPress={() =>
                save(
                  choice === circle.frequency
                    ? {}
                    : { frequency: choice as Frequency, contributionWeekday: undefined, contributionMonthDay: undefined },
                )
              }
            />
          </>
        )}

        {editing === 'day' && (
          <>
            {circle.frequency === Frequency.MONTHLY ? (
              <MonthDayPicker value={num || undefined} onChange={setNum} />
            ) : (
              <WeekdayPicker value={num || undefined} onChange={setNum} />
            )}
            <View style={styles.preview}>
              <CalendarDays size={16} color={colors.primary.DEFAULT} />
              <Text style={styles.previewText}>
                {describeSchedule({
                  ...circle,
                  contributionWeekday: circle.frequency === Frequency.MONTHLY ? undefined : num || undefined,
                  contributionMonthDay: circle.frequency === Frequency.MONTHLY ? num || undefined : undefined,
                })}
              </Text>
            </View>
            {circle.frequency === Frequency.MONTHLY && num > 28 ? (
              <Text style={styles.sheetHint}>Les mois plus courts, la cotisation tombe le dernier jour du mois.</Text>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              disabled={!num}
              onPress={() =>
                save(
                  circle.frequency === Frequency.MONTHLY ? { contributionMonthDay: num } : { contributionWeekday: num },
                )
              }
            />
          </>
        )}

        {(editing === 'maxMembers' || editing === 'perTurn' || editing === 'approvers') && (
          <>
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>
                {editing === 'maxMembers' ? 'Membres, vous compris' : editing === 'perTurn' ? 'Bénéficiaires par tour' : 'Nombre de validateurs'}
              </Text>
              <NumberStepper
                value={num}
                onChange={setNum}
                min={editing === 'maxMembers' ? Math.max(2, memberCount) : 1}
                max={editing === 'maxMembers' ? 50 : editing === 'perTurn' ? Math.max(1, Math.floor((circle.maxMembers ?? memberCount) / 2)) : 9}
              />
            </View>
            {editing === 'approvers' && (
              <>
                {num > 1 && (
                  <>
                    <Text style={styles.fieldLabel}>Qui doit approuver une aide ?</Text>
                    <Segmented<UnlockRule>
                      value={unlock}
                      onChange={setUnlock}
                      options={UNLOCK_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
                    />
                  </>
                )}
                <View style={styles.preview}>
                  <UserCheck size={16} color={colors.primary.DEFAULT} />
                  <Text style={styles.previewText}>{describeApprovalRule(num, unlock)}</Text>
                </View>
              </>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              onPress={() =>
                editing === 'approvers'
                  ? saveApprovers()
                  : save(editing === 'maxMembers' ? { maxMembers: num } : { beneficiariesPerTurn: num })
              }
            />
          </>
        )}

        {editing === 'order' && (
          <>
            <View style={styles.stack}>
              {TURN_ORDER_OPTIONS.map((o) => (
                <OptionCard
                  key={o.key}
                  title={o.label}
                  description={o.desc}
                  selected={choice === o.key}
                  onPress={() => setChoice(o.key)}
                />
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              onPress={() => save({ turnOrderMethod: choice as TurnOrderMethod })}
            />
          </>
        )}

        {editing === 'exclusion' && (
          <>
            <View style={styles.chips}>
              {EXCLUSION_OPTIONS.map((n) => (
                <Chip key={n} label={`${n} retards`} selected={num === n} onPress={() => setNum(n)} />
              ))}
            </View>
            <Text style={styles.sheetHint}>
              Aucun frais ni pénalité de retard : au-delà de ce seuil, le fondateur peut seulement proposer l’exclusion.
            </Text>
            <Button title="Enregistrer" style={styles.sheetBtn} onPress={() => save({ exclusionThreshold: num })} />
          </>
        )}

        {editing === 'leaving' && (
          <>
            <View style={styles.stack}>
              {LEAVING_OPTIONS.map((o) => (
                <OptionCard
                  key={o.key}
                  title={o.label}
                  description={o.desc}
                  selected={choice === o.key}
                  onPress={() => setChoice(o.key)}
                />
              ))}
            </View>
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              onPress={() =>
                save({
                  rules: { ...circle.rules, replacementRule: choice as ReplacementRule },
                  recalculateOnLeave: choice === 'REDUCED_POT',
                })
              }
            />
          </>
        )}

        {editing === 'conditions' && (
          <>
            <TextField
              label="Règlement"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={800}
              placeholder="Ex. Cotisation avant 18 h le jour prévu. Prévenir le bureau en cas d’empêchement."
              hint="Chaque nouveau membre le lit et l’accepte avant de rejoindre."
            />
            <Button title="Enregistrer" style={styles.sheetBtn} onPress={() => save({ conditions: text.trim() })} />
          </>
        )}

        {editing === 'kyc' && (
          <>
            <View style={styles.stack}>
              {KYC_OPTIONS.map((o) => (
                <OptionCard
                  key={o.key}
                  title={o.label}
                  description={o.desc}
                  badge={o.badge}
                  selected={choice === o.key}
                  onPress={() => setChoice(o.key)}
                />
              ))}
            </View>
            <Button
              title="Enregistrer"
              style={styles.sheetBtn}
              onPress={() => save({ rules: { ...circle.rules, kycRequirement: choice as KycRequirement } })}
            />
          </>
        )}

        {editing === 'invite' && (
          <>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Code actuel</Text>
              <Text style={styles.code}>{circle.inviteCode}</Text>
            </View>
            <Text style={styles.sheetText}>
              Un nouveau code remplace l’ancien immédiatement : les personnes qui ont l’ancien code ne pourront plus
              demander à rejoindre. Les membres actuels ne sont pas concernés.
            </Text>
            <Button title="Créer un nouveau code" style={styles.sheetBtn} onPress={regenerateCode} />
            <Button title="Annuler" variant="ghost" onPress={close} />
          </>
        )}
      </Sheet>

      <DatePickerSheet
        visible={editing === 'start'}
        onClose={close}
        title="Date de début"
        value={circle.startDate}
        minDate={toDayString(new Date())}
        highlightWeekday={
          circle.frequency === Frequency.WEEKLY || circle.frequency === Frequency.BIWEEKLY
            ? circle.contributionWeekday
            : undefined
        }
        onConfirm={(d) => save({ startDate: d }, 'Date de début enregistrée')}
      />

      <Toast message={toast.message} />
    </View>
  );
}

const SHEET_TITLES: Record<EditKey, string> = {
  name: 'Nom du cercle',
  amount: 'Montant',
  fee: 'Frais de gestion',
  frequency: 'Fréquence',
  day: 'Jour de cotisation',
  start: 'Date de début',
  maxMembers: 'Nombre de membres',
  order: 'Ordre de passage',
  perTurn: 'Bénéficiaires par tour',
  exclusion: 'Retards tolérés',
  leaving: 'Départ d’un membre',
  conditions: 'Règlement du cercle',
  kyc: 'Documents demandés',
  approvers: 'Règle de validation',
  invite: 'Code d’invitation',
  locked: 'Réglage verrouillé',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  scroll: { paddingBottom: 48 },
  body: { paddingHorizontal: 16 },
  readOnly: { ...typography.footnote, color: colors.muted, marginTop: 20, marginHorizontal: 4 },
  lockedValue: { ...typography.callout, color: colors.subtle },

  stack: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetBtn: { marginTop: 20 },
  sheetText: { ...typography.callout, color: colors.inkSoft },
  sheetHint: { ...typography.footnote, color: colors.muted, marginTop: 12 },
  error: { ...typography.footnote, color: colors.danger.DEFAULT, marginTop: 12 },
  fieldLabel: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft, marginTop: 20, marginBottom: 10 },

  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary.tint,
  },
  previewText: { flex: 1, ...typography.callout, fontWeight: '600', color: colors.primary.dark },

  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  stepperLabel: { ...typography.body, color: colors.ink },

  lockHero: { alignItems: 'center', gap: 12, marginBottom: 20 },
  lockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },

  codeBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
    marginBottom: 16,
  },
  codeLabel: { ...typography.caption, color: colors.muted },
  code: { ...typography.title, color: colors.ink, letterSpacing: 2, marginTop: 4 },
});
