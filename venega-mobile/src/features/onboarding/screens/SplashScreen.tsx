import React, { useEffect } from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography } from '@venega/design-tokens';

// Variantes blanc + ambre du logo, prévues pour le fond vert.
const symbolImg = require('../../../../assets/splash-white.png');
const wordmarkImg = require('../../../../assets/logo-wordmark-white.png');

/** Même taille que l'image de démarrage native (app.json, imageWidth 120) : la reprise est invisible. */
const SYMBOL = 120;
const WORDMARK_W = 150;
const WORDMARK_H = Math.round((WORDMARK_W * 82) / 309);
const GAP = 16;
const SLOGAN_GAP = 10;
const SLOGAN_H = 20;
/** Décalage qui place le symbole pile au centre tant que « Venega » et le slogan ne sont pas affichés. */
const START_OFFSET = (GAP + WORDMARK_H + SLOGAN_GAP + SLOGAN_H) / 2;

export default function SplashScreen() {
  const router = useRouter();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const groupY = useSharedValue(START_OFFSET);
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(10);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    // 1. Le diaphragme fait un tour complet.
    rotation.value = withTiming(360, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1.08, { duration: 450, easing: ease }),
      withTiming(1, { duration: 450, easing: Easing.inOut(Easing.cubic) }),
    );
    // 2. Le symbole remonte, « Venega » apparaît dessous.
    groupY.value = withDelay(950, withTiming(0, { duration: 500, easing: ease }));
    wordOpacity.value = withDelay(1050, withTiming(1, { duration: 450, easing: ease }));
    wordY.value = withDelay(1050, withTiming(0, { duration: 450, easing: ease }));
    // 3. Le slogan.
    taglineOpacity.value = withDelay(1500, withTiming(1, { duration: 450, easing: ease }));

    const timer = setTimeout(() => router.replace('/onboarding'), 2700);
    return () => clearTimeout(timer);
  }, []);

  const groupStyle = useAnimatedStyle(() => ({ transform: [{ translateY: groupY.value }] }));
  const symbolStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: (1 - taglineOpacity.value) * 6 }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.group, groupStyle]}>
        <Animated.View style={symbolStyle}>
          <Image source={symbolImg} style={styles.symbol} contentFit="contain" />
        </Animated.View>
        <Animated.View style={wordStyle}>
          <Image source={wordmarkImg} style={styles.wordmark} contentFit="contain" />
        </Animated.View>
        {/* Slogan : sous le nom, comme une signature de marque. */}
        <Animated.Text style={[styles.tagline, taglineStyle]} numberOfLines={1} adjustsFontSizeToFit>
          L’épargne et la solidarité, en toute clarté
        </Animated.Text>
      </Animated.View>
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
  group: { alignItems: 'center', gap: GAP },
  symbol: { width: SYMBOL, height: SYMBOL },
  wordmark: { width: WORDMARK_W, height: WORDMARK_H },
  tagline: {
    ...typography.callout,
    lineHeight: SLOGAN_H,
    marginTop: SLOGAN_GAP - GAP,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
});
