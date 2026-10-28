import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radius, typography } from '@venega/design-tokens';
import { Button, IconButton } from '../../../components/ui';

const CODE_LENGTH = 6;
const RESEND_DURATION = 45;

export default function OtpScreen() {
  const router = useRouter();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_DURATION);
  const [error, setError] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputsRef = useRef<(TextInputInstance | null)[]>([]);
  const shake = useSharedValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerShake = () => {
    setError(true);
    shake.value = withSequence(
      withTiming(-10, { duration: 60, easing: Easing.out(Easing.cubic) }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-5, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (error) setError(false);
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!code.every(Boolean)) { triggerShake(); return; }
    if (code.join('') !== '123456') { triggerShake(); return; }
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1200));
      router.replace('/profile-setup');
    } catch {
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setResendCooldown(RESEND_DURATION);
    setCode(Array(CODE_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
  };

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
            onPress={() => router.replace('/register')}
          />
        </View>

        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Vérification</Text>
            <Text style={styles.subtitle}>
              Saisissez le code à 6 chiffres envoyé par SMS au{' '}
              <Text style={styles.phone}>+226 70 12 34 56</Text>.
            </Text>

            <Animated.View style={[styles.codeRow, shakeStyle]}>
              {code.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    digit ? styles.codeBoxFilled : null,
                    focusedIndex === index && styles.codeBoxFocused,
                    error && styles.codeBoxError,
                  ]}
                >
                  <TextInput
                    ref={(ref) => { inputsRef.current[index] = ref; }}
                    style={styles.codeInput}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete={index === 0 ? 'sms-otp' : 'off'}
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                    accessibilityLabel={`Chiffre ${index + 1} sur ${CODE_LENGTH}`}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
                  />
                </View>
              ))}
            </Animated.View>

            {error ? (
              <Text style={styles.errorText}>Code incorrect. Réessayez avec 123456.</Text>
            ) : null}

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Vous n'avez rien reçu ? </Text>
              {resendCooldown > 0 ? (
                <Text style={styles.resendCooldown}>Renvoyer dans {formatCooldown(resendCooldown)}</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} hitSlop={10} activeOpacity={0.6}>
                  <Text style={styles.resendLink}>Renvoyer le code</Text>
                </TouchableOpacity>
              )}
            </View>

            <Button title="Confirmer" onPress={handleVerify} loading={isLoading} style={styles.cta} />
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Mauvais numéro ? </Text>
            <TouchableOpacity onPress={() => router.replace('/register')} hitSlop={8} activeOpacity={0.6}>
              <Text style={styles.footerLink}>Modifier</Text>
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
  phone: {
    fontWeight: '600',
    color: colors.ink,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeBox: {
    flex: 1,
    height: 56,
    maxWidth: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxFilled: {
    borderColor: colors.inkSoft,
  },
  codeBoxFocused: {
    borderColor: colors.primary.DEFAULT,
    borderWidth: 1.5,
  },
  codeBoxError: {
    borderColor: colors.danger.DEFAULT,
    borderWidth: 1.5,
  },
  codeInput: {
    width: '100%',
    height: '100%',
    ...typography.title,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
    paddingVertical: 0,
  },
  errorText: {
    ...typography.footnote,
    color: colors.danger.DEFAULT,
    marginTop: 10,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  resendText: {
    ...typography.callout,
    color: colors.muted,
  },
  resendCooldown: {
    ...typography.callout,
    color: colors.subtle,
  },
  resendLink: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  cta: {
    marginTop: 32,
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
