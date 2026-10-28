import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button, IconButton, TextField } from '../../../components/ui';

const MIN_PASSWORD = 8;

type Errors = { phone?: string; password?: string; confirm?: string; form?: string };

export default function RegisterScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const next: Errors = {};
    if (phone.replace(/\D/g, '').length !== 8) next.phone = 'Entrez un numéro à 8 chiffres.';
    if (password.length < MIN_PASSWORD) next.password = `Au moins ${MIN_PASSWORD} caractères.`;
    if (password !== confirmPassword) next.confirm = 'Les mots de passe ne correspondent pas.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1200));
      router.push('/otp');
    } catch (e) {
      setErrors({ form: 'Une erreur est survenue. Réessayez.' });
    } finally {
      setIsLoading(false);
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
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
          />
        </View>

        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Un code de vérification sera envoyé par SMS à ce numéro.</Text>

            <View style={styles.form}>
              <TextField
                label="Numéro de téléphone"
                prefix="+226"
                placeholder="70 12 34 56"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
              />
              <TextField
                label="Mot de passe"
                placeholder="Choisissez un mot de passe"
                password
                autoComplete="new-password"
                textContentType="newPassword"
                value={password}
                onChangeText={setPassword}
                hint={`${MIN_PASSWORD} caractères minimum`}
                error={errors.password}
              />
              <TextField
                label="Confirmer le mot de passe"
                placeholder="Saisissez-le à nouveau"
                password
                autoComplete="new-password"
                textContentType="newPassword"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirm}
              />

              {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

              <Button title="Continuer" onPress={handleRegister} loading={isLoading} style={styles.cta} />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')} hitSlop={8} activeOpacity={0.6}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  formError: {
    ...typography.footnote,
    color: colors.danger.DEFAULT,
  },
  cta: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  footerText: {
    ...typography.callout,
    color: colors.muted,
  },
  footerLink: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
});
