import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Banknote,
  Check,
  Copy,
  HeartHandshake,
  ImagePlus,
  Info,
  Package,
  Repeat,
  Share2,
  X,
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, typography } from '@venega/design-tokens';
import type { Circle } from '@venega/types';
import { ReplacementRule, UnlockRule, RefundRule, KycRequirement } from '@venega/types';
import { addCircle, CIRCLE_CREATION_FEE } from '../circleStore';
import {
  Button,
  Chip,
  IconButton,
  NumberStepper,
  OptionCard,
  Segmented,
  SettingRow,
  TextField,
  Toggle,
} from '../../../components/ui';

type Kind = 'TONTINE' | 'SOLIDARITY';
type Mode = 'CASH' | 'NATURE';

const STEPS = ['Type', 'Cotisations', 'Règles', 'Récapitulatif'];

const frequencies = [
  { key: 'DAILY', label: 'Chaque jour' },
  { key: 'WEEKLY', label: 'Chaque semaine' },
  { key: 'MONTHLY', label: 'Chaque mois' },
  { key: 'CUSTOM', label: 'Personnalisée' },
] as const;

const frequencyLabel: Record<string, string> = {
  DAILY: 'Journalière',
  WEEKLY: 'Hebdomadaire',
  MONTHLY: 'Mensuelle',
  CUSTOM: 'Personnalisée',
};

const kycOptions = [
  { key: KycRequirement.CNIB_SELFIE, label: 'CNIB + selfie', desc: 'Vérification complète de l’identité', badge: 'Recommandé' },
  { key: KycRequirement.CNIB, label: 'CNIB uniquement', desc: 'Pièce d’identité recto et verso' },
  { key: KycRequirement.NONE, label: 'Aucun document', desc: 'Pour un cercle entre proches de confiance' },
];

const leavingOptions = [
  { key: 'BUYOUT_REQUIRED', label: 'Rachat des tours passés', desc: 'Le remplaçant rachète les cotisations déjà versées' },
  { key: 'REDUCE_POOL', label: 'Cagnotte ajustée', desc: 'La cagnotte s’adapte au nombre de membres restants' },
];

const exclusionOptions = ['2', '3', '4', '5'];

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' F CFA';
const toNumber = (v: string) => parseInt(v.replace(/\D/g, ''), 10) || 0;

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

  // Étape 2 — cotisations
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [frequency, setFrequency] = useState<string>('MONTHLY');
  const [customDays, setCustomDays] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);

  // Étape 3 — règles
  const [beneficiariesPerTurn, setBeneficiariesPerTurn] = useState(1);
  const [exclusionThreshold, setExclusionThreshold] = useState('3');
  const [depositRequired, setDepositRequired] = useState(false);
  const [kycRequirement, setKycRequirement] = useState<KycRequirement>(KycRequirement.CNIB_SELFIE);
  const [leavingRule, setLeavingRule] = useState('BUYOUT_REQUIRED');
  const [conditions, setConditions] = useState('');

  const [createdCircle, setCreatedCircle] = useState<Circle | null>(null);

  const isTontine = kind === 'TONTINE';
  const isNature = isTontine && mode === 'NATURE';
  const contribution = toNumber(amount);
  const fee = toNumber(managementFee);
  const value = toNumber(goalValue);
  const perMember = contribution + fee;
  const potPerTurn = isTontine ? (contribution * maxMembers) / Math.max(beneficiariesPerTurn, 1) : 0;
  const suggestedNature = isNature && value > 0 ? Math.ceil(value / maxMembers / 100) * 100 : 0;

  const typeLabel = !isTontine ? 'Caisse de solidarité' : isNature ? 'Tontine en nature' : 'Tontine en espèces';

  const stepValid =
    step === 1
      ? !isNature || goalItem.trim().length > 1
      : step === 2
      ? name.trim().length >= 3 && contribution > 0 && (frequency !== 'CUSTOM' || toNumber(customDays) > 0)
      : true;

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
    type: (isTontine ? (isNature ? 'NATURE' : 'TONTINE_ONLY') : 'SOLIDARITY_ONLY') as Circle['type'],
    tontineAmount: isTontine ? contribution : 0,
    solidarityAmount: isTontine ? 0 : contribution,
    frequency: frequency as Circle['frequency'],
    contributionMode: (isNature ? 'NATURE' : 'CASH') as Circle['contributionMode'],
    beneficiariesPerTurn: isTontine ? beneficiariesPerTurn : 1,
    inviteCode,
    memberCount: 1,
    maxMembers,
    createdAt: new Date().toISOString(),
    rules: {
      refundRule: RefundRule.AT_CYCLE_END,
      replacementRule: !isTontine
        ? ReplacementRule.NONE
        : leavingRule === 'BUYOUT_REQUIRED'
        ? ReplacementRule.PAY_PAST_TURNS
        : ReplacementRule.REDUCED_POT,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 3,
      reservePercent: 5,
      allowPublicContributions: false,
      minContribution: undefined,
      goalAmount: isNature && value > 0 ? value : undefined,
      goalItem: isNature ? goalItem.trim() : undefined,
      goalDetails: isNature && goalDetails.trim() ? goalDetails.trim() : undefined,
      goalImageUrl: isNature && goalImage ? goalImage : undefined,
      kycRequirement,
    },
    managementFee: fee,
    depositRequired,
    recalculateOnLeave: isTontine && leavingRule === 'REDUCE_POOL',
    exclusionThreshold: parseInt(exclusionThreshold, 10) || 3,
    nextPaymentRequired: false,
    conditions: conditions.trim(),
    isActive: false,
  });

  const handleCreate = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const code = prefix + Math.floor(1000 + Math.random() * 9000).toString();
    const circle = buildCircle('c' + Date.now().toString(36), code);
    addCircle(circle);
    setCreatedCircle(circle);
  };

  const goBack = () => (step > 1 ? setStep(step - 1) : router.back());
  const goNext = () => (step < STEPS.length ? setStep(step + 1) : handleCreate());

  if (createdCircle) {
    return <CreatedView circle={createdCircle} onDone={() => router.replace('/(tabs)/circles')} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
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
            <View key={label} style={[styles.progressSeg, i < step && styles.progressSegDone]} />
          ))}
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View key={step} entering={FadeIn.duration(220)}>
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
                    <Animated.View entering={FadeIn.duration(220)} style={styles.section}>
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
                    <Animated.View entering={FadeIn.duration(260)} style={styles.natureCard}>
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
                          onChangeText={setGoalItem}
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
                  <Text style={styles.stepSubtitle}>Combien chaque membre verse, et à quel rythme.</Text>

                  <View style={styles.fields}>
                    <TextField
                      label="Nom du cercle"
                      placeholder={isTontine ? 'Ex. Tontine des commerçants de Dassasgho' : 'Ex. Mutuelle du quartier'}
                      value={name}
                      onChangeText={setName}
                      maxLength={48}
                    />
                    <View>
                      <TextField
                        label={isTontine ? 'Cotisation par membre et par tour' : 'Cotisation par membre'}
                        placeholder="0"
                        keyboardType="number-pad"
                        suffix="F CFA"
                        value={amount}
                        onChangeText={setAmount}
                      />
                      {suggestedNature > 0 && contribution !== suggestedNature && (
                        <TouchableOpacity
                          style={styles.suggestion}
                          onPress={() => setAmount(String(suggestedNature))}
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
                    <TextField
                      label="Frais de gestion (facultatif)"
                      placeholder="0"
                      keyboardType="number-pad"
                      suffix="F CFA"
                      value={managementFee}
                      onChangeText={setManagementFee}
                      hint="Votre commission de président, prélevée à chaque tour."
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fréquence</Text>
                    <View style={styles.chips}>
                      {frequencies.map((f) => (
                        <Chip key={f.key} label={f.label} selected={frequency === f.key} onPress={() => setFrequency(f.key)} />
                      ))}
                    </View>
                    {frequency === 'CUSTOM' && (
                      <TextField
                        containerStyle={styles.customDays}
                        placeholder="Ex. 14"
                        keyboardType="number-pad"
                        suffix="jours"
                        value={customDays}
                        onChangeText={setCustomDays}
                        hint="Intervalle entre deux cotisations."
                      />
                    )}
                  </View>

                  <View style={styles.section}>
                    <SettingRow title="Nombre de membres" description="Vous compris" last>
                      <NumberStepper value={maxMembers} onChange={setMaxMembers} min={2} max={50} />
                    </SettingRow>
                  </View>

                  {contribution > 0 && (
                    <View style={styles.totalCard}>
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
                    </View>
                  )}
                </>
              )}

              {/* ── ÉTAPE 3 — RÈGLES ── */}
              {step === 3 && (
                <>
                  <Text style={styles.stepTitle}>Règles du cercle</Text>
                  <Text style={styles.stepSubtitle}>Elles protègent le groupe et s’appliquent à tous, vous compris.</Text>

                  <View style={styles.group}>
                    {isTontine && (
                      <SettingRow title="Bénéficiaires par tour" description="Membres servis à chaque tour">
                        <NumberStepper
                          value={beneficiariesPerTurn}
                          onChange={setBeneficiariesPerTurn}
                          min={1}
                          max={Math.max(1, Math.floor(maxMembers / 2))}
                        />
                      </SettingRow>
                    )}
                    <SettingRow
                      title="Dépôt de garantie"
                      description="Une cotisation versée à l’entrée, rendue en fin de cercle"
                      last
                    >
                      <Toggle value={depositRequired} onValueChange={setDepositRequired} />
                    </SettingRow>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Retards tolérés avant exclusion</Text>
                    <View style={styles.chips}>
                      {exclusionOptions.map((opt) => (
                        <Chip
                          key={opt}
                          label={`${opt} retards`}
                          selected={exclusionThreshold === opt}
                          onPress={() => setExclusionThreshold(opt)}
                        />
                      ))}
                    </View>
                    <Text style={styles.sectionHint}>Au-delà, le bureau peut voter l’exclusion du membre.</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents demandés aux membres</Text>
                    <View style={styles.stack}>
                      {kycOptions.map((opt) => (
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

                  {isTontine && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Si un membre quitte le cercle</Text>
                      <View style={styles.stack}>
                        {leavingOptions.map((opt) => (
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
                  )}

                  <TextField
                    containerStyle={styles.section}
                    label="Conditions d’adhésion (facultatif)"
                    placeholder="Ex. Cotisation avant le 5 de chaque mois. Prévenir le bureau en cas d’empêchement."
                    multiline
                    value={conditions}
                    onChangeText={setConditions}
                    hint="Chaque nouveau membre devra les accepter."
                  />
                </>
              )}

              {/* ── ÉTAPE 4 — RÉCAPITULATIF ── */}
              {step === 4 && (
                <>
                  <Text style={styles.stepTitle}>Tout est correct ?</Text>
                  <Text style={styles.stepSubtitle}>Vous pourrez modifier ces réglages plus tard.</Text>

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
                      label="Fréquence"
                      value={frequency === 'CUSTOM' ? `Tous les ${toNumber(customDays)} jours` : frequencyLabel[frequency] ?? '—'}
                    />
                    <SummaryRow label="Total par membre" value={formatXOF(perMember)} strong last={!isTontine} />
                    {isTontine && <SummaryRow label="Cagnotte par tour" value={formatXOF(potPerTurn)} strong last />}
                  </SummaryCard>

                  <SummaryCard title="Règles" onEdit={() => setStep(3)}>
                    {isTontine && <SummaryRow label="Bénéficiaires par tour" value={`${beneficiariesPerTurn}`} />}
                    <SummaryRow label="Retards tolérés" value={exclusionThreshold} />
                    <SummaryRow label="Dépôt de garantie" value={depositRequired ? 'Oui' : 'Non'} />
                    <SummaryRow
                      label="Documents"
                      value={kycOptions.find((o) => o.key === kycRequirement)?.label ?? '—'}
                      last={!isTontine}
                    />
                    {isTontine && (
                      <SummaryRow
                        label="En cas de départ"
                        value={leavingOptions.find((o) => o.key === leavingRule)?.label ?? '—'}
                        last
                      />
                    )}
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
            <Button
              title={step === STEPS.length ? 'Créer le cercle' : 'Continuer'}
              onPress={goNext}
              disabled={!stepValid}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.createdScroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.createdHero}>
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
  },
  progressSegDone: {
    backgroundColor: colors.primary.DEFAULT,
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
  sectionHint: { ...typography.footnote, color: colors.muted, marginTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customDays: { marginTop: 16 },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
  },

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
    backgroundColor: 'rgba(22, 24, 29, 0.6)',
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
    backgroundColor: colors.primary.tint,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  totalLabel: { ...typography.callout, color: colors.inkSoft },
  totalValue: { ...typography.bodyStrong, color: colors.ink },
  totalValueStrong: { ...typography.headline, fontWeight: '700', color: colors.primary.dark },

  /* ── Récapitulatif ── */
  summaryCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 16,
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  summaryTitle: { ...typography.bodyStrong, color: colors.ink },
  summaryEdit: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT },
  summaryPhoto: { height: 140, borderRadius: radius.md, marginTop: 10, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 12 },
  summaryRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  summaryLabel: { ...typography.callout, color: colors.muted },
  summaryValue: { flexShrink: 1, ...typography.callout, fontWeight: '500', color: colors.ink, textAlign: 'right' },
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
