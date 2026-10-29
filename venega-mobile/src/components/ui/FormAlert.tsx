import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';

/**
 * Erreur qui concerne tout le formulaire (identifiants refusés, réseau coupé, serveur indisponible).
 * Les erreurs propres à un champ s'affichent sous ce champ, pas ici.
 */
export default function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <CircleAlert size={18} color={colors.danger.DEFAULT} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.danger.tint,
  },
  text: {
    ...typography.footnote,
    flex: 1,
    color: colors.danger.dark,
  },
});
