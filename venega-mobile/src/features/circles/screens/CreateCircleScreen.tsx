import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Camera,
  Clock,
  Heart,
  Layers,
  Package,
  Minus,
  Plus,
  Info,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { addCircle, CIRCLE_CREATION_FEE } from '../circleStore';
import type { Circle } from '@venega/types';
import { ReplacementRule, UnlockRule, RefundRule, KycRequirement } from '@venega/types';

const circleTypes = [
  {
    key: 'TONTINE_ONLY',
    label: 'Tontine',
    desc: 'Chaque membre cotise à tour de rôle et reçoit la cagnotte à son tour',
    icon: Clock,
  },
  {
    key: 'SOLIDARITY_ONLY',
    label: 'Caisse de solidarité',
    desc: "Un fonds commun pour venir en aide aux membres en cas de besoin, sans rotation",
    icon: Heart,
  },
  {
    key: 'HYBRID',
    label: 'Hybride',
    desc: 'Tontine et caisse de solidarité réunies dans un seul cercle',
    icon: Layers,
  },
  {
    key: 'NATURE',
    label: 'Tontine en nature',
    desc: 'Cagnotte distribuée en biens ou produits (moto, vivres, pagnes...)',
    icon: Package,
  },
] as const;

const frequencies = [
  { key: 'DAILY', label: 'Journalier', desc: 'Chaque jour' },
  { key: 'WEEKLY', label: 'Hebdomadaire', desc: 'Chaque semaine' },
  { key: 'MONTHLY', label: 'Mensuel', desc: 'Chaque mois' },
  { key: 'CUSTOM', label: 'Personnalisé', desc: 'Intervalle sur mesure' },
] as const;

const frequencyLabel: Record<string, string> = {
  DAILY: 'Journalière',
  WEEKLY: 'Hebdomadaire',
  MONTHLY: 'Mensuelle',
  CUSTOM: 'Personnalisée',
};

const kycRequirementOptions = [
  { key: 'REQUIRE_NONE', label: 'Aucun document', desc: 'À vos risques et périls (membres de confiance)' },
  { key: 'REQUIRE_CNIB', label: 'CNIB obligatoire', desc: 'Une pièce d\'identité valide requise' },
  { key: 'REQUIRE_CNIB_SELFIE', label: 'CNIB + Selfie (Recommandé)', desc: 'Sécurité maximale et vérification faciale' },
];

const leavingRuleOptions = [
  { key: 'BUYOUT_REQUIRED', label: 'Rachat du tour obligatoire', desc: 'Le nouvel entrant rachète les cotisations passées' },
  { key: 'REDUCE_POOL', label: 'Réduction de la cagnotte', desc: 'La cagnotte s\'ajuste au nombre de membres restants' },
];

const exclusionOptions = ['2', '3', '4', '5'];

const stepLabels = ['Type', 'Paramètres', 'Règles', 'Résumé'];

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

export default function CreateCircleScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('HYBRID');
  const [frequency, setFrequency] = useState<string>('MONTHLY');
  const [customDays, setCustomDays] = useState('3');

  // Tontine en nature / Box
  const [natureDescription, setNatureDescription] = useState('');
  const [naturePhotoUploaded, setNaturePhotoUploaded] = useState(false);

  // Cotisations & Dépôt
  const [tontineAmount, setTontineAmount] = useState('10000');
  const [solidarityAmount, setSolidarityAmount] = useState('2000');
  const [managementFee, setManagementFee] = useState('500');
  const [maxMembers, setMaxMembers] = useState('10');

  // Règles du bureau
  const [beneficiariesPerTurn, setBeneficiariesPerTurn] = useState(1);
  const [exclusionThreshold, setExclusionThreshold] = useState('3');
  const [depositRequired, setDepositRequired] = useState(false);
  const [kycRequirement, setKycRequirement] = useState('REQUIRE_CNIB_SELFIE');
  const [leavingRule, setLeavingRule] = useState('BUYOUT_REQUIRED');
  const [conditions, setConditions] = useState('');

  // Cercle créé (en attente d'activation)
  const [createdCircle, setCreatedCircle] = useState<Circle | null>(null);

  const usesTontine = type === 'TONTINE_ONLY' || type === 'HYBRID' || type === 'NATURE';
  const usesSolidarity = type === 'SOLIDARITY_ONLY' || type === 'HYBRID';

  const tontine = usesTontine ? parseFloat(tontineAmount) || 0 : 0;
  const solidarity = usesSolidarity ? parseFloat(solidarityAmount) || 0 : 0;
  const fee = parseFloat(managementFee) || 0;
  const total = tontine + solidarity + fee;

  const buildCircle = (id: string, inviteCodeValue: string): Circle => ({
    id,
    name: name.trim(),
    type: type as Circle['type'],
    tontineAmount: usesTontine ? tontine : 0,
    solidarityAmount: usesSolidarity ? solidarity : 0,
    frequency: frequency as Circle['frequency'],
    contributionMode:
      type === 'NATURE' ? ('NATURE' as Circle['contributionMode']) : ('CASH' as Circle['contributionMode']),
    beneficiariesPerTurn: usesTontine ? beneficiariesPerTurn : 1,
    inviteCode: inviteCodeValue,
    memberCount: 1,
    maxMembers: parseInt(maxMembers, 10) || 10,
    createdAt: new Date().toISOString(),
    rules: {
      refundRule: RefundRule.AT_CYCLE_END,
      replacementRule:
        leavingRule === 'BUYOUT_REQUIRED'
          ? ReplacementRule.PAY_PAST_TURNS
          : ReplacementRule.REDUCED_POT,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 3,
      reservePercent: 5,
      allowPublicContributions: false,
      minContribution: undefined,
      goalAmount: undefined,
      goalItem: undefined,
      kycRequirement: kycRequirement as KycRequirement,
    },
    managementFee: fee,
    depositRequired,
    recalculateOnLeave: leavingRule === 'REDUCE_POOL',
    exclusionThreshold: parseInt(exclusionThreshold, 10) || 3,
    nextPaymentRequired: false,
    conditions: conditions.trim(),
    isActive: false,
  });

  const handleCreateCircle = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const code = prefix + Math.floor(1000 + Math.random() * 9000).toString();
    const id = 'c' + Date.now().toString(36);
    const circle = buildCircle(id, code);
    addCircle(circle);
    setCreatedCircle(circle);
  };

  if (createdCircle) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#074B36" />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.successTopSection}>
            <View style={styles.successTopBar}>
              <View style={{ width: 38 }} />
              <Text style={styles.successStepText}>Cercle créé</Text>
              <View style={{ width: 38 }} />
            </View>
            <View style={styles.welcomeHero}>
              <View style={styles.welcomeIcon}>
                <Check size={44} color="#FFFFFF" />
              </View>
              <Text style={styles.welcomeTitle}>Cercle créé !</Text>
              <Text style={styles.welcomeSub}>
                Bienvenue dans votre nouveau cercle{'\n'}
                <Text style={{ fontFamily: 'SoraBold' }}>{createdCircle.name}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.successCardSheet}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.welcomeCard}>
                <View style={styles.welcomeCardHeader}>
                  <Clock size={20} color="#074B36" />
                  <Text style={styles.welcomeCardTitle}>En attente d'activation</Text>
                </View>
                <Text style={styles.welcomeCardText}>
                  Votre cercle apparaît maintenant dans votre liste de cercles, grisé. Appuyez
                  dessus pour régler les frais d'activation ({formatXOF(CIRCLE_CREATION_FEE)}) par mobile money et
                  mettre votre cercle en service.
                </Text>

                <View style={styles.welcomeInviteRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.welcomeInviteLabel}>Code d'invitation</Text>
                    <Text style={styles.welcomeInviteCode}>{createdCircle.inviteCode}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryPillBtn}
                  activeOpacity={0.88}
                  onPress={() => router.replace('/(tabs)/circles')}
                >
                  <Text style={styles.primaryPillBtnText}>Voir mes cercles</Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const typeMeta = circleTypes.find((t) => t.key === type)!;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
        <View style={styles.wizardHeader}>
          <View style={styles.wizardHeaderRow}>
            <TouchableOpacity
              style={styles.wizardBackBtn}
              activeOpacity={0.7}
              onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
            >
              <ArrowLeft size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.wizardHeaderTitle}>Créer un cercle</Text>
          </View>

          <View style={styles.stepperRow}>
            {stepLabels.map((label, idx) => {
              const completed = idx < step - 1;
              const current = idx === step - 1;
              return (
                <React.Fragment key={label}>
                  <View style={styles.stepperCol}>
                    <View style={[styles.stepperDot, (completed || current) && styles.stepperDotDone]}>
                      {completed ? (
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <Text style={[styles.stepperDotNum, current && styles.stepperDotNumActive]}>{idx + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepperLabel, current && styles.stepperLabelActive]} numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                  {idx < stepLabels.length - 1 && (
                    <View style={[styles.stepperLine, idx < step - 1 && styles.stepperLineDone]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.wizardScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ÉTAPE 1 — TYPE */}
            {step === 1 && (
              <Animated.View entering={FadeInDown.duration(350)} style={styles.stepGroup}>
                <Text style={styles.stepTitle}>Quel type de cercle voulez-vous créer ?</Text>
                <Text style={styles.stepSubtitle}>
                  Ce choix détermine le fonctionnement du cercle. Vous pourrez y ajouter des membres ensuite.
                </Text>

                <View style={styles.typeCardsCol}>
                  {circleTypes.map((t) => {
                    const active = type === t.key;
                    const Icon = t.icon;
                    return (
                      <TouchableOpacity
                        key={t.key}
                        style={[styles.typeCard, active && styles.typeCardActive]}
                        activeOpacity={0.85}
                        onPress={() => setType(t.key)}
                      >
                        <View style={styles.typeCardIconWrap}>
                          <Icon size={20} color="#0B6E4F" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.typeCardTitle}>{t.label}</Text>
                          <Text style={styles.typeCardDesc}>{t.desc}</Text>
                        </View>
                        {active && (
                          <View style={styles.typeCardCheck}>
                            <Check size={13} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {type === 'NATURE' && (
                  <Animated.View entering={FadeInDown.duration(400)} style={styles.natureBoxSection}>
                    <Text style={styles.fieldLabel}>Description du lot / Box en nature *</Text>
                    <TextInput
                      style={[styles.pillInput, styles.textAreaInput]}
                      placeholder="Ex: Moto Yamaha 125cc OU Box (5 sacs de riz 25kg + 5L huile + 2 cartons sardines)..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      value={natureDescription}
                      onChangeText={setNatureDescription}
                    />
                    <Text style={styles.fieldLabel}>Photo du lot / de la cagnotte</Text>
                    <TouchableOpacity
                      style={[styles.naturePhotoCard, naturePhotoUploaded && styles.naturePhotoCardDone]}
                      onPress={() => setNaturePhotoUploaded(true)}
                    >
                      <Camera size={22} color={naturePhotoUploaded ? '#10B981' : '#074B36'} />
                      <Text style={styles.naturePhotoText}>
                        {naturePhotoUploaded ? 'Photo du lot ajoutée avec succès' : 'Prendre ou uploader une photo du lot'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}

                <TouchableOpacity style={styles.primaryPillBtn} onPress={() => setStep(2)}>
                  <Text style={styles.primaryPillBtnText}>Continuer</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* ÉTAPE 2 — PARAMÈTRES */}
            {step === 2 && (
              <Animated.View entering={FadeInDown.duration(350)} style={styles.stepGroup}>
                <Text style={styles.stepTitle}>Paramètres du cercle</Text>
                <Text style={styles.stepSubtitle}>Nom, montants et fréquence des cotisations.</Text>

                <Text style={styles.fieldLabel}>Nom du cercle *</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Ex: Tontine Commerçants Dassasgho"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />

                {usesTontine && (
                  <>
                    <Text style={styles.fieldLabel}>Cotisation tontine (F CFA / tour) *</Text>
                    <TextInput
                      style={styles.pillInput}
                      placeholder="Ex: 10000"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={tontineAmount}
                      onChangeText={setTontineAmount}
                    />
                  </>
                )}

                {usesSolidarity && (
                  <>
                    <Text style={styles.fieldLabel}>Cotisation caisse solidarité (F CFA) *</Text>
                    <TextInput
                      style={styles.pillInput}
                      placeholder="Ex: 2000"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={solidarityAmount}
                      onChangeText={setSolidarityAmount}
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>Frais de gestion du Président (F CFA)</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Ex: 500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={managementFee}
                  onChangeText={setManagementFee}
                />

                <View style={styles.summaryTotalBox}>
                  <Text style={styles.summaryTotalLabel}>Cotisation totale par membre et par tour</Text>
                  <Text style={styles.summaryTotalAmount}>{formatXOF(total)}</Text>
                  <Text style={styles.summarySubNote}>Cotisation + Frais de gestion président inclus</Text>
                </View>

                <Text style={styles.fieldLabel}>Fréquence des cotisations *</Text>
                <View style={styles.frequencyGrid}>
                  {frequencies.map((f) => {
                    const isSelected = frequency === f.key;
                    return (
                      <TouchableOpacity
                        key={f.key}
                        style={[styles.frequencyCard, isSelected && styles.frequencyCardActive]}
                        onPress={() => setFrequency(f.key)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.frequencyTitleRow}>
                          <Text style={[styles.frequencyTitle, isSelected && styles.frequencyTitleActive]}>
                            {f.label}
                          </Text>
                          {isSelected && (
                            <View style={styles.frequencyCheck}>
                              <Check size={11} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.frequencySub, isSelected && styles.frequencySubActive]}>
                          {f.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {frequency === 'CUSTOM' && (
                  <View style={styles.customFrequencyBox}>
                    <Text style={styles.fieldLabel}>Intervalle de cotisation (en jours) *</Text>
                    <TextInput
                      style={styles.pillInput}
                      placeholder="Ex: 3 (tous les 3 jours) ou 14 (tous les 14 jours)"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={customDays}
                      onChangeText={setCustomDays}
                    />
                  </View>
                )}

                <Text style={styles.fieldLabel}>Nombre maximum de membres *</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Ex: 10"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={maxMembers}
                  onChangeText={setMaxMembers}
                />

                <TouchableOpacity
                  style={[styles.primaryPillBtn, !name.trim() && styles.primaryPillBtnDisabled]}
                  disabled={!name.trim()}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.primaryPillBtnText}>Continuer</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* ÉTAPE 3 — RÈGLES */}
            {step === 3 && (
              <Animated.View entering={FadeInDown.duration(350)} style={styles.stepGroup}>
                <Text style={styles.stepTitle}>Règles du cercle</Text>
                <Text style={styles.stepSubtitle}>
                  Ces règles protègent le cercle et s'appliqueront à tous les membres, y compris vous.
                </Text>

                {usesTontine && (
                  <>
                    <Text style={styles.fieldLabel}>Combien de membres reçoivent la cagnotte à chaque tour ?</Text>
                    <View style={styles.stepperFieldRow}>
                      <Text style={styles.stepperFieldLabel}>Bénéficiaires par tour</Text>
                      <View style={styles.stepperControl}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          activeOpacity={0.8}
                          onPress={() => setBeneficiariesPerTurn((n) => Math.max(1, n - 1))}
                        >
                          <Minus size={15} color="#074B36" />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{beneficiariesPerTurn}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          activeOpacity={0.8}
                          onPress={() => setBeneficiariesPerTurn((n) => n + 1)}
                        >
                          <Plus size={15} color="#074B36" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                <View style={styles.switchBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchTitle}>Dépôt de garantie à l'entrée</Text>
                    <Text style={styles.switchSub}>Chaque nouveau membre verse une avance remboursable en quittant le cercle</Text>
                  </View>
                  <Switch
                    value={depositRequired}
                    onValueChange={setDepositRequired}
                    trackColor={{ true: '#074B36' }}
                  />
                </View>

                <Text style={styles.fieldLabel}>Combien de retards tolérés avant exclusion ?</Text>
                <View style={styles.exclusionRow}>
                  {exclusionOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.exclusionBtn, exclusionThreshold === opt && styles.exclusionBtnActive]}
                      onPress={() => setExclusionThreshold(opt)}
                    >
                      <Text style={[styles.exclusionBtnText, exclusionThreshold === opt && styles.exclusionBtnTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.helperNote}>
                  Au-delà, vous pourrez proposer son exclusion au vote du bureau.
                </Text>

                <Text style={styles.fieldLabel}>Conditions d'adhésion à afficher aux nouveaux membres</Text>
                <TextInput
                  style={[styles.pillInput, styles.textAreaInput]}
                  placeholder="Ex. : Le membre s'engage à cotiser avant le 5 de chaque mois et à prévenir le bureau en cas d'empêchement…"
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={conditions}
                  onChangeText={setConditions}
                />

                <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Exigence de documents pour les membres *</Text>
                <View style={styles.typeOptionsCol}>
                  {kycRequirementOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.typeOptionCard, kycRequirement === opt.key && styles.typeOptionCardActive]}
                      onPress={() => setKycRequirement(opt.key)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.typeOptionHeader}>
                        <Text style={[styles.typeOptionTitle, kycRequirement === opt.key && styles.typeOptionTitleActive]}>
                          {opt.label}
                        </Text>
                        {kycRequirement === opt.key && (
                          <View style={styles.typeOptionCheck}>
                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.typeOptionDesc, kycRequirement === opt.key && styles.typeOptionDescActive]}>
                        {opt.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Règle en cas de départ d'un membre *</Text>
                <View style={styles.typeOptionsCol}>
                  {leavingRuleOptions.map((rule) => (
                    <TouchableOpacity
                      key={rule.key}
                      style={[styles.typeOptionCard, leavingRule === rule.key && styles.typeOptionCardActive]}
                      onPress={() => setLeavingRule(rule.key)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.typeOptionHeader}>
                        <Text style={[styles.typeOptionTitle, leavingRule === rule.key && styles.typeOptionTitleActive]}>
                          {rule.label}
                        </Text>
                        {leavingRule === rule.key && (
                          <View style={styles.typeOptionCheck}>
                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.typeOptionDesc, leavingRule === rule.key && styles.typeOptionDescActive]}>
                        {rule.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.primaryPillBtn} onPress={() => setStep(4)}>
                  <Text style={styles.primaryPillBtnText}>Continuer</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* ÉTAPE 4 — RÉSUMÉ */}
            {step === 4 && (
              <Animated.View entering={FadeInDown.duration(350)} style={styles.stepGroup}>
                <Text style={styles.stepTitle}>Vérifiez avant de créer</Text>
                <Text style={styles.stepSubtitle}>
                  Vous pourrez modifier ces réglages plus tard depuis les paramètres du cercle.
                </Text>

                <View style={styles.summaryList}>
                  <SummaryRow label="Nom du cercle" value={name || '—'} />
                  <SummaryRow
                    label="Type"
                    valueNode={
                      <View style={styles.summaryTypePill}>
                        <Text style={styles.summaryTypePillText}>{typeMeta.label}</Text>
                      </View>
                    }
                  />
                  {usesTontine && <SummaryRow label="Cotisation tontine" value={formatXOF(tontine)} />}
                  {usesSolidarity && <SummaryRow label="Cotisation solidarité" value={formatXOF(solidarity)} />}
                  <SummaryRow
                    label="Fréquence"
                    value={frequency === 'CUSTOM' ? `Tous les ${customDays} jours` : frequencyLabel[frequency]}
                    last={!usesTontine}
                  />
                  {usesTontine && (
                    <SummaryRow
                      label="Bénéficiaires par tour"
                      value={`${beneficiariesPerTurn} membre${beneficiariesPerTurn > 1 ? 's' : ''}`}
                      last
                    />
                  )}
                </View>

                <View style={styles.infoBanner}>
                  <Info size={16} color="#B9852A" />
                  <Text style={styles.infoBannerText}>
                    Un code d'invitation sera généré pour partager ce cercle avec vos futurs membres.
                  </Text>
                </View>

                <TouchableOpacity style={styles.primaryPillBtn} activeOpacity={0.88} onPress={handleCreateCircle}>
                  <Text style={styles.primaryPillBtnText}>Créer le cercle</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function SummaryRow({ label, value, valueNode, last }: { label: string; value?: string; valueNode?: React.ReactNode; last?: boolean }) {
  return (
    <View style={[styles.summaryRow, !last && styles.summaryRowBorder]}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      {valueNode ?? <Text style={styles.summaryRowValue}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },

  /* ── En-tête vert (écran de succès) ── */
  successTopSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingBottom: 36 },
  successTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginBottom: 14 },
  successStepText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#36E395' },
  successCardSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },

  /* ── En-tête blanc de l'assistant (Type / Paramètres / Règles / Résumé) ── */
  wizardHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18, backgroundColor: '#FFFFFF' },
  wizardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  wizardBackBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wizardHeaderTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#0F172A' },
  stepperRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepperCol: { alignItems: 'center', width: 56 },
  stepperDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F3F6',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperDotDone: { backgroundColor: '#074B36', borderColor: '#074B36' },
  stepperDotNum: { fontFamily: 'WorkSansSemiBold', fontSize: 11, color: '#94A3B8' },
  stepperDotNumActive: { color: '#FFFFFF' },
  stepperLabel: { fontFamily: 'WorkSansMedium', fontSize: 9.5, color: '#94A3B8', marginTop: 5, textAlign: 'center' },
  stepperLabelActive: { fontFamily: 'WorkSansSemiBold', color: '#0F172A' },
  stepperLine: { flex: 1, height: 1.5, backgroundColor: '#E2E8F0', marginTop: 12 },
  stepperLineDone: { backgroundColor: '#074B36' },

  wizardScrollContent: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 4 },
  stepGroup: { gap: 16 },
  stepTitle: { fontFamily: 'SoraBold', fontSize: 20, color: '#0F172A' },
  stepSubtitle: { fontFamily: 'WorkSans', fontSize: 13, color: '#64748B', lineHeight: 18, marginTop: -10 },

  sectionTitle: { fontFamily: 'SoraBold', fontSize: 20, color: '#074B36', marginBottom: 8 },
  fieldLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#334155', marginBottom: 4 },
  pillInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#0F172A',
  },
  textAreaInput: { height: 100, paddingTop: 14, borderRadius: 16 },

  /* ── Étape Type ── */
  typeCardsCol: { gap: 10 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#F1F3F6',
  },
  typeCardActive: { borderColor: '#0B6E4F', backgroundColor: 'rgba(11, 110, 79, 0.06)' },
  typeCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 110, 79, 0.08)',
  },
  typeCardTitle: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#0F172A' },
  typeCardDesc: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },
  typeCardCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0B6E4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  typeOptionsCol: { gap: 10 },
  typeOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  typeOptionCardActive: { borderColor: '#0B6E4F', backgroundColor: 'rgba(11, 110, 79, 0.05)' },
  typeOptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  typeOptionTitle: { flex: 1, fontFamily: 'SoraBold', fontSize: 14, color: '#0F172A' },
  typeOptionTitleActive: { color: '#0B6E4F' },
  typeOptionDesc: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B' },
  typeOptionDescActive: { color: '#334155' },
  typeOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0B6E4F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  frequencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  frequencyCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  frequencyCardActive: { borderColor: '#0B6E4F', backgroundColor: 'rgba(11, 110, 79, 0.05)' },
  frequencyTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  frequencyTitle: { fontFamily: 'SoraBold', fontSize: 14, color: '#0F172A' },
  frequencyTitleActive: { color: '#0B6E4F' },
  frequencySub: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#64748B', marginTop: 2 },
  frequencySubActive: { color: '#0B6E4F' },
  frequencyCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0B6E4F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryTotalBox: {
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  summaryTotalLabel: { fontFamily: 'WorkSans', fontSize: 13, color: '#074B36', marginBottom: 4 },
  summaryTotalAmount: { fontFamily: 'SoraBold', fontSize: 24, color: '#074B36' },
  summarySubNote: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#074B36', opacity: 0.8, marginTop: 2 },

  /* ── Étape Règles ── */
  stepperFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  stepperFieldLabel: { fontFamily: 'WorkSans', fontSize: 13.5, color: '#334155' },
  stepperControl: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: { fontFamily: 'SoraBold', fontSize: 16, color: '#0F172A', minWidth: 26, textAlign: 'center' },

  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  switchTitle: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#0F172A' },
  switchSub: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#64748B', marginTop: 2 },

  exclusionRow: { flexDirection: 'row', gap: 8 },
  exclusionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclusionBtnActive: { backgroundColor: '#0B6E4F', borderColor: '#0B6E4F' },
  exclusionBtnText: { fontFamily: 'SoraBold', fontSize: 15, color: '#334155' },
  exclusionBtnTextActive: { color: '#FFFFFF' },
  helperNote: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8', marginTop: -8, lineHeight: 16 },

  customFrequencyBox: { marginTop: 4 },
  natureBoxSection: { gap: 8 },
  naturePhotoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    borderStyle: 'dashed',
  },
  naturePhotoCardDone: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.04)', borderStyle: 'solid' },
  naturePhotoText: { fontFamily: 'WorkSansMedium', fontSize: 13, color: '#0F172A', flex: 1 },

  /* ── Étape Résumé ── */
  summaryList: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  summaryRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F3F6' },
  summaryRowLabel: { fontFamily: 'WorkSans', fontSize: 13, color: '#64748B' },
  summaryRowValue: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#0F172A' },
  summaryTypePill: { backgroundColor: '#E4F0EB', paddingHorizontal: 11, paddingVertical: 4, borderRadius: 10 },
  summaryTypePillText: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#0B6E4F' },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FBF1DD',
    borderRadius: 16,
    padding: 14,
  },
  infoBannerText: { flex: 1, fontFamily: 'WorkSans', fontSize: 12, lineHeight: 17, color: '#8A6416' },

  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryPillBtnDisabled: { opacity: 0.45 },
  primaryPillBtnText: { fontFamily: 'SoraBold', fontSize: 15.5, color: '#FFFFFF' },

  // Écran de succès
  welcomeHero: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  welcomeIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(54, 227, 149, 0.2)',
    borderWidth: 2,
    borderColor: '#36E395',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: { fontFamily: 'SoraBold', fontSize: 26, color: '#FFFFFF' },
  welcomeSub: { fontFamily: 'WorkSans', fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center', lineHeight: 20 },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  welcomeCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  welcomeCardTitle: { fontFamily: 'SoraBold', fontSize: 17, color: '#074B36', flex: 1 },
  welcomeCardText: { fontFamily: 'WorkSans', fontSize: 13.5, lineHeight: 21, color: '#475569' },
  welcomeInviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 75, 54, 0.05)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  welcomeInviteLabel: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#64748B' },
  welcomeInviteCode: { fontFamily: 'SoraBold', fontSize: 20, color: '#074B36', letterSpacing: 2 },
});
