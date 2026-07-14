import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { colors, spacing, radius } from '@venega/design-tokens';

export default function ProfileSetupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner votre prénom et votre nom');
      return;
    }
    router.replace('/kyc-intro');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepText}>Étape 1 sur 4</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Configurer votre profil</Text>
        <Text style={styles.subtitle}>
          Ajoutez une photo et renseignez votre nom pour que vos amis vous reconnaissent.
        </Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {firstName[0]?.toUpperCase() || '?'}
              {lastName[0]?.toUpperCase() || ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => Alert.alert('Info', 'Photo ajoutée ! (simulation)')}
          >
            <Camera size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Prénom"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nom de famille"
              autoCapitalize="words"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleContinue}>
          <Text style={styles.btnPrimaryText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing[6], paddingVertical: spacing[6],
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  stepText: { fontFamily: 'WorkSans', fontSize: 14, color: colors.textMuted },
  content: { flex: 1, paddingHorizontal: spacing[6], paddingTop: spacing[1] },
  title: {
    fontFamily: 'Sora', fontSize: 28, fontWeight: '700',
    color: colors.text, marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: 'WorkSans', fontSize: 16, color: colors.textMuted,
    lineHeight: 24, marginBottom: spacing[8],
  },
  avatarContainer: { alignSelf: 'center', marginBottom: spacing[8] },
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontFamily: 'Sora', fontSize: 40, fontWeight: '700', color: colors.primary.DEFAULT },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 40, height: 40,
    borderRadius: 20, backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.bg,
  },
  form: { gap: spacing[6] },
  fieldContainer: { gap: spacing[2] },
  label: { fontFamily: 'WorkSans', fontSize: 14, color: colors.text, fontWeight: '500' },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing[6], fontFamily: 'WorkSans',
    fontSize: 16, color: colors.text,
  },
  btnPrimary: {
    backgroundColor: colors.primary.DEFAULT, paddingVertical: spacing[6],
    borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center',
    marginTop: 'auto', marginBottom: spacing[8],
  },
  btnPrimaryText: { fontFamily: 'WorkSans', fontSize: 16, color: '#fff', fontWeight: '600' },
});
