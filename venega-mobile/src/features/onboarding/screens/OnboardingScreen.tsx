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
  FadeInUp,
} from 'react-native-reanimated';
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import type { SharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const logoImg = require('../../../../assets/venega-logo.png');
const slide2Img = require('../../../../assets/images/onboarding/slide2.png');
const slide3Img = require('../../../../assets/images/onboarding/slide3.png');
const slide4Img = require('../../../../assets/images/onboarding/slide4.png');

// Nouvel ordre : Slide 4 → Slide 2 → Slide 3
const SLIDES = [
  {
    id: 1,
    image: slide4Img,
    eyebrow: 'Cotisation simple',
    title: 'Cotisez en un clic',
    description:
      'Gérez vos cotisations directement depuis votre téléphone. Plus de paperasse, plus d\'attente — vous suivez tout en temps réel.',
    tag: 'Mobile Money',
  },
  {
    id: 2,
    image: slide2Img,
    eyebrow: 'Transparence totale',
    title: 'Chaque franc, visible',
    description:
      'Historique complet, roue de rotation en direct, statut des paiements. Vous voyez exactement ce qui se passe avec votre argent.',
    tag: 'Confiance',
  },
  {
    id: 3,
    image: slide3Img,
    eyebrow: 'Communauté solidaire',
    title: 'Prêts à commencer ?',
    description: 'Rejoignez Venega aujourd\'hui !',
    tag: 'Démarrer',
    isLast: true,
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
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* ── En-tête minimaliste : logo centré ── */}
        <View style={styles.topHeader}>
          <Image source={logoImg} style={styles.headerLogo} contentFit="contain" />
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Passer</Text>
          </TouchableOpacity>
        </View>

        {/* ── Carousel ── */}
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

        {/* ── Footer ── */}
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
            {currentIndex === SLIDES.length - 1 ? (
              <ChevronRight size={18} color="#FFFFFF" />
            ) : (
              <ArrowRight size={18} color="#FFFFFF" />
            )}
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
    const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP);
    const kenBurns = interpolate(scrollX.value, inputRange, [0.92, 1.08, 0.92], Extrapolate.CLAMP);
    return { opacity, transform: [{ scale }], kenBurns };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [24, 0, -24], Extrapolate.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  if (slide.isLast) {
    // ── DERNIÈRE PAGE : style premium avec image en bas ──
    return (
      <View style={styles.slide}>
        <Animated.View entering={FadeInUp.duration(700)} style={styles.lastPageContent}>
          {/* ── Titres premium ── */}
          <View style={styles.lastTitlesWrap}>
            <View style={styles.tagRow}>
              <View style={styles.accentDot} />
              <Text style={styles.lastEyebrow}>DERNIÈRE ÉTAPE</Text>
            </View>

            <Text style={styles.lastTitle}>
              PRÊT À COMMENCER ?
            </Text>

            <View style={styles.dividerLine} />

            <Text style={styles.lastSubtitle}>
              REJOIGNEZ VENEGA AUJOURD'HUI !
            </Text>

            <Text style={styles.lastDesc}>
              Créez votre premier cercle, invitez vos proches et commencez à épargner ensemble en toute transparence.
            </Text>
          </View>

          {/* ── Image en bas, style premium sans bord/ombre ── */}
          <Animated.View style={[styles.lastImageWrap, photoStyle]}>
            <Image
              source={slide.image}
              style={styles.lastImage}
              contentFit="cover"
              transition={400}
            />
            {/* Overlay gradient subtil pour la profondeur */}
            <View style={styles.lastImageOverlay} />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  // ── SLIDES 1 & 2 : style Pinterest (image clean, texte ordonné) ──
  return (
    <View style={styles.slide}>
      {/* Image sans carte, sans bord, sans ombre - style Pinterest */}
      <View style={styles.illustrationWrap}>
        <Animated.View style={[styles.posterWrap, photoStyle]}>
          <Image
            source={slide.image}
            style={styles.posterImage}
            contentFit="cover"
            transition={350}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.textWrap, textStyle]}>
        {/* Eyebrow + Tag */}
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>{slide.eyebrow.toUpperCase()}</Text>
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>{slide.tag}</Text>
          </View>
        </View>

        {/* Titre */}
        <Text style={styles.title}>{slide.title}</Text>

        {/* Séparateur décoratif */}
        <View style={styles.titleUnderline} />

        {/* Description */}
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
    backgroundColor: '#FAF7F1',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  headerLogo: {
    width: 148,
    height: 48,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(7, 75, 54, 0.06)',
  },
  skipBtnText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#074B36',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 24,
  },

  /* ─── Illustration (slides 1-2) style Pinterest sans card ─── */
  illustrationWrap: {
    flex: 1.35,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 4,
  },
  posterWrap: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    // PAS de fond, PAS de bord, PAS d'ombre — style Pinterest
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },

  /* ─── Textes slides 1-2 ─── */
  textWrap: {
    flex: 0.85,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: 'SoraBold',
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#074B36',
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
  },
  tagPillText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
    color: '#074B36',
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 27,
    lineHeight: 34,
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  titleUnderline: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#074B36',
    marginBottom: 14,
  },
  description: {
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    lineHeight: 23.5,
    color: '#64748B',
  },

  /* ─── Dernière page ─── */
  lastPageContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
    gap: 20,
  },
  lastTitlesWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9A441',
  },
  lastEyebrow: {
    fontFamily: 'SoraBold',
    fontSize: 11,
    letterSpacing: 2.4,
    color: '#64748B',
  },
  lastTitle: {
    fontFamily: 'SoraBold',
    fontSize: 31,
    lineHeight: 38,
    color: '#074B36',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  dividerLine: {
    width: 80,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D9A441',
    marginBottom: 14,
  },
  lastSubtitle: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  lastDesc: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  lastImageWrap: {
    width: '100%',
    height: 260,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  lastImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  lastImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'transparent',
  },

  /* ─── Footer ─── */
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D2C2',
  },
  nextPillBtn: {
    height: 54,
    backgroundColor: '#074B36',
    borderRadius: 27,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  nextPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
