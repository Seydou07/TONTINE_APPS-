import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Users,
  Coins,
  Layers,
  Sparkles,
  Info,
  BadgeCheck,
  Package,
  Gift,
  Camera,
  Upload,
  ShieldAlert,
  AlertTriangle,
  Lock,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const circleTypes = [
  { key: 'TONTINE_ONLY', label: 'Tontine rotative', desc: 'Cotisation + cagnotte distribuée par tour' },
  { key: 'SOLIDARITY_ONLY', label: 'Caisse de solidarité', desc: "Fonds d'entraide communautaire" },
  { key: 'HYBRID', label: 'Hybride (Recommandé)', desc: 'Tontine rotative + Caisse de solidarité' },
  { key: 'NATURE', label: 'Tontine en Nature', desc: 'Cagnotte distribuée en biens ou produits (Moto, Pagnes, Vivres...)' },
] as const;

const frequencies = [
  { key: 'DAILY', label: 'Journalier', desc: 'Chaque jour' },
  { key: 'WEEKLY', label: 'Hebdomadaire', desc: 'Chaque semaine' },
  { key: 'MONTHLY', label: 'Mensuel', desc: 'Chaque mois' },
  { key: 'CUSTOM', label: 'Personnalisé', desc: 'Intervalle sur mesure' },
] as const;

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
  const [presidentPhone, setPresidentPhone] = useState('70 12 34 56');

  // Règles du Président
  const [exclusionThreshold, setExclusionThreshold] = useState('3');
  const [depositRequired, setDepositRequired] = useState(false);
  const [kycRequirement, setKycRequirement] = useState('REQUIRE_CNIB_SELFIE');
  const [leavingRule, setLeavingRule] = useState('BUYOUT_REQUIRED');
  const [conditions, setConditions] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');

  // Blocage KYC si non vérifié (simulation utilisateur non certifié pour tester la modale)
  const [isCreatorKycVerified, setIsCreatorKycVerified] = useState(false);
  const [showKycBlockModal, setShowKycBlockModal] = useState(false);

  const tontine = parseFloat(tontineAmount) || 0;
  const solidarity = parseFloat(solidarityAmount) || 0;
  const fee = parseFloat(managementFee) || 0;
  const total = tontine + solidarity + fee;

  const creationFee = 2000; // Frais de création plateforme

  const handleStep1Next = () => {
    // Check KYC status first
    if (!isCreatorKycVerified) {
      setShowKycBlockModal(true);
      return;
    }
    setStep(2);
  };

  const generateInviteCode = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    setInviteCode(prefix + suffix);
  };

  const handleSubmit = () => {
    Alert.alert(
      'Cercle créé !',
      'Votre cercle a été configuré avec succès. Vous en êtes le président.',
      [{ text: 'Accéder au cercle', onPress: () => router.replace('/(tabs)/circles') }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert émeraude */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.stepIndicatorText}>Étape {step} sur 4</Text>
          </View>

          <View style={styles.heroTextGroup}>
            <Text style={styles.heroTitle}>Créer un cercle</Text>
            <Text style={styles.heroSubtitle}>
              Configurez votre tontine ou caisse en quelques clics
            </Text>
          </View>

          {/* Barres de progression */}
          <View style={styles.progressRow}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[styles.progressBarSegment, s <= step && styles.progressBarActive]}
              />
            ))}
          </View>
        </View>

        {/* Formulaire emboîté fond crème */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {step === 1 && (
              <View style={styles.stepGroup}>
                <Text style={styles.sectionTitle}>1. Informations générales</Text>

                <Text style={styles.fieldLabel}>Nom du cercle *</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Ex: Tontine Commerçants Dassasgho"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.fieldLabel}>Type de cercle *</Text>
                <View style={styles.typeOptionsCol}>
                  {circleTypes.map((t) => (
                    <TouchableOpacity
                      key={t.key}
                      style={[styles.typeOptionCard, type === t.key && styles.typeOptionCardActive]}
                      onPress={() => setType(t.key)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.typeOptionHeader}>
                        <Text style={[styles.typeOptionTitle, type === t.key && styles.typeOptionTitleActive]}>
                          {t.label}
                        </Text>
                        {type === t.key && <BadgeCheck size={18} color="#074B36" />}
                      </View>
                      <Text style={[styles.typeOptionDesc, type === t.key && styles.typeOptionDescActive]}>
                        {t.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Saisie spécifique pour Tontine en Nature / Box */}
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
                        {naturePhotoUploaded ? '✔ Photo du lot ajoutée avec succès' : 'Prendre ou uploader une photo du lot'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}

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
                        <Text style={[styles.frequencyTitle, isSelected && styles.frequencyTitleActive]}>
                          {f.label}
                        </Text>
                        <Text style={[styles.frequencySub, isSelected && styles.frequencySubActive]}>
                          {f.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Champ Fréquence Personnalisée */}
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
                  onPress={handleStep1Next}
                >
                  <Text style={styles.primaryPillBtnText}>Continuer</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepGroup}>
                <Text style={styles.sectionTitle}>2. Cotisations & Dépôt du Président</Text>

                {(type === 'TONTINE_ONLY' || type === 'HYBRID' || type === 'NATURE') && (
                  <>
                    <Text style={styles.fieldLabel}>Cotisation Tontine (FCFA / tour) *</Text>
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

                {(type === 'SOLIDARITY_ONLY' || type === 'HYBRID') && (
                  <>
                    <Text style={styles.fieldLabel}>Cotisation Caisse Solidarité (FCFA) *</Text>
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

                <Text style={styles.fieldLabel}>Frais de gestion / Commission du Président (FCFA)</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Ex: 500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={managementFee}
                  onChangeText={setManagementFee}
                />

                <Text style={styles.fieldLabel}>Numéro Mobile Money du Président (pour recevoir les sous) *</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Ex: 70 12 34 56"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={presidentPhone}
                  onChangeText={setPresidentPhone}
                />

                <View style={styles.summaryTotalBox}>
                  <Text style={styles.summaryTotalLabel}>Cotisation totale par membre et par tour</Text>
                  <Text style={styles.summaryTotalAmount}>{formatXOF(total)}</Text>
                  <Text style={styles.summarySubNote}>Cotisation + Frais de gestion président inclus</Text>
                </View>

                <TouchableOpacity
                  style={[styles.primaryPillBtn, (!tontine && !solidarity) && styles.primaryPillBtnDisabled]}
                  disabled={!tontine && !solidarity}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.primaryPillBtnText}>Continuer</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepGroup}>
                <Text style={styles.sectionTitle}>3. Exigences d'adhésion & Sécurité</Text>

                <Text style={styles.fieldLabel}>Exigence de documents pour les membres *</Text>
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
                        {kycRequirement === opt.key && <BadgeCheck size={18} color="#074B36" />}
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
                        {leavingRule === rule.key && <BadgeCheck size={18} color="#074B36" />}
                      </View>
                      <Text style={[styles.typeOptionDesc, leavingRule === rule.key && styles.typeOptionDescActive]}>
                        {rule.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Seuil d'exclusion (retards autorisés)</Text>
                <View style={styles.pillsRow}>
                  {exclusionOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pillSelectBtn, exclusionThreshold === opt && styles.pillSelectBtnActive]}
                      onPress={() => setExclusionThreshold(opt)}
                    >
                      <Text style={[styles.pillSelectText, exclusionThreshold === opt && styles.pillSelectTextActive]}>
                        {opt} retards
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.switchBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchTitle}>Dépôt de garantie obligatoire</Text>
                    <Text style={styles.switchSub}>Le membre dépose 1 tour de cotisation d'avance</Text>
                  </View>
                  <Switch
                    value={depositRequired}
                    onValueChange={setDepositRequired}
                    trackColor={{ true: '#074B36' }}
                  />
                </View>

                <TouchableOpacity style={styles.primaryPillBtn} onPress={() => setStep(4)}>
                  <Text style={styles.primaryPillBtnText}>Continuer</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 4 && (
              <View style={styles.stepGroup}>
                <Text style={styles.sectionTitle}>4. Facturation & Confirmation</Text>

                {/* Informations de création & anti-spam */}
                <View style={styles.feeBanner}>
                  <ShieldCheck size={22} color="#074B36" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feeBannerTitle}>Frais de création de cercle : 2 000 F CFA</Text>
                    <Text style={styles.feeBannerSub}>
                      Ces frais uniques évitent la création de cercles fictifs et garantissent la sécurité.
                    </Text>
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Conditions particulières du cercle (Règlement)</Text>
                <TextInput
                  style={[styles.pillInput, styles.textAreaInput]}
                  placeholder="Ex: Versement au plus tard le 5 de chaque mois avant 18h. Tout retard entraîne 500 F de pénalité."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={conditions}
                  onChangeText={setConditions}
                />

                <View style={styles.recapCard}>
                  <Text style={styles.recapTitle}>Récapitulatif de votre cercle</Text>
                  <View style={styles.recapRow}>
                    <Text style={styles.recapLabel}>Nom :</Text>
                    <Text style={styles.recapVal}>{name}</Text>
                  </View>
                  <View style={styles.recapRow}>
                    <Text style={styles.recapLabel}>Type :</Text>
                    <Text style={styles.recapVal}>
                      {type === 'NATURE' ? 'Tontine en Nature / Box' : type === 'HYBRID' ? 'Hybride' : type === 'TONTINE_ONLY' ? 'Tontine' : 'Solidarité'}
                    </Text>
                  </View>
                  <View style={styles.recapRow}>
                    <Text style={styles.recapLabel}>Fréquence :</Text>
                    <Text style={styles.recapVal}>
                      {frequency === 'CUSTOM' ? `Tous les ${customDays} jours` : frequency}
                    </Text>
                  </View>
                  <View style={styles.recapRow}>
                    <Text style={styles.recapLabel}>Cotisation membre / tour :</Text>
                    <Text style={[styles.recapVal, { color: '#074B36', fontFamily: 'SoraBold' }]}>
                      {formatXOF(total)}
                    </Text>
                  </View>
                  <View style={styles.recapRow}>
                    <Text style={styles.recapLabel}>Exigence adhésion :</Text>
                    <Text style={styles.recapVal}>
                      {kycRequirement === 'REQUIRE_CNIB_SELFIE' ? 'CNIB + Selfie' : kycRequirement === 'REQUIRE_CNIB' ? 'CNIB seul' : 'Aucun doc'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryPillBtn} onPress={handleSubmit}>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.primaryPillBtnText}>Créer le cercle ({formatXOF(creationFee)})</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Modal de Blocage KYC pour la création de cercle */}
        <Modal visible={showKycBlockModal} animationType="fade" transparent={true}>
          <View style={styles.kycModalOverlay}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.kycModalCard}>
              <View style={styles.kycModalIconCircle}>
                <ShieldAlert size={40} color="#EF4444" />
              </View>
              <Text style={styles.kycModalTitle}>Vérification KYC requise</Text>
              <Text style={styles.kycModalText}>
                Pour des raisons de sécurité et d'anti-fraude, la création de cercle nécessite la vérification de votre identité (CNIB + Selfie facial).
              </Text>

              <TouchableOpacity
                style={styles.primaryPillBtn}
                onPress={() => {
                  setShowKycBlockModal(false);
                  router.push('/kyc-upload');
                }}
              >
                <BadgeCheck size={18} color="#FFFFFF" />
                <Text style={styles.primaryPillBtnText}>Vérifier mon identité (KYC)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kycModalCloseBtn}
                onPress={() => setShowKycBlockModal(false)}
              >
                <Text style={styles.kycModalCloseText}>Plus tard</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#36E395',
  },
  heroTextGroup: {
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBarActive: {
    backgroundColor: '#36E395',
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FAF7F1',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  stepGroup: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#074B36',
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  pillInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 52,
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#0F172A',
  },
  textAreaInput: {
    height: 100,
    paddingTop: 14,
    borderRadius: 20,
  },
  typeOptionsCol: {
    gap: 10,
  },
  typeOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  typeOptionCardActive: {
    borderColor: '#074B36',
    backgroundColor: 'rgba(7, 75, 54, 0.04)',
  },
  typeOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeOptionTitle: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
  },
  typeOptionTitleActive: {
    color: '#074B36',
  },
  typeOptionDesc: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
  },
  typeOptionDescActive: {
    color: '#334155',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  frequencyCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  frequencyCardActive: {
    borderColor: '#074B36',
    backgroundColor: 'rgba(7, 75, 54, 0.05)',
  },
  frequencyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  frequencyTitleActive: {
    color: '#074B36',
  },
  frequencySub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  frequencySubActive: {
    color: '#074B36',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillSelectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  pillSelectBtnActive: {
    backgroundColor: '#074B36',
    borderColor: '#074B36',
  },
  pillSelectText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13,
    color: '#64748B',
  },
  pillSelectTextActive: {
    color: '#FFFFFF',
    fontFamily: 'WorkSansSemiBold',
  },
  summaryTotalBox: {
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#074B36',
    marginBottom: 4,
  },
  summaryTotalAmount: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#074B36',
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  switchTitle: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  switchSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryPillBtnDisabled: {
    opacity: 0.45,
  },
  primaryPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  recapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  recapTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#074B36',
    marginBottom: 4,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#64748B',
  },
  recapVal: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  natureBoxSection: {
    gap: 8,
    marginVertical: 4,
  },
  naturePhotoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    borderStyle: 'dashed',
  },
  naturePhotoCardDone: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderStyle: 'solid',
  },
  naturePhotoText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13,
    color: '#0F172A',
    flex: 1,
  },
  customFrequencyBox: {
    marginTop: 4,
  },
  summarySubNote: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#074B36',
    opacity: 0.8,
    marginTop: 2,
  },
  feeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(7, 75, 54, 0.15)',
  },
  feeBannerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#074B36',
  },
  feeBannerSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
  },
  kycModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  kycModalCard: {
    backgroundColor: '#FAF7F1',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  kycModalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  kycModalTitle: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  kycModalText: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  kycModalCloseBtn: {
    paddingVertical: 10,
    marginTop: 6,
  },
  kycModalCloseText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13.5,
    color: '#64748B',
  },
});
