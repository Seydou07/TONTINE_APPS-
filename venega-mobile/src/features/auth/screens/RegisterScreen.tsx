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

const logoImg = require('../../../../assets/venega-logo.png');

type FieldName = 'phone' | 'password' | 'confirm' | null;

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FieldName>(null);

  const handleRegister = async () => {
    if (!phone || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1200));
      router.push('/otp');
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
          {/* ── Section supérieure verte ── */}
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
                <Text style={styles.heroTitle}>Inscription</Text>
                <Text style={styles.heroSubtitle}>Rejoignez la communauté Venega</Text>
              </View>
            </SafeAreaView>
            <View style={styles.decorativeLeaf} />
            <View style={styles.decorativeCircle} />
          </View>

          {/* ── Carte emboîtée "Calebasse" ── */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.formCardSheet}>
            <Text style={styles.formTitle}>Créer un compte</Text>

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
                  placeholder="Téléphone (ex: 70 12 34 56)"
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

              {/* Confirmation mot de passe */}
              <View style={[styles.pillInputWrapper, focusedField === 'confirm' && styles.pillInputFocused]}>
                <Lock size={18} color={focusedField === 'confirm' ? '#074B36' : '#94A3B8'} />
                <TextInput
                  style={styles.pillInput}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Bouton Inscription Pilule */}
              <TouchableOpacity
                style={styles.primaryPillBtn}
                activeOpacity={0.88}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.primaryPillBtnText}>
                  {isLoading ? 'Création...' : 'S\'inscrire'}
                </Text>
              </TouchableOpacity>

              {/* Switch connexion */}
              <View style={styles.switchAuthRow}>
                <Text style={styles.switchAuthText}>Vous avez déjà un compte ? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.switchAuthLink}>Se connecter</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextGroup: {
    marginTop: 8,
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 16,
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
  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
