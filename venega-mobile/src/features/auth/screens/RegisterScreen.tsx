import React, { useState } from 'react';
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
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff, Smartphone, ArrowLeft } from 'lucide-react-native';

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.content}>
            {/* ── Section logo (hero) moderne ── */}
            <View style={styles.heroSection}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/landing')}>
                  <ArrowLeft size={20} color="#074B36" />
                </TouchableOpacity>
                <View style={{ width: 38 }} />
              </View>

              {/* Logo réel, bien visible */}
              <View style={styles.bigLogoWrap}>
                <Image source={logoImg} style={styles.bigLogoImg} contentFit="contain" />
              </View>

              <View style={styles.heroTextGroup}>
                <Text style={styles.heroTitle}>Inscription</Text>
                <Text style={styles.heroSubtitle}>Rejoignez la communauté Venega</Text>
              </View>
            </View>

            {/* ── Formulaire statique (ne bouge pas) ── */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formCardSheet}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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

              {/* Confirmation mot de passe */}
              <View style={[styles.pillInputWrapper, focusedField === 'confirm' && styles.pillInputFocused]}>
                <Lock size={18} color={focusedField === 'confirm' ? '#074B36' : '#94A3B8'} />
                <TextInput
                  style={styles.pillInput}
                  placeholder="Confirmer mot de passe"
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
              <Text
                style={styles.switchAuthRow}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                <Text style={styles.switchAuthText}>Déjà un compte ? </Text>
                <Text style={styles.switchAuthLink} onPress={() => router.push('/login')}>
                  Se connecter
                </Text>
              </Text>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
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
    justifyContent: 'center',
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
  formScroll: {
    flex: 1,
  },
  formCardSheet: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  formTitle: {
    fontFamily: 'SoraBold',
    fontSize: 24,
    color: '#074B36',
    marginBottom: 14,
  },
  formGroup: {
    gap: 12,
  },
  pillInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
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
    fontSize: 13.5,
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
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
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
  switchAuthRow: {
    textAlign: 'center',
    marginTop: 16,
  },
  switchAuthText: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: '#64748B',
  },
  switchAuthLink: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#074B36',
  },
});
