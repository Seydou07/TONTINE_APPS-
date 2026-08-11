import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolate,
} from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';
import type { SharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const logoImg = require('../../../../assets/venega-logo.png');

const slide1Img = require('../../../../assets/images/onboarding/slide1.png');
const slide2Img = require('../../../../assets/images/onboarding/slide2.png');
const slide3Img = require('../../../../assets/images/onboarding/slide3.png');

const SLIDES = [
  {
    id: 1,
    image: slide1Img,
    title: 'Tontine simplifiée et sécurisée',
    description: 'Consultez la progression de vos tours de tontine, cotisez en 1 clic par Mobile Money et recevez vos versements en toute transparence.',
  },
  {
    id: 2,
    image: slide2Img,
    title: 'Solidarité et transparence',
    description: 'Bénéficiez d\'un fonds de secours pour les événements de la vie et développez la confiance mutuelle au sein du groupe.',
  },
  {
    id: 3,
    image: slide3Img,
    title: 'Suivez tout, simplement...',
    description: 'Visualisez l\'historique complet des cotisations et gardez le contrôle total sur votre calendrier financier.',
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
      router.replace('/landing');
    }
  };

  const handleSkip = () => {
    router.replace('/landing');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F1" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* En-tête avec Logo Officiel Venega & Bouton Passer */}
        <View style={styles.topHeader}>
          <Image source={logoImg} style={styles.headerLogo} contentFit="contain" />
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Passer</Text>
          </TouchableOpacity>
        </View>

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
            style={styles.nextPillBtn}
            activeOpacity={0.88}
            onPress={handleNext}
          >
            <Text style={styles.nextPillBtnText}>
              {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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

  const photoStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, -20], Extrapolate.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={styles.slide}>
      <View style={styles.illustrationWrap}>
        <Animated.View style={[styles.posterCard, photoStyle]}>
          <Image
            source={slide.image}
            style={styles.posterImage}
            contentFit="cover"
            transition={300}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.textWrap, textStyle]}>
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
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP);
    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      ['#CBD5E1', '#074B36', '#CBD5E1'],
    );
    return { width, backgroundColor };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F1',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerLogo: {
    width: 130,
    height: 42,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
  },
  skipBtnText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#074B36',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrap: {
    flex: 1.4,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  posterCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  textWrap: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 23,
    color: '#074B36',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  nextPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
});

