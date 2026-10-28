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
import { ArrowLeft, Check, Copy, ImagePlus, Link2, ShieldCheck, Share2, X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, typography } from '@venega/design-tokens';
import { KycStatus } from '@venega/types';
import type { Circle } from '@venega/types';
import { createAidAppeal, getAidShareLink, getCurrentUser } from '../../circles/circleStore';
import { Button, Chip, IconButton, TextField } from '../../../components/ui';

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F';
const toNumber = (v: string) => Number(v.replace(/\D/g, '')) || 0;

const GOAL_PRESETS = [100000, 250000, 500000, 1000000];
const DURATIONS: { label: string; days: number | null }[] = [
  { label: '7 jours', days: 7 },
  { label: '15 jours', days: 15 },
  { label: '30 jours', days: 30 },
  { label: 'Sans limite', days: null },
];
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
  const [days, setDays] = useState<number | null>(30);
  const [created, setCreated] = useState<Circle | null>(null);

  const goal = toNumber(goalText);
  const phoneDigits = phone.replace(/\D/g, '');
  const canSubmit =
    verified &&
    title.trim().length >= 5 &&
    beneficiary.trim().length >= 2 &&
    phoneDigits.length === 8 &&
    story.trim().length >= MIN_STORY &&
    goal >= MIN_GOAL;

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
    if (!canSubmit) return;
    // TODO: envoyer à l'API (création + modération) ; la photo doit être téléversée, pas une URI locale.
    const { circle } = createAidAppeal({
      title: title.trim(),
      beneficiaryName: beneficiary.trim(),
      beneficiaryNumber: `+226 ${phoneDigits.replace(/(\d{2})(?=\d)/g, '$1 ')}`,
      reason: story.trim(),
      goalAmount: goal,
      deadline: days ? new Date(Date.now() + days * 86400000).toISOString() : undefined,
      beneficiaryPhoto: photo ?? undefined,
    });
    setCreated(circle);
  };

  if (created) {
    return <CreatedView circle={created} onOpen={() => router.replace(`/aid/${created.id}` as any)} />;
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
                onChangeText={setTitle}
                maxLength={70}
              />
              <TextField
                label="Pour qui ?"
                placeholder="Nom de la personne aidée"
                value={beneficiary}
                onChangeText={setBeneficiary}
                maxLength={60}
              />
              <TextField
                label="Numéro Mobile Money du bénéficiaire"
                prefix="+226"
                placeholder="70 12 34 56"
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
                hint="Les fonds y seront versés après validation."
              />
              <TextField
                label="Son histoire"
                placeholder="Expliquez la situation et à quoi servira l’argent."
                multiline
                value={story}
                onChangeText={setStory}
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
                  onChangeText={setGoalText}
                  error={goalText && goal < MIN_GOAL ? `Minimum ${formatXOF(MIN_GOAL)}` : undefined}
                />
                <View style={styles.chips}>
                  {GOAL_PRESETS.map((g) => (
                    <Chip key={g} label={formatXOF(g)} selected={goal === g} onPress={() => setGoalText(String(g))} />
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.label}>Durée de la collecte</Text>
                <View style={styles.chips}>
                  {DURATIONS.map((d) => (
                    <Chip key={d.label} label={d.label} selected={days === d.days} onPress={() => setDays(d.days)} />
                  ))}
                </View>
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
            <Button title="Lancer la cagnotte" disabled={!canSubmit} onPress={submit} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function CreatedView({ circle, onOpen }: { circle: Circle; onOpen: () => void }) {
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
