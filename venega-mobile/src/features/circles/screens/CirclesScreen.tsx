import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@venega/design-tokens';

export default function CirclesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Mes Cercles</Text>
        <Text style={styles.subtitle}>Gérez vos cercles de tontine et de solidarité</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textMuted, fontFamily: 'WorkSans', textAlign: 'center' },
});
