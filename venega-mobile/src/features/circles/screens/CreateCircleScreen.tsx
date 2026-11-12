import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
} from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronRight,
  Copy,
  HeartHandshake,
  ImagePlus,
  Info,
  Package,
  Repeat,
  Share2,
  UserCheck,
  X,
} from 'lucide-react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, withTiming } from 'react-native-reanimated';
import { colors, motion, numeric, radius, shadows, typography } from '@venega/design-tokens';
import type { Circle } from '@venega/types';
import {
  CircleType,
  ContributionMode,
  Frequency,
  KycRequirement,
  RefundRule,
  ReplacementRule,
  TurnOrderMethod,
  UnlockRule,
} from '@venega/types';
import {
  addCircle,
  addFounderMembership,
  CIRCLE_CREATION_FEE,
  describeApprovalRule,
  describeSchedule,
  formatLongDay,
  isoWeekday,
  parseDay,
  toDayString,
} from '../circleStore';
import {
  EXCLUSION_OPTIONS,
  FREQUENCY_OPTIONS,
  KYC_OPTIONS,
  LEAVING_OPTIONS,
  TURN_ORDER_OPTIONS,
  UNLOCK_OPTIONS,
  formatXOFLong as formatXOF,
  frequencyLabel,
  kycLabel,
  toNumber,
  turnOrderLabel,
} from '../circleLabels';
import {
  Button,
  Chip,
  DatePickerSheet,
  IconButton,
  MonthDayPicker,
  NumberStepper,
  OptionCard,
  Segmented,
  SettingRow,
  TextField,
  Toggle,
  WeekdayPicker,
} from '../../../components/ui';

type Kind = 'TONTINE' | 'SOLIDARITY';
type Mode = 'CASH' | 'NATURE';

const STEPS = ['Type', 'Cotisations', 'Règles', 'Récapitulatif'];

export default function CreateCircleScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Étape 1 — type
  const [kind, setKind] = useState<Kind>('TONTINE');
  const [mode, setMode] = useState<Mode>('CASH');
  const [goalItem, setGoalItem] = useState('');
  const [goalDetails, setGoalDetails] = useState('');
  const [goalValue, setGoalValue] = useState('');
  const [goalImage, setGoalImage] = useState<string | null>(null);

  // Étape 2 — cotisations et calendrier
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [weekday, setWeekday] = useState<number | undefined>();
  const [monthDay, setMonthDay] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [maxMembers, setMaxMembers] = useState(10);

  // Étape 3 — règles
  const [beneficiariesPerTurn, setBeneficiariesPerTurn] = useState(1);
  const [turnOrder, setTurnOrder] = useState<TurnOrderMethod>(TurnOrderMethod.FIXED_BY_FOUNDER);
  const [nextPaymentRequired, setNextPaymentRequired] = useState(false);
  const [exclusionThreshold, setExclusionThreshold] = useState(3);
  const [depositRequired, setDepositRequired] = useState(false);
  const [kycRequirement, setKycRequirement] = useState<KycRequirement>(KycRequirement.CNIB_SELFIE);
  const [leavingRule, setLeavingRule] = useState<ReplacementRule>(ReplacementRule.PAY_PAST_TURNS);
  const [approvers, setApprovers] = useState(2);
  const [unlockRule, setUnlockRule] = useState<UnlockRule>(UnlockRule.ALL_APPROVERS);
  const [conditions, setConditions] = useState('');

  const [createdCircle, setCreatedCircle] = useState<Circle | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  // Chaque étape s'ouvre en haut de page.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const isTontine = kind === 'TONTINE';
  const isNature = isTontine && mode === 'NATURE';
  const contribution = toNumber(amount);
  const fee = isTontine ? toNumber(managementFee) : 0;
  const value = toNumber(goalValue);
  const perMember = contribution + fee;
  const potPerTurn = isTontine ? (contribution * maxMembers) / Math.max(beneficiariesPerTurn, 1) : 0;
  const suggestedNature = isNature && value > 0 ? Math.ceil(value / maxMembers / 100) * 100 : 0;
  const needsWeekday = frequency === Frequency.WEEKLY || frequency === Frequency.BIWEEKLY;
  const needsMonthDay = frequency === Frequency.MONTHLY;
  const schedule = {
    frequency,
    startDate,
    contributionWeekday: needsWeekday ? weekday : undefined,
    contributionMonthDay: needsMonthDay ? monthDay : undefined,
  };
  const dayChosen = (!needsWeekday || !!weekday) && (!needsMonthDay || !!monthDay);

  const typeLabel = !isTontine ? 'Caisse de solidarité' : isNature ? 'Tontine en nature' : 'Tontine en argent';

  type FieldError = Partial<Record<'goalItem' | 'name' | 'amount' | 'day' | 'start', string>>;
  const [errors, setErrors] = useState<FieldError>({});
  const validateStep = (): FieldError => {
    if (step === 1) {
      return { goalItem: !isNature || goalItem.trim().length > 1 ? undefined : 'Indiquez le bien remis à chaque tour.' };
    }
    if (step === 2) {
      return {
        name: name.trim().length >= 3 ? undefined : 'Le nom doit contenir au moins 3 caractères.',
        amount: contribution > 0 ? undefined : 'Indiquez le montant de la cotisation.',
        day: !isTontine || dayChosen ? undefined : 'Choisissez le jour de cotisation.',
        start: !isTontine || startDate ? undefined : 'Choisissez la date de la première cotisation.',
      };
    }
    return {};
  };
  /** L'erreur affichée sous un champ disparaît dès que la saisie est corrigée. */
  const edit = (field: keyof FieldError, setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };
  const clear = (field: keyof FieldError) => errors[field] && setErrors((e) => ({ ...e, [field]: undefined }));

  /** Date de début choisie : le jour de cotisation se pré-remplit s'il n'est pas encore choisi. */
  const pickStart = (day: string) => {
    setStartDate(day);
    setShowCalendar(false);
    clear('start');
    const d = parseDay(day)!;
    if (!weekday) setWeekday(isoWeekday(d));
    if (!monthDay) setMonthDay(d.getDate());
    clear('day');
  };

  const pickGoalImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Accès à la galerie requis', 'Autorisez l’accès à vos photos pour ajouter la photo du bien.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setGoalImage(result.assets[0].uri);
  };

  const buildCircle = (id: string, inviteCode: string): Circle => ({
    id,
    name: name.trim(),
    type: isTontine ? (isNature ? CircleType.NATURE : CircleType.TONTINE_ONLY) : CircleType.SOLIDARITY_ONLY,
    tontineAmount: isTontine ? contribution : 0,
    solidarityAmount: isTontine ? 0 : contribution,
    frequency,
    contributionMode: isNature ? ContributionMode.NATURE : ContributionMode.CASH,
    beneficiariesPerTurn: isTontine ? beneficiariesPerTurn : 0,
    inviteCode,
    memberCount: 1,
    maxMembers,
    createdAt: new Date().toISOString(),
    startDate,
    contributionWeekday: schedule.contributionWeekday,
    contributionMonthDay: schedule.contributionMonthDay,
    turnOrderMethod: isTontine ? turnOrder : undefined,
    rules: {
      refundRule: RefundRule.AT_CYCLE_END,
      replacementRule: isTontine ? leavingRule : ReplacementRule.NONE,
      // Caisse : le fondateur choisit le nombre de validateurs et la règle (tous / majorité).
      unlockRule: isTontine ? UnlockRule.ALL_APPROVERS : approvers === 1 ? UnlockRule.ALL_APPROVERS : unlockRule,
      approversRequired: isTontine ? 0 : approvers,
      allowPublicContributions: false,
      goalAmount: isNature && value > 0 ? value : undefined,
      goalItem: isNature ? goalItem.trim() : undefined,
      goalDetails: isNature && goalDetails.trim() ? goalDetails.trim() : undefined,
      goalImageUrl: isNature && goalImage ? goalImage : undefined,
      kycRequirement,
    },
    managementFee: fee,
    depositRequired: isTontine && depositRequired,
    recalculateOnLeave: isTontine && leavingRule === ReplacementRule.REDUCED_POT,
    exclusionThreshold: isTontine ? exclusionThreshold : 0,
    nextPaymentRequired: isTontine && nextPaymentRequired,
    conditions: conditions.trim(),
    isActive: false,
  });

  const handleCreate = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const code = prefix + Math.floor(1000 + Math.random() * 9000).toString();
    const circle = buildCircle('c' + Date.now().toString(36), code);
    addCircle(circle);
    addFounderMembership(circle);
    setCreatedCircle(circle);
  };

  const goBack = () => (step > 1 ? setStep(step - 1) : router.back());
  const goNext = () => {
    const found = validateStep();
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    if (step < STEPS.length) setStep(step + 1);
    else handleCreate();
  };

  if (createdCircle) {
    return <CreatedView circle={createdCircle} onDone={() => router.replace('/(tabs)/circles')} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* ── En-tête + progression ── */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={goBack} />
          <Text style={styles.headerTitle}>Nouveau cercle</Text>
          <Text style={styles.headerStep}>
            {step}/{STEPS.length}
          </Text>
        </View>
        <View style={styles.progress}>
          {STEPS.map((label, i) => (
            <ProgressSegment key={label} done={i < step} />
          ))}
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View key={step} entering={FadeIn.duration(motion.base)}>
              <Text style={styles.eyebrow}>{STEPS[step - 1]}</Text>

              {/* ── ÉTAPE 1 — TYPE ── */}
              {step === 1 && (
                <>
                  <Text style={styles.stepTitle}>Quel cercle voulez-vous créer ?</Text>
                  <Text style={styles.stepSubtitle}>Ce choix définit le fonctionnement du cercle.</Text>

                  <View style={styles.stack}>
                    <OptionCard
                      icon={Repeat}
                      title="Tontine"
                      description="Chaque membre cotise et reçoit la cagnotte à son tour."
                      selected={isTontine}
                      onPress={() => setKind('TONTINE')}
                    />
                    <OptionCard
                      icon={HeartHandshake}
                      title="Caisse de solidarité"
                      description="Un fonds commun pour aider un membre dans le besoin."
                      selected={!isTontine}
                      onPress={() => setKind('SOLIDARITY')}
                    />
                  </View>

                  {isTontine && (
                    <Animated.View entering={FadeIn.duration(motion.base)} style={styles.section}>
                      <Text style={styles.sectionTitle}>Que reçoit le bénéficiaire ?</Text>
                      <Segmented<Mode>
                        value={mode}
                        onChange={setMode}
                        options={[
                          { key: 'CASH', label: 'De l’argent', icon: Banknote },
                          { key: 'NATURE', label: 'Un bien', icon: Package },
                        ]}
                      />
                      <Text style={styles.sectionHint}>
                        {isNature
                          ? 'Les cotisations servent à acheter un bien, remis à tour de rôle.'
                          : 'La cagnotte est versée en mobile money au bénéficiaire du tour.'}
                      </Text>
                    </Animated.View>
                  )}

                  {isNature && (
                    <Animated.View entering={FadeIn.duration(motion.slow)} style={styles.natureCard}>
                      <Text style={styles.natureTitle}>Le bien à remettre</Text>

                      <TouchableOpacity
                        style={[styles.photoTile, goalImage && styles.photoTileFilled]}
                        activeOpacity={0.85}
                        onPress={pickGoalImage}
                        accessibilityRole="button"
                        accessibilityLabel="Ajouter une photo du bien"
                      >
                        {goalImage ? (
                          <>
                            <Image source={{ uri: goalImage }} style={styles.photo} contentFit="cover" />
                            <TouchableOpacity
                              style={styles.photoRemove}
                              onPress={() => setGoalImage(null)}
                              hitSlop={8}
                              accessibilityLabel="Retirer la photo"
                            >
                              <X size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <View style={styles.photoIcon}>
                              <ImagePlus size={22} color={colors.primary.DEFAULT} strokeWidth={1.8} />
                            </View>
                            <Text style={styles.photoText}>Ajouter une photo</Text>
                            <Text style={styles.photoHint}>Les membres verront ce qu’ils vont recevoir</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <View style={styles.fields}>
                        <TextField
                          label="Nom du bien"
                          placeholder="Ex. Moto Bajaj Boxer 100cc"
                          value={goalItem}
                          onChangeText={edit('goalItem', setGoalItem)}
                          error={errors.goalItem}
                        />
                        <TextField
                          label="Détails (facultatif)"
                          placeholder="Ex. 2 sacs de riz 25 kg, 5 L d’huile, 1 carton de savon"
                          multiline
                          value={goalDetails}
                          onChangeText={setGoalDetails}
                        />
                        <TextField
                          label="Valeur estimée"
                          placeholder="0"
                          keyboardType="number-pad"
                          suffix="F CFA"
                          value={goalValue}
                          onChangeText={setGoalValue}
                          hint="Sert à calculer la cotisation conseillée."
                        />
                      </View>
                    </Animated.View>
                  )}
                </>
              )}

              {/* ── ÉTAPE 2 — COTISATIONS ── */}
              {step === 2 && (
                <>
                  <Text style={styles.stepTitle}>Nom et cotisations</Text>
                  <Text style={styles.stepSubtitle}>
                    {isTontine ? 'Combien chaque membre verse, et quand.' : 'Le montant habituel et le rythme des cotisations.'}
                  </Text>

                  <View style={styles.fields}>
                    <TextField
                      label="Nom du cercle"
                      placeholder={isTontine ? 'Ex. Tontine des commerçants de Dassasgho' : 'Ex. Mutuelle du quartier'}
                      value={name}
                      onChangeText={edit('name', setName)}
                      error={errors.name}
                      maxLength={48}
                    />
                    <View>
                      <TextField
                        label={isTontine ? 'Cotisation par membre et par tour' : 'Cotisation habituelle par membre'}
                        placeholder="0"
                        keyboardType="number-pad"
                        suffix="F CFA"
                        value={amount}
                        onChangeText={edit('amount', setAmount)}
                        error={errors.amount}
                        hint={isTontine ? undefined : 'Volontaire : aucune pénalité en cas d’oubli.'}
                      />
                      {suggestedNature > 0 && contribution !== suggestedNature && (
                        <TouchableOpacity
                          style={styles.suggestion}
                          onPress={() => edit('amount', setAmount)(String(suggestedNature))}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.suggestionText}>
                            Conseillé pour {maxMembers} membres :{' '}
                            <Text style={styles.suggestionStrong}>{formatXOF(suggestedNature)}</Text>
                          </Text>
                          <Text style={styles.suggestionAction}>Appliquer</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {isTontine && (
                      <TextField
                        label="Frais de gestion (facultatif)"
                        placeholder="0"
                        keyboardType="number-pad"
                        suffix="F CFA"
                        value={managementFee}
                        onChangeText={setManagementFee}
                        hint="Votre commission de fondateur, par membre et par tour."
                      />
                    )}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fréquence</Text>
                    <View style={styles.chips}>
                      {FREQUENCY_OPTIONS.map((f) => (
                        <Chip key={f.key} label={f.label} selected={frequency === f.key} onPress={() => setFrequency(f.key)} />
                      ))}
                    </View>
                  </View>

                  {(needsWeekday || needsMonthDay) && (
                    <Animated.View key={frequency} entering={FadeIn.duration(motion.base)} style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        {needsWeekday ? 'Quel jour de la semaine ?' : 'Quel jour du mois ?'}
                        {!isTontine ? <Text style={styles.optional}> (facultatif)</Text> : null}
                      </Text>
                      {needsWeekday ? (
                        <WeekdayPicker
                          value={weekday}
                          onChange={(d) => {
                            setWeekday(d);
                            clear('day');
                          }}
                        />
                      ) : (
                        <View style={styles.monthGrid}>
                          <MonthDayPicker
                            value={monthDay}
                            onChange={(d) => {
                              setMonthDay(d);
                              clear('day');
                            }}
                          />
                        </View>
                      )}
                      {errors.day ? <Text style={styles.error}>{errors.day}</Text> : null}
                      {needsMonthDay && (monthDay ?? 0) > 28 ? (
                        <Text style={styles.sectionHint}>Les mois plus courts, la cotisation tombe le dernier jour du mois.</Text>
                      ) : null}
                    </Animated.View>
                  )}

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Première cotisation
                      {!isTontine ? <Text style={styles.optional}> (facultatif)</Text> : null}
                    </Text>
                    <TouchableOpacity
                      style={[styles.dateRow, errors.start && styles.dateRowError]}
                      activeOpacity={0.7}
                      onPress={() => setShowCalendar(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Choisir la date de la première cotisation"
                    >
                      <View style={styles.dateIcon}>
                        <CalendarRange size={18} color={colors.primary.DEFAULT} />
                      </View>
                      <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                        {startDate ? formatLongDay(parseDay(startDate)!) : 'Choisir une date'}
                      </Text>
                      <ChevronRight size={18} color={colors.subtle} />
                    </TouchableOpacity>
                    {errors.start ? <Text style={styles.error}>{errors.start}</Text> : null}
                    {startDate && dayChosen ? (
                      <View style={styles.preview}>
                        <CalendarDays size={16} color={colors.primary.DEFAULT} />
                        <Text style={styles.previewText}>{describeSchedule(schedule)}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={[styles.section, styles.group]}>
                    <SettingRow title="Nombre de membres" description="Vous compris" last>
                      <NumberStepper value={maxMembers} onChange={setMaxMembers} min={2} max={50} />
                    </SettingRow>
                  </View>

                  {contribution > 0 && (
                    <Animated.View entering={FadeIn.duration(motion.base)} style={styles.totalCard}>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Chaque membre verse</Text>
                        <Text style={styles.totalValue}>{formatXOF(perMember)}</Text>
                      </View>
                      {isTontine && (
                        <View style={styles.totalRow}>
                          <Text style={styles.totalLabel}>{isNature ? 'Budget par tour' : 'Cagnotte par tour'}</Text>
                          <Text style={styles.totalValueStrong}>{formatXOF(potPerTurn)}</Text>
                        </View>
                      )}
                    </Animated.View>
                  )}
                </>
              )}

              {/* ── ÉTAPE 3 — RÈGLES ── */}
              {step === 3 && (
                <>
                  <Text style={styles.stepTitle}>Règles du cercle</Text>
                  <Text style={styles.stepSubtitle}>Elles protègent le groupe et s’appliquent à tous, vous compris.</Text>

                  {isTontine ? (
                    <>
                      <Text style={styles.sectionTitle}>Ordre de passage</Text>
                      <View style={styles.stack}>
                        {TURN_ORDER_OPTIONS.map((o) => (
                          <OptionCard
                            key={o.key}
                            title={o.label}
                            description={o.desc}
                            selected={turnOrder === o.key}
                            onPress={() => setTurnOrder(o.key)}
                          />
                        ))}
                      </View>

                      <View style={[styles.section, styles.group]}>
                        <SettingRow title="Bénéficiaires par tour" description="Membres servis à chaque tour">
                          <NumberStepper
                            value={beneficiariesPerTurn}
                            onChange={setBeneficiariesPerTurn}
                            min={1}
                            max={Math.max(1, Math.floor(maxMembers / 2))}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Payer le tour suivant d’abord"
                          description="Le bénéficiaire paie sa prochaine cotisation avant de recevoir la cagnotte"
                        >
                          <Toggle value={nextPaymentRequired} onValueChange={setNextPaymentRequired} />
                        </SettingRow>
                        <SettingRow
                          title="Dépôt de garantie"
                          description="Une cotisation déposée par qui rejoint en cours de route, rendue à la fin"
                          last
                        >
                          <Toggle value={depositRequired} onValueChange={setDepositRequired} />
                        </SettingRow>
                      </View>

                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Retards tolérés avant exclusion</Text>
                        <View style={styles.chips}>
                          {EXCLUSION_OPTIONS.map((n) => (
                            <Chip
                              key={n}
                              label={`${n} retards`}
                              selected={exclusionThreshold === n}
                              onPress={() => setExclusionThreshold(n)}
                            />
                          ))}
                        </View>
                        <Text style={styles.sectionHint}>
                          Aucune pénalité : au-delà, le fondateur peut seulement proposer l’exclusion.
                        </Text>
                      </View>

                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Si un membre quitte le cercle</Text>
                        <View style={styles.stack}>
                          {LEAVING_OPTIONS.map((opt) => (
                            <OptionCard
                              key={opt.key}
                              title={opt.label}
                              description={opt.desc}
                              selected={leavingRule === opt.key}
                              onPress={() => setLeavingRule(opt.key)}
                            />
                          ))}
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sectionTitle}>Validation des aides</Text>
                      <View style={styles.group}>
                        <SettingRow title="Nombre de validateurs" description="Désignés parmi les membres, après la création">
                          <NumberStepper value={approvers} onChange={setApprovers} min={1} max={9} />
                        </SettingRow>
                        {approvers > 1 ? (
                          <View style={styles.groupInner}>
                            <Text style={styles.groupLabel}>Qui doit approuver une aide ?</Text>
                            <Segmented<UnlockRule>
                              value={unlockRule}
                              onChange={setUnlockRule}
                              options={UNLOCK_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
                            />
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.preview}>
                        <UserCheck size={16} color={colors.primary.DEFAULT} />
                        <Text style={styles.previewText}>
                          {describeApprovalRule(approvers, approvers === 1 ? UnlockRule.ALL_APPROVERS : unlockRule)}
                        </Text>
                      </View>
                      <Text style={styles.sectionHint}>
                        L’argent de la caisse reste bloqué tant que cette règle n’est pas respectée.
                      </Text>
                    </>
                  )}

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents demandés aux membres</Text>
                    <View style={styles.stack}>
                      {KYC_OPTIONS.map((opt) => (
                        <OptionCard
                          key={opt.key}
                          title={opt.label}
                          description={opt.desc}
                          badge={opt.badge}
                          selected={kycRequirement === opt.key}
                          onPress={() => setKycRequirement(opt.key)}
                        />
                      ))}
                    </View>
                  </View>

                  <TextField
                    containerStyle={styles.section}
                    label="Règlement du cercle (facultatif)"
                    placeholder="Ex. Cotisation avant 18 h le jour prévu. Prévenir le bureau en cas d’empêchement."
                    multiline
                    value={conditions}
                    onChangeText={setConditions}
                    hint="Chaque nouveau membre devra l’accepter."
                  />
                </>
              )}

              {/* ── ÉTAPE 4 — RÉCAPITULATIF ── */}
              {step === 4 && (
                <>
                  <Text style={styles.stepTitle}>Tout est correct ?</Text>
                  <Text style={styles.stepSubtitle}>
                    {isTontine
                      ? 'Montant, calendrier et ordre de passage restent modifiables jusqu’au premier tour.'
                      : 'Vous pourrez modifier ces réglages plus tard.'}
                  </Text>

                  <SummaryCard title="Cercle" onEdit={() => setStep(1)}>
                    {isNature && goalImage ? (
                      <Image source={{ uri: goalImage }} style={styles.summaryPhoto} contentFit="cover" />
                    ) : null}
                    <SummaryRow label="Nom" value={name.trim()} />
                    <SummaryRow label="Type" value={typeLabel} />
                    {isNature && <SummaryRow label="Bien remis" value={goalItem.trim()} />}
                    {isNature && value > 0 && <SummaryRow label="Valeur estimée" value={formatXOF(value)} />}
                    <SummaryRow label="Membres" value={`${maxMembers}`} last />
                  </SummaryCard>

                  <SummaryCard title="Cotisations" onEdit={() => setStep(2)}>
                    <SummaryRow label="Cotisation" value={formatXOF(contribution)} />
                    {fee > 0 && <SummaryRow label="Frais de gestion" value={formatXOF(fee)} />}
                    <SummaryRow
                      label="Calendrier"
                      value={startDate || dayChosen ? describeSchedule(schedule) : frequencyLabel(frequency)}
                    />
                    <SummaryRow label="Total par membre" value={formatXOF(perMember)} strong last={!isTontine} />
                    {isTontine && <SummaryRow label="Cagnotte par tour" value={formatXOF(potPerTurn)} strong last />}
                  </SummaryCard>

                  <SummaryCard title="Règles" onEdit={() => setStep(3)}>
                    {isTontine ? (
                      <>
                        <SummaryRow label="Ordre de passage" value={turnOrderLabel(turnOrder)} />
                        <SummaryRow label="Bénéficiaires par tour" value={`${beneficiariesPerTurn}`} />
                        <SummaryRow label="Tour suivant payé d’abord" value={nextPaymentRequired ? 'Oui' : 'Non'} />
                        <SummaryRow label="Dépôt de garantie" value={depositRequired ? 'Oui' : 'Non'} />
                        <SummaryRow label="Retards tolérés" value={`${exclusionThreshold}`} />
                        <SummaryRow
                          label="En cas de départ"
                          value={LEAVING_OPTIONS.find((o) => o.key === leavingRule)?.label ?? '—'}
                        />
                      </>
                    ) : (
                      <SummaryRow
                        label="Validation des aides"
                        value={describeApprovalRule(approvers, approvers === 1 ? UnlockRule.ALL_APPROVERS : unlockRule)}
                      />
                    )}
                    <SummaryRow label="Documents" value={kycLabel(kycRequirement)} last />
                  </SummaryCard>

                  <View style={styles.notice}>
                    <Info size={18} color={colors.accent.deep} />
                    <Text style={styles.noticeText}>
                      Frais d’activation de {formatXOF(CIRCLE_CREATION_FEE)}, à régler par mobile money une fois le
                      cercle créé.
                    </Text>
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title={step === STEPS.length ? 'Créer le cercle' : 'Continuer'} onPress={goNext} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <DatePickerSheet
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        title="Première cotisation"
        value={startDate}
        minDate={toDayString(new Date())}
        highlightWeekday={needsWeekday ? weekday : undefined}
        onConfirm={pickStart}
      />
    </View>
  );
}

/** Segment de la barre de progression : se remplit en douceur (transform seulement). */
function ProgressSegment({ done }: { done: boolean }) {
  const reduced = useReducedMotion();
  const fill = useAnimatedStyle(() => ({
    transform: [{ scaleX: reduced ? (done ? 1 : 0) : withTiming(done ? 1 : 0, { duration: motion.slow }) }],
  }));
  return (
    <View style={styles.progressSeg}>
      <Animated.View style={[styles.progressFill, fill]} />
    </View>
  );
}

function SummaryCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <TouchableOpacity onPress={onEdit} hitSlop={8} activeOpacity={0.6}>
          <Text style={styles.summaryEdit}>Modifier</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function SummaryRow({ label, value, strong, last }: { label: string; value: string; strong?: boolean; last?: boolean }) {
  return (
    <View style={[styles.summaryRow, !last && styles.summaryRowBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryValueStrong]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function CreatedView({ circle, onDone }: { circle: Circle; onDone: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(circle.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () =>
    Share.share({
      message: `Rejoins mon cercle « ${circle.name} » sur Venega avec le code ${circle.inviteCode}.`,
    }).catch(() => {});

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.createdScroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(motion.slow)} style={styles.createdHero}>
            <View style={styles.createdIcon}>
              <Check size={32} color={colors.primary.DEFAULT} strokeWidth={2.5} />
            </View>
            <Text style={styles.createdTitle}>Votre cercle est créé</Text>
            <Text style={styles.createdName}>{circle.name}</Text>
          </Animated.View>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Code d’invitation</Text>
            <Text style={styles.code}>{circle.inviteCode}</Text>
            <View style={styles.codeActions}>
              <Button
                title={copied ? 'Copié' : 'Copier'}
                icon={copied ? Check : Copy}
                variant="secondary"
                size="sm"
                onPress={copy}
                style={styles.flex}
              />
              <Button title="Partager" icon={Share2} variant="secondary" size="sm" onPress={share} style={styles.flex} />
            </View>
          </View>

          <View style={styles.notice}>
            <Info size={18} color={colors.accent.deep} />
            <Text style={styles.noticeText}>
              Le cercle s’active après le paiement des frais de {formatXOF(CIRCLE_CREATION_FEE)}. Retrouvez-le dans
              « Mes cercles » pour le régler.
              {circle.type !== CircleType.SOLIDARITY_ONLY
                ? ' Vous démarrerez ensuite le premier tour depuis « Gérer le cercle », quand tous les membres seront là.'
                : ''}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Voir mes cercles" onPress={onDone} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    flex: 1,
    ...typography.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  headerStep: {
    width: 40,
    ...typography.footnote,
    ...numeric,
    fontWeight: '600',
    color: colors.muted,
    textAlign: 'center',
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  progressFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary.DEFAULT,
    transformOrigin: 'left',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  eyebrow: {
    ...typography.caption,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  stepTitle: { ...typography.title, color: colors.ink },
  stepSubtitle: { ...typography.callout, color: colors.muted, marginTop: 6, marginBottom: 24 },

  stack: { gap: 12 },
  fields: { gap: 20 },
  section: { marginTop: 28 },
  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 12 },
  optional: { ...typography.callout, fontWeight: '400', color: colors.muted },
  sectionHint: { ...typography.footnote, color: colors.muted, marginTop: 10 },
  error: { ...typography.footnote, color: colors.danger.DEFAULT, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthGrid: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 4 },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    backgroundColor: colors.bg,
  },
  groupInner: {
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  groupLabel: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft, marginBottom: 10 },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  dateRowError: { borderColor: colors.danger.DEFAULT },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: { flex: 1, ...typography.body, fontWeight: '500', color: colors.ink },
  datePlaceholder: { color: colors.subtle, fontWeight: '400' },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary.tint,
  },
  previewText: { flex: 1, ...typography.callout, fontWeight: '600', color: colors.primary.dark },

  /* ── Bloc « bien à remettre » ── */
  natureCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.fill,
  },
  natureTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 14 },
  photoTile: {
    height: 168,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  photoTileFilled: { borderStyle: 'solid', borderWidth: 0 },
  photo: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(18, 38, 30, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoText: { ...typography.callout, fontWeight: '600', color: colors.ink },
  photoHint: { ...typography.footnote, color: colors.muted, marginTop: 2 },

  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.primary.tint,
  },
  suggestionText: { flex: 1, ...typography.footnote, color: colors.inkSoft },
  suggestionStrong: { fontWeight: '600', color: colors.ink },
  suggestionAction: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT },

  totalCard: {
    marginTop: 24,
    padding: 16,
    gap: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.primary.dark,
    ...shadows.soft,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  totalLabel: { ...typography.callout, color: 'rgba(255,255,255,0.75)' },
  totalValue: { ...typography.bodyStrong, ...numeric, color: '#FFFFFF' },
  totalValueStrong: { ...typography.headline, ...numeric, fontWeight: '700', color: colors.accent.DEFAULT },

  /* ── Récapitulatif ── */
  summaryCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 16,
    backgroundColor: colors.bg,
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  summaryTitle: { ...typography.bodyStrong, color: colors.ink },
  summaryEdit: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT },
  summaryPhoto: { height: 140, borderRadius: radius.md, marginTop: 10, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 12 },
  summaryRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  summaryLabel: { ...typography.callout, color: colors.muted },
  summaryValue: { flexShrink: 1, ...typography.callout, ...numeric, fontWeight: '500', color: colors.ink, textAlign: 'right' },
  summaryValueStrong: { fontWeight: '700' },

  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.accent.tint,
    marginTop: 4,
  },
  noticeText: { flex: 1, ...typography.footnote, color: colors.inkSoft },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  /* ── Cercle créé ── */
  createdScroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 },
  createdHero: { alignItems: 'center', marginBottom: 32 },
  createdIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  createdTitle: { ...typography.title, color: colors.ink, textAlign: 'center' },
  createdName: { ...typography.body, color: colors.muted, marginTop: 6, textAlign: 'center' },
  codeCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  codeLabel: { ...typography.footnote, color: colors.muted },
  code: { ...typography.display, color: colors.ink, letterSpacing: 3, marginTop: 6, marginBottom: 18 },
  codeActions: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
});
