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
import { isLockEnabled } from '../../../lib/appLock';
import { hasSession } from '../../auth/api';
import { hasSeenOnboarding } from '../onboardingSeen';

// Logo d'origine (couleurs inchangées), posé sur une carte blanche pour rester lisible sur le fond vert.
const symbolImg = require('../../../../assets/splash.png');
const wordmarkImg = require('../../../../assets/logo-wordmark.png');

/** Mêmes dimensions que l'image de démarrage native (assets/splash-badge.png, app.json imageWidth 220). */
const CARD = 220;
const CARD_RADIUS = 48;
const SYMBOL = 100;
const WORDMARK_W = 124;
const WORDMARK_H = Math.round((WORDMARK_W * 82) / 309);
const GAP = 12;
/** Décalage qui place le symbole pile au centre de la carte tant que « Venega » n'est pas affiché. */
const START_OFFSET = (GAP + WORDMARK_H) / 2;

export default function SplashScreen() {
  const router = useRouter();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const groupY = useSharedValue(START_OFFSET);
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(8);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    // 1. Le diaphragme fait un tour complet.
    rotation.value = withTiming(360, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1.08, { duration: 450, easing: ease }),
      withTiming(1, { duration: 450, easing: Easing.inOut(Easing.cubic) }),
    );
    // 2. Le symbole remonte, « Venega » apparaît dessous, dans la carte.
    groupY.value = withDelay(950, withTiming(0, { duration: 500, easing: ease }));
    wordOpacity.value = withDelay(1050, withTiming(1, { duration: 450, easing: ease }));
    wordY.value = withDelay(1050, withTiming(0, { duration: 450, easing: ease }));
    // 3. Le slogan, sous la carte.
    taglineOpacity.value = withDelay(1500, withTiming(1, { duration: 450, easing: ease }));

    // Pendant l'animation, on regarde où aller : déjà connecté → accueil (ou verrou),
    // onboarding déjà vu → connexion, premier lancement → onboarding.
    const destination = (async () => {
      if (await hasSession()) return (await isLockEnabled()) ? '/lock?next=tabs' : '/(tabs)';
      return (await hasSeenOnboarding()) ? '/login' : '/onboarding';
    })();
    const timer = setTimeout(() => destination.then((href) => router.replace(href as any)), 2700);
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
      <View style={styles.card}>
        <Animated.View style={[styles.group, groupStyle]}>
          <Animated.View style={symbolStyle}>
            <Image source={symbolImg} style={styles.symbol} contentFit="contain" />
          </Animated.View>
          <Animated.View style={wordStyle}>
            <Image source={wordmarkImg} style={styles.wordmark} contentFit="contain" />
          </Animated.View>
        </Animated.View>
      </View>
      {/* Slogan : signature de marque, sous le logo. */}
      <Animated.Text style={[styles.tagline, taglineStyle]} numberOfLines={1} adjustsFontSizeToFit>
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
  card: {
    width: CARD,
    height: CARD,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  group: { alignItems: 'center', gap: GAP },
  symbol: { width: SYMBOL, height: SYMBOL },
  wordmark: { width: WORDMARK_W, height: WORDMARK_H },
  // Positionné sous la carte sans déplacer celle-ci du centre (même position que l'écran natif).
  tagline: {
    position: 'absolute',
    top: '50%',
    marginTop: CARD / 2 + 24,
    left: 32,
    right: 32,
    ...typography.callout,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
});
