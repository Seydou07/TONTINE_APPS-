import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { colors, typography } from '@venega/design-tokens';
import { Button } from '../../../components/ui';

export default function KYCSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Animated.View entering={ZoomIn.duration(350)} style={styles.checkCircle}>
            <Check size={36} color={colors.primary.DEFAULT} strokeWidth={2.5} />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(150).duration(350)}>
            <Text style={styles.title}>Identité vérifiée</Text>
            <Text style={styles.subtitle}>
              Vous pouvez maintenant créer des cercles, inviter des membres et utiliser toutes les fonctionnalités de
              Venega.
            </Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Button title="Continuer" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { ...typography.title, color: colors.ink, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.muted, textAlign: 'center', marginTop: 10 },
  footer: { paddingHorizontal: 20, paddingVertical: 12 },
});
