import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, radius } from '@venega/design-tokens';

const CONFETTI_COLORS = [
  '#0B6E4F', '#0F8563', '#D9A441', '#B9852A', '#7A4E9C', '#2B7FB0', '#C1443A', '#0B6E4F',
];

const CONFETTI_COUNT = 16;

export default function KYCSuccessScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Confetti />
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.checkCircle}>
          <Check size={44} color={colors.primary.DEFAULT} strokeWidth={3} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={styles.title}>Identité vérifiée</Text>
          <Text style={styles.subtitle}>
            Vous pouvez maintenant créer des cercles, inviter des membres et
            profiter de toutes les fonctionnalités de Venega.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.88} onPress={handleContinue}>
            <LinearGradient
              colors={[colors.button.start, colors.button.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnPrimaryText}>Continuer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

function Confetti() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }, (_, index) => (
        <ConfettiPiece key={index} index={index} />
      ))}
    </View>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const angle = (index / CONFETTI_COUNT) * 360;
  const distance = 90 + (index % 5) * 22;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const size = 6 + (index % 3) * 3;
  const delay = 150 + (index % 8) * 90;
  const duration = 700 + (index % 5) * 100;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value > 0.05 ? 1 - progress.value * 0.3 : 0,
    transform: [
      { translateX: x * progress.value },
      { translateY: y * progress.value },
      { rotate: `${progress.value * 180}deg` },
      { scale: progress.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          width: size,
          height: size,
          backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  confetti: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
    borderRadius: 2,
  },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing[6],
  },
  buttonContainer: {
    marginTop: spacing[10],
    alignSelf: 'stretch',
  },
  btnPrimary: {
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  btnGradient: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: 'WorkSansSemiBold', fontSize: 15.5, color: '#FFFFFF' },
});
