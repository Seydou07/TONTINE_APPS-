import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { colors, radius, sizes, typography } from '@venega/design-tokens';
import { markOnboardingSeen } from '../onboardingSeen';
import { ContributionsArt, RotationArt, SolidarityArt } from '../components/OnboardingArt';
import { PressableScale } from '../../../components/ui';

/** Logo d'origine (vert), toujours posé sur fond blanc : jamais recoloré. */
const wordmark = require('../../../../assets/logo-wordmark.png');

const SLIDES = [
  {
    id: 'rotation',
    eyebrow: 'Tontine',
    title: 'Chacun son tour, et tout le monde le sait',
    description:
      'Chaque membre cotise, un bénéficiaire reçoit la cagnotte à chaque tour. L’ordre de passage est visible par tous : fixé, tiré au sort ou par ordre d’arrivée.',
    Art: RotationArt,
  },
  {
    id: 'contributions',
    eyebrow: 'Cotisations',
    title: 'La cagnotte part quand tout est reçu',
    description:
      'Chacun paie par Mobile Money depuis son téléphone, avec son propre code secret. Pas de cagnotte incomplète, et aucune pénalité de retard.',
    Art: ContributionsArt,
  },
  {
    id: 'solidarity',
    eyebrow: 'Solidarité',
    title: 'L’entraide, avec des garde-fous',
    description:
      'Caisse de solidarité ou cagnotte d’aide : l’argent ne part qu’avec l’accord des validateurs choisis par le groupe.',
    Art: SolidarityArt,
  },
] as const;

const H_PADDING = 24;

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  // Panneau illustré : environ la moitié de l'écran, sans écraser le texte sur les petits téléphones.
  const artHeight = Math.max(300, Math.min(440, height * 0.5));

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const finish = () => {
    markOnboardingSeen();
    router.replace('/login');
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    const target = index + 1;
    scrollRef.current?.scrollTo({ x: target * width, animated: true });
    setIndex(target);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Image source={wordmark} style={styles.wordmark} contentFit="contain" accessibilityLabel="Venega" />
          {!isLast && (
            <TouchableOpacity
              onPress={finish}
              hitSlop={12}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel="Passer l’introduction"
            >
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.pager}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {SLIDES.map((slide, i) => (
            <Slide
              key={slide.id}
              slide={slide}
              index={i}
              width={width}
              artHeight={artHeight}
              active={index === i}
              scrollX={scrollX}
            />
          ))}
        </Animated.ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <Dot key={s.id} index={i} width={width} scrollX={scrollX} />
            ))}
          </View>

          <PressableScale onPress={next} style={styles.primaryBtn} accessibilityRole="button">
            <Text style={styles.primaryBtnText}>{isLast ? 'Commencer' : 'Suivant'}</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Slide({
  slide,
  index,
  width,
  artHeight,
  active,
  scrollX,
}: {
  slide: (typeof SLIDES)[number];
  index: number;
  width: number;
  artHeight: number;
  active: boolean;
  scrollX: SharedValue<number>;
}) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollX.value, range, [12, 0, 12], Extrapolation.CLAMP) }],
  }));

  // Léger effet de profondeur : l'illustration glisse moins vite que la page.
  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, range, [width * 0.25, 0, -width * 0.25], Extrapolation.CLAMP) },
      { scale: interpolate(scrollX.value, range, [0.92, 1, 0.92], Extrapolation.CLAMP) },
    ],
  }));

  const { Art } = slide;
  return (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.artPanel, { height: artHeight }]}>
        <Animated.View style={artStyle}>
          <Art active={active} />
        </Animated.View>
      </View>

      <Animated.View style={textStyle}>
        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {slide.title}
        </Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
    </View>
  );
}

function Dot({ index, width, scrollX }: { index: number; width: number; scrollX: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const range = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, range, [8, 24, 8], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(scrollX.value, range, [
        colors.lineStrong,
        colors.primary.DEFAULT,
        colors.lineStrong,
      ]),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  topBar: {
    height: 52,
    paddingHorizontal: H_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmark: { width: 96, height: 26 },
  skipText: { ...typography.bodyStrong, color: colors.muted },
  pager: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: 16 },
  artPanel: {
    borderRadius: 28,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 4,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.accent.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    paddingHorizontal: 8,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  description: {
    ...typography.body,
    lineHeight: 22,
    color: colors.muted,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 20,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  primaryBtn: {
    height: sizes.button,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { ...typography.bodyStrong, fontSize: 16, color: '#FFFFFF' },
});
