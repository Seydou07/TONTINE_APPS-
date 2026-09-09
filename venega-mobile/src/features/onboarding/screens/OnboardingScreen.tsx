import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolate,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const logoImg = require('../../../../assets/venega-logo.png');

// ─────────────────────────────────────────────────────────────────────────
// Chaque élément (logo, titre, image, description) est positionné en
// absolu, à sa propre position fixe, indépendamment des autres. Toucher au
// réglage d'un élément (sa position ou sa taille) ne déplace jamais les
// autres — chaque bloc de constantes ci-dessous ne concerne qu'un élément.
// ─────────────────────────────────────────────────────────────────────────

// ── Logo ──
const LOGO_TOP = 12;
const LOGO_WIDTH = 150;
const LOGO_HEIGHT = 100;

// ── Titre (vert) ──
const TITLE_TOP = 112;
const TITLE_HEIGHT = 54;

// ── Image ──
const IMAGE_TOP = 150;
const IMAGE_HORIZONTAL_PADDING = 28;
const IMAGE_MAX_WIDTH = SCREEN_WIDTH - IMAGE_HORIZONTAL_PADDING * 2;
const IMAGE_MAX_HEIGHT = 730;
const IMAGE_NATURAL_WIDTH = 1024;
const IMAGE_NATURAL_HEIGHT = 1536;
/** Taille d'affichage en pixels exacts qui fait tenir l'image entière dans
 * l'espace disponible, sans la recadrer — commune aux 3 slides. */
const IMAGE_SIZE = (() => {
  const scale = Math.min(IMAGE_MAX_WIDTH / IMAGE_NATURAL_WIDTH, IMAGE_MAX_HEIGHT / IMAGE_NATURAL_HEIGHT);
  return { width: IMAGE_NATURAL_WIDTH * scale, height: IMAGE_NATURAL_HEIGHT * scale };
})();

// ── Description (texte noir du bas) ──
const DESCRIPTION_BOTTOM = 100;
const DESCRIPTION_HORIZONTAL_PADDING = 28;

const SLIDES = [
  {
    id: 1,
    image: require('../../../../assets/images/onboarding/on1.png'),
    title: 'Tontine simple et sécurisée',
    description: 'Épargnez en toute confiance et atteignez vos objectifs.',
  },
  {
    id: 2,
    image: require('../../../../assets/images/onboarding/on2.png'),
    title: 'Solidarité et transparence',
    description: 'Ensemble, nous sommes plus forts. La transparence renforce la confiance.',
  },
  {
    id: 3,
    image: require('../../../../assets/images/onboarding/on3.png'),
    title: 'Suivez tout, simplement en temps réel',
    description: "Gardez le contrôle de vos cotisations, de vos paiements et l'évolution de votre cercle en un coup d'œil.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleSkip = () => {
    router.replace('/landing');
  };

  const handleStart = () => {
    router.replace('/landing');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
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

        <View style={styles.overlay} pointerEvents="box-none">
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Passer</Text>
          </TouchableOpacity>

          <View style={styles.pagination} pointerEvents="none">
            {SLIDES.map((_, index) => (
              <PaginationDot key={index} index={index} scrollX={scrollX} />
            ))}
          </View>

          {currentIndex === SLIDES.length - 1 && (
            <Animated.View entering={FadeIn.duration(250)} style={styles.startBtnWrap}>
              <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.7}>
                <Text style={styles.startBtnText}>Commencer</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
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

  // Chaque élément anime son entrée en fonction de sa distance au centre de
  // l'écran pendant le glissement — fondu + léger mouvement, pour que tout
  // "arrive" avec un effet vivant quand on passe sur cette page.
  const logoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolate.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [26, 0, -26], Extrapolate.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const photoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], Extrapolate.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const descriptionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [18, 0, -18], Extrapolate.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={styles.slide}>
      <Animated.View
        entering={FadeIn.delay(20).duration(280)}
        style={[styles.logoWrap, logoStyle]}
        pointerEvents="none"
      >
        <Image source={logoImg} style={styles.slideLogo} resizeMode="contain" />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(60).duration(300)}
        style={[styles.slideTitle, titleStyle]}
        numberOfLines={3}
      >
        {slide.title}
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(100).duration(340)}
        style={[styles.imageWrap, photoStyle]}
        pointerEvents="none"
      >
        <Image
          source={slide.image}
          style={{ width: IMAGE_SIZE.width, height: IMAGE_SIZE.height }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(140).duration(300)}
        style={[styles.slideDescription, descriptionStyle]}
        numberOfLines={4}
      >
        {slide.description}
      </Animated.Text>
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
    const width = interpolate(scrollX.value, inputRange, [8, 26, 8], Extrapolate.CLAMP);
    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      ['#D8D2C2', '#074B36', '#D8D2C2'],
    );
    return { width, backgroundColor };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
  },

  /* ── Logo : position et taille indépendantes ── */
  logoWrap: {
    position: 'absolute',
    top: LOGO_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  slideLogo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },

  /* ── Titre vert : position et taille indépendantes ── */
  slideTitle: {
    position: 'absolute',
    top: TITLE_TOP,
    left: 0,
    right: 0,
    minHeight: TITLE_HEIGHT,
    fontFamily: 'SoraBold',
    fontSize: 21,
    lineHeight: 27,
    color: '#074B36',
    textAlign: 'center',
    letterSpacing: -0.3,
    paddingHorizontal: 20,
  },

  /* ── Image : position et taille indépendantes ── */
  imageWrap: {
    position: 'absolute',
    top: IMAGE_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  /* ── Description noire : position indépendante, ancrée depuis le bas ── */
  slideDescription: {
    position: 'absolute',
    bottom: DESCRIPTION_BOTTOM,
    left: 0,
    right: 0,
    paddingHorizontal: DESCRIPTION_HORIZONTAL_PADDING,
    fontFamily: 'WorkSansBold',
    fontSize: 15,
    lineHeight: 20.5,
    color: '#1A202C',
    textAlign: 'center',
  },

  /* ── Bouton Passer, points de pagination, bouton Commencer : chacun ── */
  /* ── positionné en absolu, indépendamment des autres ── */
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  skipBtn: {
    position: 'absolute',
    top: 44,
    right: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#074B36',
  },
  pagination: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startBtnWrap: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    justifyContent: 'center',
  },
  startBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  startBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#074B36',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D2C2',
  },
});
