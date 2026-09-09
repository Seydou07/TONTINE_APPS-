import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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
    width: interpolate(progress.value, [0, 1], [0, 180], Extrapolate.CLAMP),
  }));

  return (
    <LinearGradient
      colors={['#0F8563', '#0B6E4F', '#074B36']}
      locations={[0, 0.45, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloTop: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(217, 164, 65, 0.10)',
  },
  haloBottom: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: 300,
    height: 200,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
    width: SCREEN_WIDTH,
    paddingHorizontal: 32,
  },
  tagline: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 17,
    lineHeight: 25,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressTrack: {
    width: 180,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9A441',
  },
});

