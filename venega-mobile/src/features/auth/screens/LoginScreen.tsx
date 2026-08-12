import React, { useState } from 'react';
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
import { Lock, Eye, EyeOff, Smartphone, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle as SvgCircle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const logoImg = require('../../../../assets/venega-logo.png');

// —— Icône Google "G" officielle (couleurs Google) ——
function GoogleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

// —— Icône Facebook "f" (bleu officiel) ——
function FacebookIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill="#1877F2"
        d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z"
      />
    </Svg>
  );
}

// —— Icône Instagram (dégradé) ——
function InstagramIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <SvgLinearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFDC80" />
          <Stop offset="25%" stopColor="#F77737" />
          <Stop offset="50%" stopColor="#E1306C" />
          <Stop offset="75%" stopColor="#C13584" />
          <Stop offset="100%" stopColor="#833AB4" />
        </SvgLinearGradient>
      </Defs>
      <Path
        fill="url(#igGrad)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </Svg>
  );
}

// —— Icône TikTok ——
function TikTokIcon() {
  return (
    <Svg width={20} height={22} viewBox="0 0 448 512">
      <Path
        fill="#010101"
        d="M448 209.91a210.06 210.06 0 01-122.77-39.25v178.72A162.55 162.55 0 11185 188.31v89.89a74.62 74.62 0 1052.23 71.18V0h88a121.18 121.18 0 00122.77 121.33z"
      />
    </Svg>
  );
}

// —— Icône X (Twitter) ——
function XIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill="#0F172A"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </Svg>
  );
}

type FieldName = 'phone' | 'password' | null;

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FieldName>(null);

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1200));
      router.replace('/(tabs)');
    } catch (e) {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
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
          {/* ── Section supérieure verte avec formes organiques ── */}
          <View style={styles.topSection}>
            <SafeAreaView edges={['top']}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                  <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                {/* Logo VISIBLE DIRECTEMENT, SANS carte blanche ni fond */}
                <View style={styles.headerLogoWrap}>
                  <Image source={logoImg} style={styles.headerLogoImg} contentFit="contain" />
                </View>
                <View style={{ width: 38 }} />
              </View>

              {/* Logo GRAND en pleine vue, bien visible */}
              <View style={styles.bigLogoWrap}>
                <Image source={logoImg} style={styles.bigLogoImg} contentFit="contain" />
              </View>

              <View style={styles.heroTextGroup}>
                <Text style={styles.heroTitle}>Hello !</Text>
                <Text style={styles.heroSubtitle}>Bienvenue sur Venega</Text>
              </View>
            </SafeAreaView>
            {/* Formes décoratives d'arrière-plan */}
            <View style={styles.decorativeLeaf} />
            <View style={styles.decorativeCircle} />
          </View>

          {/* ── Carte blanche arrondie emboîtée ("Calebasse") ── */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.formCardSheet}>
            <Text style={styles.formTitle}>Connexion</Text>

            <View style={styles.formGroup}>
              {/* Champ téléphone */}
              <View style={[styles.pillInputWrapper, focusedField === 'phone' && styles.pillInputFocused]}>
                <Smartphone size={18} color={focusedField === 'phone' ? '#074B36' : '#94A3B8'} />
                <View style={styles.prefixGroup}>
                  <Text style={styles.prefixText}>+226</Text>
                  <View style={styles.prefixDivider} />
                </View>
                <TextInput
                  style={styles.pillInput}
                  placeholder="70 12 34 56"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Champ mot de passe */}
              <View style={[styles.pillInputWrapper, focusedField === 'password' && styles.pillInputFocused]}>
                <Lock size={18} color={focusedField === 'password' ? '#074B36' : '#94A3B8'} />
                <TextInput
                  style={styles.pillInput}
                  placeholder="Mot de passe"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Mot de passe oublié */}
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              {/* Bouton de connexion Pilule */}
              <TouchableOpacity
                style={styles.primaryPillBtn}
                activeOpacity={0.88}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.primaryPillBtnText}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Text>
              </TouchableOpacity>

              {/* Séparateur social */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Ou continuer avec</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Boutons sociaux — icônes seules */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.75}>
                  <GoogleIcon />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.75}>
                  <FacebookIcon />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.75}>
                  <InstagramIcon />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.75}>
                  <TikTokIcon />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.75}>
                  <XIcon />
                </TouchableOpacity>
              </View>

              {/* Lien bas d'inscription */}
              <View style={styles.switchAuthRow}>
                <Text style={styles.switchAuthText}>Pas encore de compte ? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.switchAuthLink}>S'inscrire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
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
    marginBottom: 10,
  },
  headerLogoWrap: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  headerLogoImg: {
    width: 120,
    height: 38,
    tintColor: '#FFFFFF',
  },
  bigLogoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 18,
    backgroundColor: 'transparent',
  },
  bigLogoImg: {
    width: 200,
    height: 64,
    tintColor: '#FFFFFF',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextGroup: {
    marginTop: 4,
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  decorativeLeaf: {
    position: 'absolute',
    top: -30,
    left: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(54, 227, 149, 0.15)',
  },
  decorativeCircle: {
    position: 'absolute',
    top: 40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
  },
  formTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#074B36',
    marginBottom: 24,
  },
  formGroup: {
    gap: 16,
  },
  pillInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 52,
    gap: 10,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  pillInputFocused: {
    borderColor: '#074B36',
  },
  prefixGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prefixText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  prefixDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginLeft: 2,
  },
  pillInput: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#0F172A',
  },
  errorText: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#EF4444',
    marginTop: -4,
    marginLeft: 10,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 6,
  },
  forgotText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#0B6E4F',
  },
  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#94A3B8',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  socialIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  switchAuthText: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    color: '#64748B',
  },
  switchAuthLink: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#074B36',
  },
});
