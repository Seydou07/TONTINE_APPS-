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
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button, IconButton, Sheet, TextField } from '../../../components/ui';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Aminata Ouédraogo');
  const phone = '70 12 34 56';
  const [email, setEmail] = useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('70 12 34 56');
  const [showSuccess, setShowSuccess] = useState(false);

  const nameParts = fullName.trim().split(/\s+/);
  const initials = ((nameParts[0]?.[0] ?? '') + (nameParts[1]?.[0] ?? '')).toUpperCase() || 'A';

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer votre nom complet.');
      return;
    }
    setShowSuccess(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <IconButton
            icon={ArrowLeft}
            variant="plain"
            accessibilityLabel="Retour"
            onPress={() => router.replace('/otp')}
          />
        </View>

        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Votre profil</Text>
            <Text style={styles.subtitle}>Ces informations apparaissent auprès des membres de vos cercles.</Text>

            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => Alert.alert('Photo de profil', 'Changement de photo simulé avec succès.')}
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
                onChangeText={setFullName}
              />
              <TextField
                label="Adresse e-mail"
                placeholder="nom@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
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
                value={mobileMoneyNumber}
                onChangeText={setMobileMoneyNumber}
                hint="Utilisé pour vos cotisations et versements"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Terminer" onPress={handleSave} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Sheet visible={showSuccess} onClose={() => router.replace('/login')}>
        <View style={styles.sheetBody}>
          <View style={styles.successIcon}>
            <Check size={24} color={colors.primary.DEFAULT} strokeWidth={2.5} />
          </View>
          <Text style={styles.sheetTitle}>Compte créé</Text>
          <Text style={styles.sheetText}>Bienvenue dans Venega. Vous pouvez maintenant vous connecter.</Text>
        </View>
        <Button title="Se connecter" onPress={() => router.replace('/login')} />
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
