import React, { useEffect } from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { colors, typography } from '@venega/design-tokens';

const logoImg = require('../../../../assets/venega-logo.png');

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.92);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    logoOpacity.value = withTiming(1, { duration: 500, easing: ease });
    logoScale.value = withTiming(1, { duration: 600, easing: ease });
    taglineOpacity.value = withDelay(350, withTiming(1, { duration: 450, easing: ease }));

    const timer = setTimeout(() => router.replace('/onboarding'), 1800);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.dark} />
      <Animated.View style={logoStyle}>
        <Image source={logoImg} style={styles.logo} contentFit="contain" />
      </Animated.View>
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        L’épargne et la solidarité, en toute clarté
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.dark,
    paddingHorizontal: 32,
  },
  logo: {
    width: 220,
    height: 146,
  },
  tagline: {
    position: 'absolute',
    bottom: 64,
    left: 32,
    right: 32,
    ...typography.callout,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
