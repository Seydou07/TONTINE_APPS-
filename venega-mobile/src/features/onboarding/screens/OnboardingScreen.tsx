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

const SLIDES = [
  {
    id: 1,
    image: require('../../../../assets/images/onboarding/on1.jpg'),
    title: 'Une tontine simple et sécurisée',
    description: 'Épargnez en toute confiance avec vos proches et atteignez vos objectifs ensemble.',
  },
  {
    id: 2,
    image: require('../../../../assets/images/onboarding/on2.jpg'),
    title: 'Solidarité et transparence',
    description: 'Chaque cotisation est visible par tous les membres. La transparence renforce la confiance.',
  },
  {
    id: 3,
    image: require('../../../../assets/images/onboarding/on3.jpg'),
    title: 'Tout suivre en temps réel',
    description: 'Vos cotisations, vos paiements et l’évolution de votre cercle, en un coup d’œil.',
  },
];

const H_PADDING = 24;

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const finish = () => router.replace('/login');

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
            <Slide key={slide.id} slide={slide} index={i} width={width} scrollX={scrollX} />
          ))}
        </Animated.ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <Dot key={i} index={i} width={width} scrollX={scrollX} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={next}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>{isLast ? 'Commencer' : 'Suivant'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Slide({
  slide,
  index,
  width,
  scrollX,
}: {
  slide: (typeof SLIDES)[number];
  index: number;
  width: number;
  scrollX: SharedValue<number>;
}) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollX.value, range, [12, 0, 12], Extrapolation.CLAMP) }],
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scrollX.value, range, [0.94, 1, 0.94], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.Text style={[styles.title, textStyle]}>{slide.title}</Animated.Text>

      <Animated.View style={[styles.imageCard, imageStyle]}>
        <Image source={slide.image} style={styles.image} contentFit="contain" />
      </Animated.View>

      <Animated.Text style={[styles.description, textStyle]}>{slide.description}</Animated.Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    height: 48,
    paddingHorizontal: H_PADDING,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  skipText: {
    ...typography.bodyStrong,
    color: colors.muted,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingBottom: 8,
  },
  title: {
    ...typography.title,
    color: colors.primary.dark,
    textAlign: 'center',
    marginBottom: 20,
  },
  imageCard: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  description: {
    ...typography.body,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  primaryBtn: {
    height: sizes.button,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    ...typography.bodyStrong,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
