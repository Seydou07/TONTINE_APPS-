import React, { useRef, useState } from 'react';
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
import type { TextInputInstance } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button, FormAlert, IconButton, TextField } from '../../../components/ui';
import { ApiError } from '../../../lib/api';
import { register } from '../api';
import {
  MIN_PASSWORD,
  formatPhone,
  phoneDigits,
  validateConfirm,
  validateName,
  validateNewPassword,
  validatePhone,
} from '../validation';

type Field = 'firstName' | 'lastName' | 'phone' | 'password' | 'confirm';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const FIELDS: Field[] = ['firstName', 'lastName', 'phone', 'password', 'confirm'];

function validate(field: Field, v: Values): string | undefined {
  switch (field) {
    case 'firstName':
      return validateName(v.firstName, 'prénom');
    case 'lastName':
      return validateName(v.lastName, 'nom');
    case 'phone':
      return validatePhone(v.phone);
    case 'password':
      return validateNewPassword(v.password);
    case 'confirm':
      return validateConfirm(v.password, v.confirm);
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const refs = {
    firstName: useRef<TextInputInstance>(null),
    lastName: useRef<TextInputInstance>(null),
    phone: useRef<TextInputInstance>(null),
    password: useRef<TextInputInstance>(null),
    confirm: useRef<TextInputInstance>(null),
  };
  const [values, setValues] = useState<Values>({ firstName: '', lastName: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Une erreur affichée disparaît dès que la saisie redevient valide.
  const change = (field: Field) => (raw: string) => {
    const next = { ...values, [field]: field === 'phone' ? formatPhone(raw) : raw };
    setValues(next);
    setFormError('');
    setErrors((e) => {
      const updated = { ...e };
      if (e[field]) updated[field] = validate(field, next);
      // Changer le mot de passe peut corriger (ou casser) la confirmation déjà saisie.
      if (field === 'password' && e.confirm) updated.confirm = validate('confirm', next);
      return updated;
    });
  };

  // On ne signale une erreur en quittant un champ que s'il a été rempli.
  const blur = (field: Field) => () => {
    if (values[field]) setErrors((e) => ({ ...e, [field]: validate(field, values) }));
  };

  const handleRegister = async () => {
    const next: Errors = {};
    for (const f of FIELDS) next[f] = validate(f, values);
    setErrors(next);
    const firstInvalid = FIELDS.find((f) => next[f]);
    if (firstInvalid) return refs[firstInvalid].current?.focus();

    setFormError('');
    setIsLoading(true);
    try {
      await register({
        phone: values.phone,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      router.push({ pathname: '/otp', params: { phone: phoneDigits(values.phone) } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setErrors((prev) => ({ ...prev, phone: e.message }));
        refs.phone.current?.focus();
      } else {
        setFormError(e instanceof ApiError ? e.message : 'Une erreur est survenue. Réessayez.');
      }
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
              <View style={styles.nameRow}>
                <TextField
                  label="Prénom"
                  placeholder="Aminata"
                  autoComplete="given-name"
                  textContentType="givenName"
                  autoCapitalize="words"
                  returnKeyType="next"
                  value={values.firstName}
                  onChangeText={change('firstName')}
                  onBlur={blur('firstName')}
                  onSubmitEditing={() => refs.lastName.current?.focus()}
                  error={errors.firstName}
                  ref={refs.firstName}
                  containerStyle={styles.nameField}
                />
                <TextField
                  label="Nom"
                  placeholder="Ouédraogo"
                  autoComplete="family-name"
                  textContentType="familyName"
                  autoCapitalize="words"
                  returnKeyType="next"
                  value={values.lastName}
                  onChangeText={change('lastName')}
                  onBlur={blur('lastName')}
                  onSubmitEditing={() => refs.phone.current?.focus()}
                  error={errors.lastName}
                  ref={refs.lastName}
                  containerStyle={styles.nameField}
                />
              </View>
              <TextField
                label="Numéro de téléphone"
                prefix="+226"
                placeholder="70 12 34 56"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={11}
                returnKeyType="next"
                value={values.phone}
                onChangeText={change('phone')}
                onBlur={blur('phone')}
                onSubmitEditing={() => refs.password.current?.focus()}
                error={errors.phone}
                ref={refs.phone}
              />
              <TextField
                label="Mot de passe"
                placeholder="Choisissez un mot de passe"
                password
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                value={values.password}
                onChangeText={change('password')}
                onBlur={blur('password')}
                onSubmitEditing={() => refs.confirm.current?.focus()}
                hint={`${MIN_PASSWORD} caractères minimum`}
                error={errors.password}
                ref={refs.password}
              />
              <TextField
                label="Confirmer le mot de passe"
                placeholder="Saisissez-le à nouveau"
                password
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                value={values.confirm}
                onChangeText={change('confirm')}
                onBlur={blur('confirm')}
                onSubmitEditing={handleRegister}
                error={errors.confirm}
                ref={refs.confirm}
              />

              <FormAlert message={formError} />

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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
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
