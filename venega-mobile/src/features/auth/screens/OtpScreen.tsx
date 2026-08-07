import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors, spacing, radius } from '@venega/design-tokens';

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

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
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500));
      router.replace('/profile-setup');
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setResendCooldown(30);
    console.log('Resending OTP...');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowRight size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <CheckCircle2 size={32} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.title}>Vérification</Text>
            <Text style={styles.subtitle}>
              Nous avons envoyé un code à 6 chiffres au +226 70 12 34 56
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.codeContainer}
          >
            <View style={styles.codeRow}>
              {code.map((digit, index) => (
                <View key={index} style={styles.codeInputContainer}>
                  <TextInput
                    ref={(ref) => {
                      inputsRef.current[index] = ref;
                    }}
                    style={styles.codeInput}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(index, value)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(index, nativeEvent.key)
                    }
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(300).duration(600)}
            style={styles.resendContainer}
          >
            <Text style={styles.resendText}>Vous n'avez pas reçu le code ? </Text>
            {resendCooldown > 0 ? (
              <Text style={styles.resendCooldownText}>Réessayez dans {resendCooldown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLinkText}>Renvoyer le code</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (isLoading || !code.every(Boolean)) &&
                  styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={isLoading || !code.every(Boolean)}
            >
              <Text style={styles.verifyButtonText}>
                {isLoading ? 'Vérification en cours...' : 'Vérifier'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Sora',
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'WorkSans',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing[2],
  },
  codeContainer: {
    marginBottom: spacing[6],
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeInputContainer: {
    width: 48,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'Sora',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing[6],
  },
  resendText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'WorkSans',
  },
  resendCooldownText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'WorkSans',
  },
  resendLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
    fontFamily: 'WorkSans',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: spacing[4],
  },
  verifyButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing[4],
    borderRadius: radius.md,
    alignItems: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'WorkSans',
  },
});
