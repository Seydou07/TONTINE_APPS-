import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import VenegaLogo from '../../../components/VenegaLogo';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-30);
  const ringScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(24);

  useEffect(() => {
    ringScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSequence(
      withSpring(1.15, { damping: 12, stiffness: 140 }),
      withSpring(1, { damping: 14, stiffness: 160 }),
    );
    logoRotate.value = withSpring(0, { damping: 14, stiffness: 90 });

    const t = setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      textTranslate.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    }, 500);

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2800);

    return () => {
      clearTimeout(t);
      clearTimeout(timer);
    };
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { rotate: `${logoRotate.value}deg` }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringScale.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  return (
    <LinearGradient
      colors={['#074B36', '#0B6E4F', '#0F8563']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View pointerEvents="none" style={[styles.blob, styles.blobTop, ringStyle]} />
      <Animated.View pointerEvents="none" style={[styles.blob, styles.blobBottom, ringStyle]} />

      <View style={styles.center}>
        <Animated.View style={[styles.glow, ringStyle]} />
        <Animated.View style={logoStyle}>
          <VenegaLogo size={120} showWordmark={false} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottom, textStyle]}>
        <Text style={styles.wordmark}>VENEga</Text>
        <Text style={styles.tagline}>L'épargne qui rassemble</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 60,
  },
  blob: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  blobTop: { top: -120, right: -90 },
  blobBottom: { bottom: -140, left: -100 },
  bottom: {
    position: 'absolute',
    bottom: 90,
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: 'SoraBold',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  tagline: {
    fontFamily: 'WorkSans',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1,
  },
});
