import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolate,
} from 'react-native-reanimated';
import { Users, HeartHandshake, Smartphone, ArrowRight } from 'lucide-react-native';
import { colors, radius } from '@venega/design-tokens';
import type { SharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    icon: Users,
    title: 'CrÃ©ez vos tontines',
    description:
      'Formez des cercles d\'Ã©pargne clairs et transparents. Chaque membre sait quand vient son tour.',
    gradient: ['#0B6E4F', '#0F8563', '#0B6E4F'] as [string, string, string],
    tint: '#E4F0EB',
  },
  {
    id: 2,
    icon: HeartHandshake,
    title: 'La solidaritÃ© en action',
    description:
      'Activez une caisse de solidaritÃ© pour aider un membre en difficultÃ©. Ensemble, on va plus loin.',
    gradient: ['#D9A441', '#C97B2D', '#B9852A'] as [string, string, string],
    tint: '#FBF1DD',
  },
  {
    id: 3,
    icon: Smartphone,
    title: 'Paiements Mobile Money',
    description:
      'Cotisez et recevez vos paiements via Orange Money et Moov Money, en toute sÃ©curitÃ©.',
    gradient: ['#074B36', '#0B6E4F', '#0F8563'] as [string, string, string],
    tint: '#E4F0EB',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipTop} onPress={handleSkip}>
        <Text style={styles.skipTopText}>Passer</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(newIndex);
        }}
      >
        {SLIDES.map((slide, index) => (
          <Slide key={slide.id} slide={slide} index={index} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Slide({
  slide,
  index,
  scrollX,
}: {
  slide: (typeof SLIDES)[number];
  index: number;
  scrollX: SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const illustrationStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolate.CLAMP);
    const rotate = interpolate(scrollX.value, inputRange, [8, 0, -8], Extrapolate.CLAMP);
    return { transform: [{ scale }, { rotate: `${rotate}deg` }] };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [24, 0, -24], Extrapolate.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const Icon = slide.icon;

  return (
    <View style={styles.slide}>
      <View style={styles.illustrationArea}>
        <Animated.View style={illustrationStyle}>
          <LinearGradient
            colors={slide.gradient}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.illustration}
          >
            <View style={styles.illustrationGlow} />
            <View style={[styles.illustrationRing, { borderColor: 'rgba(255,255,255,0.25)' }]} />
            <View style={[styles.illustrationRingSmall, { borderColor: 'rgba(255,255,255,0.18)' }]} />
            <View style={styles.illustrationIcon}>
              <Icon size={56} color="#FFFFFF" strokeWidth={1.8} />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <Animated.View style={[styles.content, textStyle]}>
        <View style={[styles.stepBadge, { backgroundColor: slide.tint }]}>
          <Text style={styles.stepText}>0{index + 1}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
    </View>
  );
}

function PaginationDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    const width = interpolate(scrollX.value, inputRange, [10, 30, 10], Extrapolate.CLAMP);
    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      [colors.border, colors.primary.DEFAULT, colors.border],
    );
    return { width, backgroundColor };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  skipTop: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  skipTopText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 15,
    color: colors.textMuted,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  illustrationArea: {
    flex: 1.15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    width: SCREEN_WIDTH - 64,
    height: SCREEN_WIDTH - 100,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  illustrationGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -60,
    right: -60,
  },
  illustrationRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
  },
  illustrationRingSmall: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
  },
  illustrationIcon: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    alignItems: 'center',
  },
  stepBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: 16,
  },
  stepText: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: colors.primary.DEFAULT,
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'WorkSans',
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.pill,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  nextText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
});
