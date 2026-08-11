import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* En-tête vert */}
          <View style={styles.topSection}>
            <SafeAreaView edges={['top']}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                  <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerLogoCard}>
                  <Image source={logoImg} style={styles.headerLogoImg} contentFit="contain" />
                </View>
              </View>
              <View style={styles.heroTextGroup}>
                <Text style={styles.heroTitle}>Vérification</Text>
                <Text style={styles.heroSubtitle}>
                  Code envoyé au{' '}
                  <Text style={styles.heroPhoneHighlight}>+226 70 12 34 56</Text>
                </Text>
              </View>
            </SafeAreaView>
            {/* Décorations */}
            <View style={styles.decorativeLeaf} />
            <View style={styles.decorativeCircle} />
          </View>

          {/* Carte emboîtée */}
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

            <TouchableOpacity style={styles.changeNumberBtn} onPress={() => router.back()}>
              <Text style={styles.changeNumberText}>Modifier le numéro</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 24,
    paddingBottom: 50,
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginBottom: 20,
  },
  headerLogoCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLogoImg: {
    width: 90,
    height: 28,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextGroup: { marginTop: 8 },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  heroPhoneHighlight: {
    fontFamily: 'SoraBold',
    color: '#36E395',
  },
  decorativeLeaf: {
    position: 'absolute', top: -30, left: -20,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(54,227,149,0.15)',
  },
  decorativeCircle: {
    position: 'absolute', top: 40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  formCardSheet: {
    flex: 1,
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(7,75,54,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(7,75,54,0.12)',
  },
  formTitle: {
    fontFamily: 'SoraBold',
    fontSize: 24,
    color: '#074B36',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },

  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  codeBoxFocused: {
    borderColor: '#074B36',
    borderWidth: 2,
  },
  codeBoxFilled: {
    backgroundColor: 'rgba(7,75,54,0.06)',
    borderColor: '#0B6E4F',
  },
  codeBoxError: {
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderColor: '#EF4444',
  },
  codeInput: {
    width: '100%',
    height: '100%',
    fontSize: 24,
    fontFamily: 'SoraBold',
    color: '#074B36',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 28,
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
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  changeNumberBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  changeNumberText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});
