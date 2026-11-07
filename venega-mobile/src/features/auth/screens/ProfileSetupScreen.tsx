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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button, IconButton, Sheet, TextField } from '../../../components/ui';
import { ApiError } from '../../../lib/api';
import { getProfile, setMobileMoneyNumber as saveMobileMoneyNumber } from '../../profile/profileStore';
import { getCurrentUser } from '../../circles/circleStore';
import { saveDisplayName } from '../api';
import { formatPhone, validatePhone } from '../validation';

export default function ProfileSetupScreen() {
  const router = useRouter();
  // `onboarding=1` : fin de l'inscription (après le code SMS). Sinon : « Modifier le profil » depuis le Profil.
  const params = useLocalSearchParams<{ phone?: string; onboarding?: string }>();
  const isOnboarding = params.onboarding === '1';
  const phone = formatPhone(params.phone || getCurrentUser().phoneNumber.replace(/^\+?226/, ''));
  const [fullName, setFullName] = useState(getProfile().name);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState(getProfile().mobileMoneyNumber || phone);
  const [momoError, setMomoError] = useState<string>();
  const [showSuccess, setShowSuccess] = useState(false);

  const validateFullName = (v: string) =>
    v.trim().split(/\s+/).filter((p) => p.length >= 2).length >= 2 ? undefined : 'Indiquez votre prénom et votre nom.';
  const validateEmail = (v: string) =>
    !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : 'Adresse e-mail invalide.';

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const nameParts = fullName.trim().split(/\s+/);
  const initials = ((nameParts[0]?.[0] ?? '') + (nameParts[1]?.[0] ?? '')).toUpperCase() || 'A';

  const handleSave = async () => {
    const errors = {
      name: validateFullName(fullName),
      email: validateEmail(email),
      momo: validatePhone(mobileMoneyNumber),
    };
    setNameError(errors.name);
    setEmailError(errors.email);
    setMomoError(errors.momo);
    if (errors.name || errors.email || errors.momo) return;
    setSaving(true);
    try {
      await saveDisplayName(fullName);
      saveMobileMoneyNumber(mobileMoneyNumber);
      if (isOnboarding) setShowSuccess(true);
      else goBack();
    } catch (e) {
      Alert.alert('Erreur', e instanceof ApiError ? e.message : 'Le profil n’a pas pu être enregistré.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <IconButton
            icon={ArrowLeft}
            variant="plain"
            accessibilityLabel="Retour"
            onPress={() => (isOnboarding ? router.replace('/(tabs)') : goBack())}
          />
        </View>

        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>{isOnboarding ? 'Votre profil' : 'Modifier le profil'}</Text>
            <Text style={styles.subtitle}>Ces informations apparaissent auprès des membres de vos cercles.</Text>

            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => router.push('/profile-photo')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Ajouter une photo de profil"
              >
                <Camera size={16} color={colors.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextField
                label="Nom complet"
                placeholder="Prénom et nom"
                autoComplete="name"
                textContentType="name"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  if (nameError) setNameError(validateFullName(v));
                }}
                error={nameError}
              />
              <TextField
                label="Adresse e-mail"
                placeholder="nom@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError(validateEmail(v));
                }}
                error={emailError}
                hint="Facultatif"
              />
              <TextField
                label="Numéro de téléphone"
                prefix="+226"
                value={phone}
                editable={false}
                style={styles.readonly}
                hint="Vérifié par SMS"
              />
              <TextField
                label="Numéro Mobile Money"
                prefix="+226"
                placeholder="70 12 34 56"
                keyboardType="phone-pad"
                maxLength={11}
                value={mobileMoneyNumber}
                onChangeText={(v) => {
                  const formatted = formatPhone(v);
                  setMobileMoneyNumber(formatted);
                  if (momoError) setMomoError(validatePhone(formatted));
                }}
                error={momoError}
                hint="Utilisé pour vos cotisations et versements"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title={isOnboarding ? 'Terminer' : 'Enregistrer'} onPress={handleSave} loading={saving} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Sheet visible={showSuccess} onClose={() => router.replace('/(tabs)')}>
        <View style={styles.sheetBody}>
          <View style={styles.successIcon}>
            <Check size={24} color={colors.primary.DEFAULT} strokeWidth={2.5} />
          </View>
          <Text style={styles.sheetTitle}>Compte créé</Text>
          <Text style={styles.sheetText}>Bienvenue dans Venega. Vous pouvez créer ou rejoindre un cercle.</Text>
        </View>
        <Button title="Commencer" onPress={() => router.replace('/(tabs)')} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    height: 56,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    ...typography.display,
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
  },
  subtitle: {
    ...typography.callout,
    color: colors.muted,
    marginTop: 8,
    marginBottom: 28,
  },
  avatarWrap: {
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    ...typography.title,
    color: colors.primary.dark,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 20,
  },
  readonly: {
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  sheetBody: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 24,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    ...typography.headline,
    color: colors.ink,
  },
  sheetText: {
    ...typography.callout,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
