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
  const [firstName, setFirstName] = useState('Aminata');
  const [lastName, setLastName] = useState('Ouédraogo');
  const [phone, setPhone] = useState('70 12 34 56');
  const [email, setEmail] = useState('aminata.ouedraogo@example.com');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir votre prénom et votre nom.');
      return;
    }
    Alert.alert('Succès', 'Profil mis à jour avec succès !');
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* En-tête vert */}
          <View style={styles.topSection}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerLogoCard}>
                <Image source={logoImg} style={styles.headerLogoImg} contentFit="contain" />
              </View>
              <View style={{ width: 38 }} />
            </View>

            <View style={styles.heroTextGroup}>
              <Text style={styles.heroTitle}>Informations</Text>
              <Text style={styles.heroSubtitle}>
                Mettez à jour vos coordonnées personnelles
              </Text>
            </View>
          </View>

          {/* Corps emboîté crème ("Calebasse") */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Avatar avec bouton photo */}
              <View style={styles.avatarWrapContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {firstName[0]?.toUpperCase() || 'A'}
                    {lastName[0]?.toUpperCase() || 'O'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cameraBadgeBtn}
                  onPress={() => Alert.alert('Photo de profil', 'Changement de photo simulé avec succès.')}
                  activeOpacity={0.85}
                >
                  <Camera size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Formulaire des champs pilules */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Prénom *</Text>
                <View style={[styles.pillInputWrapper, focusedField === 'firstName' && styles.pillInputFocused]}>
                  <User size={18} color={focusedField === 'firstName' ? '#074B36' : '#94A3B8'} />
                  <TextInput
                    style={styles.pillInput}
                    placeholder="Prénom"
                    placeholderTextColor="#94A3B8"
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <Text style={styles.fieldLabel}>Nom de famille *</Text>
                <View style={[styles.pillInputWrapper, focusedField === 'lastName' && styles.pillInputFocused]}>
                  <User size={18} color={focusedField === 'lastName' ? '#074B36' : '#94A3B8'} />
                  <TextInput
                    style={styles.pillInput}
                    placeholder="Nom de famille"
                    placeholderTextColor="#94A3B8"
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <Text style={styles.fieldLabel}>Numéro Mobile Money *</Text>
                <View style={[styles.pillInputWrapper, focusedField === 'phone' && styles.pillInputFocused]}>
                  <Smartphone size={18} color={focusedField === 'phone' ? '#074B36' : '#94A3B8'} />
                  <Text style={styles.prefixText}>+226</Text>
                  <View style={styles.prefixDivider} />
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

                <Text style={styles.fieldLabel}>Adresse e-mail</Text>
                <View style={[styles.pillInputWrapper, focusedField === 'email' && styles.pillInputFocused]}>
                  <Mail size={18} color={focusedField === 'email' ? '#074B36' : '#94A3B8'} />
                  <TextInput
                    style={styles.pillInput}
                    placeholder="votre.email@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryPillBtn}
                  activeOpacity={0.88}
                  onPress={handleSave}
                >
                  <Check size={18} color="#FFFFFF" />
                  <Text style={styles.primaryPillBtnText}>Enregistrer le profil</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 12,
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
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  heroTextGroup: {
    marginTop: 4,
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  avatarWrapContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(7, 75, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#074B36',
  },
  avatarInitials: {
    fontFamily: 'SoraBold',
    fontSize: 32,
    color: '#074B36',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAF7F1',
  },
  formGroup: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#334155',
    marginTop: 4,
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
  },
  pillInputFocused: {
    borderColor: '#074B36',
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
  pillInput: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#0F172A',
  },
  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
});
