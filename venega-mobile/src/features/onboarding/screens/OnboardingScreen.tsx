import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolate,
  withSpring,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { colors, spacing, radius } from '@venega/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Gérez vos tontines facilement',
    description: 'Créez et gérez vos cercles de tontine en quelques clics. Transparence totale pour tous les membres.',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
  },
  {
    id: 2,
    title: 'Caisse de solidarité',
    description: 'Créez des caisses de solidarité pour aider les membres en difficulté. Processus de validation simple et transparent.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  },
  {
    id: 3,
    title: 'Paiements Mobile Money',
    description: 'Payez et recevez vos cotisations directement via Orange Money ou Moov Money grâce à notre intégration sécurisée.',
    image: 'https://images.unsplash.com/photo-1609557915526-aec1f7220619?w=800&q=80',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
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
        {ONBOARDING_DATA.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image
                source={item.image}
                style={styles.image}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.imageOverlay} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <PaginationDot
              key={index}
              index={index}
              currentIndex={currentIndex}
              scrollX={scrollX}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {currentIndex < ONBOARDING_DATA.length - 1 ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function PaginationDot({
  index,
  currentIndex,
  scrollX,
}: {
  index: number;
  currentIndex: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP
    );

    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      [colors.border, colors.primary.DEFAULT, colors.border],
    );

    return {
      width,
      backgroundColor,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  imageContainer: {
    height: SCREEN_WIDTH,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 110, 79, 0.15)',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Sora',
    marginBottom: spacing[4],
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'WorkSans',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    paddingTop: spacing[4],
  },
  pagination: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    fontFamily: 'WorkSans',
  },
  nextButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'WorkSans',
  },
  placeholder: {
    width: 60,
  },
});
