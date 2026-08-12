import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const logoImg = require('../../../../assets/venega-logo.png');

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);
  const sloganTranslate = useSharedValue(14);
  const progress = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.bezier(0.2, 1.4, 0.4, 1),
    });
    logoOpacity.value = withTiming(1, { duration: 600 });

    sloganOpacity.value = withDelay(500, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    sloganTranslate.value = withDelay(500, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    progress.value = withDelay(300, withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) }));

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
    transform: [{ translateY: sloganTranslate.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, 160], Extrapolate.CLAMP),
  }));

  return (
    <View style={styles.container}>
      {/* Background Soft Aura Halos */}
      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <View style={styles.centerContent}>
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image source={logoImg} style={styles.logoImage} contentFit="contain" />
        </Animated.View>
      </View>

      <View style={styles.bottomContent}>
        <Animated.Text style={[styles.tagline, sloganStyle]}>
          L'épargne et la solidarité{'\n'}en toute clarté
        </Animated.Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, barStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(15, 133, 99, 0.06)',
  },
  haloBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(217, 164, 65, 0.08)',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  logoImage: {
    width: 300,
    height: 120,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: SCREEN_WIDTH,
    paddingHorizontal: 32,
  },
  tagline: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 17,
    lineHeight: 25,
    color: '#074B36',
    textAlign: 'center',
    marginBottom: 28,
  },
  progressTrack: {
    width: 160,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#074B36',
  },
});

