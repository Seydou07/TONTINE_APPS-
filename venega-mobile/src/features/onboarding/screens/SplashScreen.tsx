import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@venega/design-tokens';

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });

    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 400);

    const timer = setTimeout(() => {
      router.replace('/landing');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>V</Text>
          </View>
        </Animated.View>

        <Animated.View style={textAnimatedStyle}>
          <Text style={styles.appName}>Venega</Text>
          <Text style={styles.tagline}>Ce qui est clair</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center' },
  logoContainer: { marginBottom: 24 },
  logo: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 10,
  },
  logoText: { fontSize: 52, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Sora' },
  appName: { fontSize: 32, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: 4 },
  tagline: { fontSize: 16, color: colors.textMuted, fontFamily: 'WorkSans', textAlign: 'center' },
});
