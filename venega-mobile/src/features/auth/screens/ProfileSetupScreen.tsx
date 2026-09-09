import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Smartphone,
  Check,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const logoImg = require('../../../../assets/venega-logo.png');

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Aminata Ouédraogo');
  const phone = '70 12 34 56';
  const [email, setEmail] = useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('70 12 34 56');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const nameParts = fullName.trim().split(/\s+/);
  const initials = ((nameParts[0]?.[0] ?? '') + (nameParts[1]?.[0] ?? '')).toUpperCase() || 'A';

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer votre nom complet.');
      return;
    }
    setShowSuccess(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.content}>
            {/* ── Section logo (hero) moderne ── */}
            <View style={styles.heroSection}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/otp')}>
                  <ArrowLeft size={20} color="#074B36" />
                </TouchableOpacity>
                <View style={{ width: 38 }} />
              </View>

              {/* Logo réel, bien visible */}
              <View style={styles.bigLogoWrap}>
                <Image source={logoImg} style={styles.bigLogoImg} contentFit="contain" />
              </View>

              <View style={styles.heroTextGroup}>
                <Text style={styles.heroTitle}>Informations</Text>
                <Text style={styles.heroSubtitle}>
                  Mettez à jour vos coordonnées personnelles
                </Text>
              </View>
            </View>

            {/* ── Formulaire (statique, le clavier le soulève si besoin) ── */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
              >
              {/* Avatar avec bouton photo */}
              <View style={styles.avatarWrapContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <TouchableOpacity
                  style={styles.cameraBadgeBtn}
                  onPress={() => Alert.alert('Photo de profil', 'Changement de photo simulé avec succès.')}
                  activeOpacity={0.85}
                >
                  <Camera size={15} color="#074B36" />
                </TouchableOpacity>
              </View>

              {/* Formulaire des champs pilules */}
              <View style={styles.formGroup}>
                <View style={[styles.pillInputWrapper, focusedField === 'fullName' && styles.pillInputFocused]}>
                  <User size={18} color={focusedField === 'fullName' ? '#074B36' : '#94A3B8'} />
                  <TextInput
                    style={[styles.pillInput, styles.pillInputBold]}
                    placeholder="Nom complet"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={[styles.pillInputWrapper, focusedField === 'email' && styles.pillInputFocused]}>
                  <Mail size={18} color={focusedField === 'email' ? '#074B36' : '#94A3B8'} />
                  <TextInput
                    style={styles.pillInput}
                    placeholder="Adresse e-mail (facultatif)"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={[styles.pillInputWrapper, styles.pillInputDisabled]}>
                  <Smartphone size={18} color="#94A3B8" />
                  <Text style={styles.disabledPhoneText}>+226 {phone}</Text>
                </View>

                <Text style={styles.fieldLabel}>Numéro Mobile Money *</Text>
                <View style={[styles.pillInputWrapper, focusedField === 'mobileMoney' && styles.pillInputFocused]}>
                  <Smartphone size={18} color={focusedField === 'mobileMoney' ? '#074B36' : '#94A3B8'} />
                  <Text style={styles.prefixText}>+226</Text>
                  <View style={styles.prefixDivider} />
                  <TextInput
                    style={styles.pillInput}
                    placeholder="70 12 34 56"
                    placeholderTextColor="#94A3B8"
                    value={mobileMoneyNumber}
                    onChangeText={setMobileMoneyNumber}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedField('mobileMoney')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryPillBtn}
                  activeOpacity={0.88}
                  onPress={handleSave}
                >
                  <Text style={styles.primaryPillBtnText}>Terminer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* ── Modal de confirmation — même gabarit que partout ailleurs dans l'app ── */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => router.replace('/login')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalSuccessIcon}>
              <Check size={24} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.modalTitle}>Compte créé avec succès</Text>
            <Text style={styles.modalText}>
              Bienvenue dans Venega. Votre tontine digitale est prête.
            </Text>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.modalConfirmBtnText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  heroTextGroup: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#0F172A',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  formCardSheet: {
    flex: 1,
    marginTop: 10,
    paddingTop: 14,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  avatarWrapContainer: {
    alignSelf: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#D9A441',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: 'SoraBold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#074B36',
  },
  formGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#334155',
    marginTop: 2,
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
  prefixText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  prefixDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  pillInputFocused: {
    borderColor: '#074B36',
  },
  pillInputDisabled: {
    backgroundColor: '#F8FAFC',
  },
  pillInput: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#0F172A',
  },
  pillInputBold: {
    fontFamily: 'WorkSansSemiBold',
  },
  disabledPhoneText: {
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#94A3B8',
  },
  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    width: '100%',
    gap: 14,
  },
  modalSuccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B6E4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#1A202C',
  },
  modalText: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    lineHeight: 19,
    color: '#334155',
  },
  modalConfirmBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});
