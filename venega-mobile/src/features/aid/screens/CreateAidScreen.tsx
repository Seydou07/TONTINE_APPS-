import React, { useCallback, useState } from 'react';
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
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  CalendarRange,
  Check,
  ChevronRight,
  Copy,
  ImagePlus,
  Link2,
  ShieldAlert,
  ShieldCheck,
  Share2,
  X,
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, typography } from '@venega/design-tokens';
import { KycStatus, PayoutNumberStatus } from '@venega/types';
import type { AidAppeal, Circle } from '@venega/types';
import {
  createAidAppeal,
  formatLongDay,
  getAidShareLink,
  getCurrentUser,
  getOrganizerPayoutNumber,
  parseDay,
  toDayString,
} from '../../circles/circleStore';
import { formatPhone, validatePhone } from '../../auth/validation';
import {
  Button,
  Chip,
  DatePickerSheet,
  IconButton,
  OptionCard,
  SettingRow,
  TextField,
  Toggle,
} from '../../../components/ui';

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F';
const toNumber = (v: string) => Number(v.replace(/\D/g, '')) || 0;

const GOAL_PRESETS = [100000, 250000, 500000, 1000000];
const DURATIONS = [7, 15, 30];
const DAY_MS = 86400000;
/** Date de fin à J+n (« 2026-12-12 »). */
const inDays = (n: number) => toDayString(new Date(Date.now() + n * DAY_MS));
/** « 70123456 » → « 70 12 34 56 » */
const spaced = (digits: string) => digits.replace(/(\d{2})(?=\d)/g, '$1 ');
const MIN_GOAL = 10000;
const MIN_STORY = 30;

/** Lancer une cagnotte d'aide publique : un lien à partager, payable même sans l'application. */
export default function CreateAidScreen() {
  const router = useRouter();
  // Relu au retour du parcours KYC.
  const [verified, setVerified] = useState(getCurrentUser().kycStatus === KycStatus.VERIFIED);
  useFocusEffect(
    useCallback(() => {
      setVerified(getCurrentUser().kycStatus === KycStatus.VERIFIED);
    }, []),
  );

  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [phone, setPhone] = useState('');
  const [story, setStory] = useState('');
  const [goalText, setGoalText] = useState('');
  // Date de fin facultative : sans date, la collecte reste ouverte jusqu'à sa clôture.
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<string>(inDays(30));
  const [showCalendar, setShowCalendar] = useState(false);
  // Numéro qui reçoit l'argent : par défaut, celui (vérifié) de l'organisateur.
  const ownNumber = getOrganizerPayoutNumber();
  const [useOwnNumber, setUseOwnNumber] = useState(ownNumber.length === 8);
  const [created, setCreated] = useState<{ circle: Circle; appeal: AidAppeal } | null>(null);

  const goal = toNumber(goalText);
  const phoneDigits = phone.replace(/\D/g, '');

  // Erreurs sous les champs, affichées à l'envoi puis effacées dès que la saisie est corrigée.
  type Field = 'title' | 'beneficiary' | 'phone' | 'story' | 'goal';
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const rules: Record<Field, (v: string) => string | undefined> = {
    title: (v) => (v.trim().length >= 5 ? undefined : 'Le titre doit contenir au moins 5 caractères.'),
    beneficiary: (v) => (v.trim().length >= 2 ? undefined : 'Indiquez le nom de la personne aidée.'),
    phone: (v) => (useOwnNumber ? undefined : validatePhone(v)),
    story: (v) => (v.trim().length >= MIN_STORY ? undefined : `Expliquez la situation en au moins ${MIN_STORY} caractères.`),
    goal: (v) => (toNumber(v) >= MIN_GOAL ? undefined : `Minimum ${formatXOF(MIN_GOAL)}`),
  };
  const values: Record<Field, string> = { title, beneficiary, phone, story, goal: goalText };
  const change = (field: Field, setter: (v: string) => void, transform?: (v: string) => string) => (raw: string) => {
    const v = transform ? transform(raw) : raw;
    setter(v);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: rules[field](v) }));
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Accès à la galerie requis', 'Autorisez l’accès à vos photos pour illustrer la cagnotte.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const submit = () => {
    if (!verified) return;
    const found: Partial<Record<Field, string>> = {};
    (Object.keys(rules) as Field[]).forEach((f) => {
      found[f] = rules[f](values[f]);
    });
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    // TODO: envoyer à l'API (création + modération) ; la photo doit être téléversée, pas une URI locale.
    const result = createAidAppeal({
      title: title.trim(),
      beneficiaryName: beneficiary.trim(),
      // Le statut du numéro (vérifié / à vérifier) est décidé par le store, pas par l'écran.
      beneficiaryNumber: `+226 ${spaced(useOwnNumber ? ownNumber : phoneDigits)}`,
      reason: story.trim(),
      goalAmount: goal,
      deadline: hasEndDate ? `${endDate}T23:59:59` : undefined,
      beneficiaryPhoto: photo ?? undefined,
    });
    setCreated(result);
  };

  if (created) {
    return (
      <CreatedView
        circle={created.circle}
        pendingReview={created.appeal.payoutNumberStatus === PayoutNumberStatus.PENDING_REVIEW}
        onOpen={() => router.replace(`/aid/${created.circle.id}` as any)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Lancer une cagnotte</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.intro}>
              Collectez pour une personne dans le besoin. Vous recevez un lien à partager : chacun peut donner, avec son
              nom ou anonymement, même sans l’application.
            </Text>

            {!verified && (
              <View style={styles.kycNotice}>
                <ShieldCheck size={20} color={colors.accent.dark} />
                <View style={styles.flex}>
                  <Text style={styles.kycTitle}>Vérifiez votre identité d’abord</Text>
                  <Text style={styles.kycText}>
                    Pour protéger les donateurs, seules les personnes vérifiées peuvent lancer une cagnotte.
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/kyc-intro')} hitSlop={8} activeOpacity={0.6}>
                    <Text style={styles.kycLink}>Vérifier mon identité</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Photo */}
            <TouchableOpacity
              style={[styles.photoTile, photo && styles.photoTileFilled]}
              onPress={pickPhoto}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une photo"
            >
              {photo ? (
                <>
                  <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => setPhoto(null)}
                    hitSlop={8}
                    accessibilityLabel="Retirer la photo"
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.photoIcon}>
                    <ImagePlus size={22} color={colors.primary.DEFAULT} />
                  </View>
                  <Text style={styles.photoText}>Ajouter une photo</Text>
                  <Text style={styles.photoHint}>Une photo augmente la confiance des donateurs</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.fields}>
              <TextField
                label="Titre de la cagnotte"
                placeholder="Ex. Soins de dialyse pour Mariam"
                value={title}
                onChangeText={change('title', setTitle)}
                error={errors.title}
                maxLength={70}
              />
              <TextField
                label="Pour qui ?"
                placeholder="Nom de la personne aidée"
                value={beneficiary}
                onChangeText={change('beneficiary', setBeneficiary)}
                error={errors.beneficiary}
                maxLength={60}
              />
              <View>
                <Text style={styles.label}>Numéro qui reçoit l’argent</Text>
                <View style={styles.stack}>
                  {ownNumber.length === 8 && (
                    <OptionCard
                      title="Mon numéro Mobile Money"
                      description={`+226 ${spaced(ownNumber)} · numéro vérifié de votre compte`}
                      badge="Recommandé"
                      selected={useOwnNumber}
                      onPress={() => {
                        setUseOwnNumber(true);
                        setErrors((e) => ({ ...e, phone: undefined }));
                      }}
                    />
                  )}
                  <OptionCard
                    title="Un autre numéro"
                    description="Par exemple celui de la personne aidée"
                    selected={!useOwnNumber}
                    onPress={() => setUseOwnNumber(false)}
                  />
                </View>
                {!useOwnNumber && (
                  <Animated.View entering={FadeIn.duration(240)} style={styles.otherNumber}>
                    <TextField
                      label="Numéro Mobile Money"
                      prefix="+226"
                      placeholder="70 12 34 56"
                      keyboardType="phone-pad"
                      maxLength={11}
                      value={phone}
                      onChangeText={change('phone', setPhone, formatPhone)}
                      error={errors.phone}
                    />
                    <View style={styles.reviewNotice}>
                      <ShieldAlert size={18} color={colors.accent.dark} />
                      <Text style={styles.reviewText}>
                        <Text style={styles.reviewStrong}>Numéro à vérifier. </Text>
                        L’équipe Venega contrôle ce numéro avant tout versement. La cagnotte est en ligne tout de
                        suite, mais l’argent ne part qu’après ce contrôle : c’est ce qui protège les donateurs.
                      </Text>
                    </View>
                  </Animated.View>
                )}
              </View>
              <TextField
                label="Son histoire"
                placeholder="Expliquez la situation et à quoi servira l’argent."
                multiline
                value={story}
                onChangeText={change('story', setStory)}
                error={errors.story}
                maxLength={1000}
                hint={
                  story.trim().length < MIN_STORY
                    ? `Encore ${MIN_STORY - story.trim().length} caractères minimum`
                    : `${story.trim().length} / 1000`
                }
              />

              <View>
                <TextField
                  label="Objectif"
                  suffix="F CFA"
                  placeholder="500 000"
                  keyboardType="number-pad"
                  value={goal ? new Intl.NumberFormat('fr-FR').format(goal) : ''}
                  onChangeText={change('goal', setGoalText)}
                  error={errors.goal ?? (goalText && goal < MIN_GOAL ? `Minimum ${formatXOF(MIN_GOAL)}` : undefined)}
                />
                <View style={styles.chips}>
                  {GOAL_PRESETS.map((g) => (
                    <Chip key={g} label={formatXOF(g)} selected={goal === g} onPress={() => change('goal', setGoalText)(String(g))} />
                  ))}
                </View>
              </View>

              <View style={styles.group}>
                <SettingRow
                  title="Date de fin"
                  description={
                    hasEndDate
                      ? `Collecte ouverte jusqu’au ${formatLongDay(parseDay(endDate)!)}`
                      : 'Facultative : sans date, la collecte reste ouverte'
                  }
                  last={!hasEndDate}
                >
                  <Toggle value={hasEndDate} onValueChange={setHasEndDate} />
                </SettingRow>
                {hasEndDate && (
                  <Animated.View entering={FadeIn.duration(240)} style={styles.endDate}>
                    <View style={styles.chipsTight}>
                      {DURATIONS.map((d) => (
                        <Chip
                          key={d}
                          label={`${d} jours`}
                          selected={endDate === inDays(d)}
                          onPress={() => setEndDate(inDays(d))}
                        />
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.dateRow}
                      activeOpacity={0.7}
                      onPress={() => setShowCalendar(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Choisir une autre date de fin"
                    >
                      <CalendarRange size={18} color={colors.primary.DEFAULT} />
                      <Text style={styles.dateText}>Choisir une autre date</Text>
                      <ChevronRight size={18} color={colors.subtle} />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </View>

            <View style={styles.notice}>
              <ShieldCheck size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.noticeText}>
                L’argent est bloqué sur la cagnotte et versé au bénéficiaire uniquement après validation par les
                approbateurs. Chaque donateur choisit d’afficher son nom ou de rester anonyme.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Lancer la cagnotte" disabled={!verified} onPress={submit} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <DatePickerSheet
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        title="Fin de la collecte"
        value={endDate}
        minDate={inDays(1)}
        onConfirm={(d) => {
          setEndDate(d);
          setShowCalendar(false);
        }}
      />
    </View>
  );
}

function CreatedView({ circle, pendingReview, onOpen }: { circle: Circle; pendingReview: boolean; onOpen: () => void }) {
  const link = getAidShareLink(circle);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () =>
    Share.share({
      message: `${circle.name}\nAidez-nous en contribuant à cette cagnotte, avec votre nom ou anonymement :\n${link}`,
    }).catch(() => {});

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.createdScroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.createdHero}>
            <View style={styles.createdIcon}>
              <Check size={32} color={colors.primary.DEFAULT} strokeWidth={2.5} />
            </View>
            <Text style={styles.createdTitle}>Votre cagnotte est en ligne</Text>
            <Text style={styles.createdName}>{circle.name}</Text>
          </Animated.View>

          <View style={styles.linkCard}>
            <View style={styles.linkRow}>
              <View style={styles.linkIcon}>
                <Link2 size={18} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.link} numberOfLines={1}>
                {link}
              </Text>
            </View>
            <Text style={styles.linkHint}>
              Partagez ce lien sur WhatsApp, Facebook ou par SMS. Il s’ouvre dans le navigateur, sans installer
              l’application.
            </Text>
            <View style={styles.linkActions}>
              <Button
                title={copied ? 'Copié' : 'Copier le lien'}
                icon={copied ? Check : Copy}
                variant="secondary"
                size="sm"
                onPress={copy}
                style={styles.flex}
              />
              <Button title="Partager" icon={Share2} size="sm" onPress={share} style={styles.flex} />
            </View>
          </View>

          {pendingReview && (
            <View style={[styles.reviewNotice, styles.reviewNoticeCreated]}>
              <ShieldAlert size={18} color={colors.accent.dark} />
              <Text style={styles.reviewText}>
                <Text style={styles.reviewStrong}>Numéro à vérifier. </Text>
                Les dons sont acceptés dès maintenant, mais aucun versement ne partira avant que l’équipe Venega ait
                contrôlé le numéro de réception.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Voir la cagnotte" variant="secondary" onPress={onOpen} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSpacer: { width: 40 },

  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
  intro: { ...typography.callout, color: colors.muted, marginBottom: 20 },

  kycNotice: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.accent.tint,
    marginBottom: 20,
  },
  kycTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  kycText: { ...typography.footnote, color: colors.inkSoft, marginTop: 2 },
  kycLink: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT, marginTop: 8 },

  photoTile: {
    height: 168,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
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

  fields: { gap: 20, marginTop: 24 },
  label: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft, marginBottom: 8 },
  stack: { gap: 10 },
  otherNumber: { marginTop: 16, gap: 12 },
  reviewNotice: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.accent.tint,
  },
  reviewNoticeCreated: { marginTop: 16 },
  reviewText: { flex: 1, ...typography.footnote, color: colors.inkSoft },
  reviewStrong: { fontWeight: '700', color: colors.accent.dark },
  group: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16 },
  endDate: { paddingBottom: 16, gap: 12 },
  chipsTight: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  dateText: { flex: 1, ...typography.callout, fontWeight: '500', color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },

  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary.tint,
    marginTop: 24,
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
  linkCard: { padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: { flex: 1, ...typography.callout, fontWeight: '600', color: colors.ink },
  linkHint: { ...typography.footnote, color: colors.muted, marginTop: 12 },
  linkActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
