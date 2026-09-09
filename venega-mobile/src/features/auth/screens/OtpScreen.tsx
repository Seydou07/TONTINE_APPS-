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
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';

const logoImg = require('../../../../assets/venega-logo.png');
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const CODE_LENGTH = 6;
const RESEND_DURATION = 45;

export default function OtpScreen() {
  const router = useRouter();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_DURATION);
  const [error, setError] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputsRef = useRef<(TextInput | null)[]>([]);
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.content}>
            {/* ── Section logo (hero) moderne ── */}
            <View style={styles.heroSection}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/register')}>
                  <ArrowLeft size={20} color="#074B36" />
                </TouchableOpacity>
                <View style={{ width: 38 }} />
              </View>

              {/* Logo réel, bien visible */}
              <View style={styles.bigLogoWrap}>
                <Image source={logoImg} style={styles.bigLogoImg} contentFit="contain" />
              </View>

              <View style={styles.heroTextGroup}>
                <Text style={styles.heroTitle}>Vérification</Text>
                <Text
                  style={styles.heroSubtitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  Code envoyé au{' '}
                  <Text style={styles.heroPhoneHighlight}>+226 70 12 34 56</Text>
                </Text>
              </View>
            </View>

            {/* ── Formulaire statique ── */}
            <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.formCardSheet}>

            {/* Icône centrale */}
            <View style={styles.iconCircle}>
              <MessageSquare size={28} color="#074B36" strokeWidth={2} />
            </View>

            <Text style={styles.formTitle}>Entrez votre code</Text>
            <Text style={styles.formSubtitle}>
              Saisissez le code à 6 chiffres reçu par SMS
            </Text>

            {/* Rangée de cases OTP */}
            <Animated.View style={[styles.codeRow, shakeStyle]}>
              {code.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    focusedIndex === index && styles.codeBoxFocused,
                    digit && styles.codeBoxFilled,
                    error && styles.codeBoxError,
                  ]}
                >
                  <TextInput
                    ref={(ref) => { inputsRef.current[index] = ref; }}
                    style={styles.codeInput}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
                  />
                </View>
              ))}
            </Animated.View>

            {error && (
              <Text style={styles.errorText}>Code incorrect. Réessayez avec 123456.</Text>
            )}

            {/* Renvoyer */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Vous n'avez rien reçu ? </Text>
              {resendCooldown > 0 ? (
                <Text style={styles.resendCooldown}>
                  Renvoyer ({formatCooldown(resendCooldown)})
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Renvoyer le code</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bouton principal */}
            <TouchableOpacity
              style={styles.primaryPillBtn}
              activeOpacity={0.88}
              onPress={handleVerify}
              disabled={isLoading}
            >
              <Text style={styles.primaryPillBtnText}>
                {isLoading ? 'Vérification...' : 'Confirmer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeNumberBtn} onPress={() => router.replace('/register')}>
              <Text style={styles.changeNumberText}>Modifier le numéro</Text>
            </TouchableOpacity>
          </Animated.View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardAvoid: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bigLogoWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  bigLogoImg: {
    width: 150,
    height: 100,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextGroup: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  heroPhoneHighlight: {
    fontFamily: 'SoraBold',
    color: '#0B6E4F',
  },

  formCardSheet: {
    flex: 1,
    marginTop: 10,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'center',
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(7,75,54,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(7,75,54,0.12)',
  },
  formTitle: {
    fontFamily: 'SoraBold',
    fontSize: 22,
    color: '#074B36',
    marginBottom: 6,
    textAlign: 'center',
  },
  formSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 19,
  },

  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  codeBox: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxFocused: {
    borderColor: '#074B36',
    borderWidth: 2,
  },
  codeBoxFilled: {
    borderColor: '#CBD5E1',
  },
  codeBoxError: {
    borderColor: '#EF4444',
  },
  codeInput: {
    width: '100%',
    height: '100%',
    fontSize: 24,
    fontFamily: 'SoraBold',
    color: '#0F172A',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  resendText: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#64748B',
  },
  resendCooldown: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#94A3B8',
  },
  resendLink: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#074B36',
  },

  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  changeNumberBtn: {
    marginTop: 10,
    paddingVertical: 8,
  },
  changeNumberText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});
