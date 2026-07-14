import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Shield, ChevronLeft } from 'lucide-react-native';
import { colors, spacing, radius } from '@venega/design-tokens';

export default function KYCIntroScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepText}>Étape 2 sur 4</Text>
      </View>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Shield size={80} color={colors.primary.DEFAULT} />
          </View>
        </View>

        <Text style={styles.title}>Vérifiez votre identité</Text>
        <Text style={styles.subtitle}>
          Pour créer un cercle et inviter des membres, nous avons besoin de
          vérifier votre identité. Cela renforce la confiance et la sécurité
          pour tout le monde.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✓ Votre CNIB ou passeport{'\n'}✓ Un selfie pour confirmer
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.replace('/kyc-upload')}
        >
          <Text style={styles.btnPrimaryText}>Vérifier maintenant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => router.replace('/onboarding')}
        >
          <Text style={styles.btnGhostText}>Plus tard (limité)</Text>
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
  illustrationContainer: { alignItems: 'center', marginBottom: spacing[8] },
  illustration: {
    width: 160, height: 160, borderRadius: radius.lg,
    backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontFamily: 'Sora', fontSize: 28, fontWeight: '700',
    color: colors.text, marginBottom: spacing[4], textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'WorkSans', fontSize: 16, color: colors.textMuted,
    lineHeight: 24, textAlign: 'center', marginBottom: spacing[6],
  },
  infoBox: { backgroundColor: colors.primary.tint, padding: spacing[6], borderRadius: radius.md },
  infoText: { fontFamily: 'WorkSans', fontSize: 15, color: colors.primary.DEFAULT, fontWeight: '500', lineHeight: 24 },
  btnPrimary: {
    backgroundColor: colors.primary.DEFAULT, paddingVertical: spacing[6],
    borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing[4],
  },
  btnPrimaryText: { fontFamily: 'WorkSans', fontSize: 16, color: '#fff', fontWeight: '600' },
  btnGhost: { paddingVertical: spacing[6], justifyContent: 'center', alignItems: 'center', marginBottom: spacing[8] },
  btnGhostText: { fontFamily: 'WorkSans', fontSize: 16, color: colors.textMuted, fontWeight: '500' },
});
