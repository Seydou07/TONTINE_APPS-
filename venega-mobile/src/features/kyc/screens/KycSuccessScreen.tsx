import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { colors, spacing, radius } from '@venega/design-tokens';

export default function KYCSuccessScreen() {
  const params = useLocalSearchParams<{ fromCreate?: string }>();

  const handleContinue = () => {
    if (params.fromCreate === 'true') {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <CheckCircle2 size={96} color={colors.success} />
        </View>

        <Text style={styles.title}>Votre identité est vérifiée !</Text>
        <Text style={styles.subtitle}>
          Vous pouvez maintenant créer des cercles, inviter des membres et
          profiter de toutes les fonctionnalités de Venega.
        </Text>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleContinue}>
          <Text style={styles.btnPrimaryText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[6] },
  successContainer: { marginBottom: spacing[8] },
  title: {
    fontFamily: 'Sora', fontSize: 28, fontWeight: '700',
    color: colors.text, marginBottom: spacing[4], textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'WorkSans', fontSize: 16, color: colors.textMuted,
    lineHeight: 24, textAlign: 'center', marginBottom: spacing[8], paddingHorizontal: spacing[6],
  },
  btnPrimary: {
    backgroundColor: colors.primary.DEFAULT, paddingVertical: spacing[6],
    paddingHorizontal: spacing[8], borderRadius: radius.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: 'WorkSans', fontSize: 16, color: '#fff', fontWeight: '600' },
});
