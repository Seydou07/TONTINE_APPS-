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
import { colors, typography } from '@venega/design-tokens';
import { Button, TextField } from '../../../components/ui';
import { ApiError } from '../../../lib/api';
import { login } from '../api';
import SocialButtons from '../components/SocialButtons';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Renseignez votre numéro et votre mot de passe.');
      return;
    }
    if (phone.replace(/\D/g, '').length !== 8) {
      setError('Entrez un numéro à 8 chiffres.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(phone, password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Se connecter</Text>

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
              />

              <View>
                <TextField
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  password
                  autoComplete="password"
                  textContentType="password"
                  value={password}
                  onChangeText={setPassword}
                  error={error || undefined}
                />
                <TouchableOpacity style={styles.forgot} hitSlop={8} activeOpacity={0.6}>
                  <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
              </View>

              <Button title="Se connecter" onPress={handleLogin} loading={isLoading} />
            </View>

            <SocialButtons />
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/register')} hitSlop={8} activeOpacity={0.6}>
              <Text style={styles.footerLink}>Créer un compte</Text>
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
  // Contenu centré verticalement, légèrement remonté (padding bas > haut).
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 72,
  },
  title: {
    ...typography.display,
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
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
