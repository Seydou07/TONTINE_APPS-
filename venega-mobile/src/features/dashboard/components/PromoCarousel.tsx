import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { HandHeart, HeartHandshake, Smartphone, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { operatorLogos } from '../../circles/components/OperatorPicker';

type Slide = {
  id: string;
  title: string;
  text: string;
  cta: string;
  route: string;
  icon: LucideIcon;
  /**
   * Bannière complète fournie en image (fond, personnage, textes, bouton dessinés dedans).
   * Format : 1200 × 560 px (ratio BANNER_RATIO), PNG ou JPG < 200 Ko, dans assets/banners/.
   * Si présente, elle remplace la carte dessinée. Pas de bouton : toute la bannière ouvre `route`.
   */
  image?: number;
  /** Affiche les logos Orange / Moov / Wave sous le texte (bannière Mobile Money). */
  showOperators?: boolean;
};

/** Ratio des bannières image (1200 × 560). */
const BANNER_RATIO = 1200 / 560;

// Pour passer une bannière en image : ajouter `image: require('../../../../assets/banners/<nom>.png')`.
const SLIDES: Slide[] = [
  {
    id: 'tontine',
    title: 'Votre tontine, sans cahier',
    text: 'Cotisations, tours et cagnottes suivis automatiquement.',
    cta: 'Créer un cercle',
    route: '/circles/create',
    icon: Users,
    image: require('../../../../assets/banners/tontine.jpg'),
  },
  {
    id: 'mobile-money',
    title: 'Cotisez par Mobile Money',
    text: 'Orange Money, Moov Money et Wave acceptés.',
    cta: 'Mes cercles',
    route: '/(tabs)/circles',
    icon: Smartphone,
    image: require('../../../../assets/banners/mobile-money.jpg'),
    showOperators: true,
  },
  {
    id: 'solidarite',
    title: 'La solidarité qui protège',
    text: 'Une caisse commune pour les coups durs du groupe.',
    cta: 'Découvrir',
    route: '/circles/create',
    icon: HeartHandshake,
  },
  {
    id: 'cagnotte',
    title: 'Lancez une cagnotte d’aide',
    text: 'Un lien à partager : chacun peut donner, même sans l’application.',
    cta: 'Lancer',
    route: '/aid/create',
    icon: HandHeart,
  },
];

const SIDE = 12;
const GAP = 12;
const AUTOPLAY_MS = 4500;

/** Bannières publicitaires qui défilent automatiquement (pause pendant que l'utilisateur fait glisser). */
export default function PromoCarousel({ style }: { style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = width - SIDE * 2;
  const interval = cardWidth + GAP;
  // Même hauteur pour toutes les bannières (image ou carte dessinée) : celle du format image.
  // Un peu plus haute que le ratio de l'image : l'image est cadrée à gauche (texte intact), le bord droit est rogné.
  const bannerHeight = Math.round((cardWidth / BANNER_RATIO) * 1.1);

  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (dragging) return;
    const timer = setTimeout(() => {
      const next = (index + 1) % SLIDES.length;
      listRef.current?.scrollToOffset({ offset: next * interval, animated: true });
      setIndex(next);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [dragging, index, interval]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / interval));
    setDragging(false);
  };

  return (
    <View style={style}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        getItemLayout={(_, i) => ({ length: interval, offset: interval * i, index: i })}
        onScrollBeginDrag={() => setDragging(true)}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => {
          if (item.image) {
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(item.route as any)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.cta}`}
                style={[styles.imageCard, { width: cardWidth, height: bannerHeight }]}
              >
                <Image source={item.image} style={styles.imageFill} contentFit="cover" contentPosition="left" />
                {item.showOperators && (
                  // Logos des opérateurs sous le texte de l'image, dans la zone jaune.
                  <View style={styles.imageActions} pointerEvents="none">
                    {['ORANGE', 'MOOV', 'WAVE'].map((op) => (
                      <View key={op} style={styles.opBadge}>
                        <Image source={operatorLogos[op]} style={styles.opLogo} contentFit="contain" />
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          }
          const Icon = item.icon;
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(item.route as any)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.cta}`}
              style={[styles.card, { width: cardWidth, height: bannerHeight }]}
            >
              <View style={styles.text}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.body} numberOfLines={2}>
                  {item.text}
                </Text>
              </View>
              <View style={styles.art}>
                <Icon size={36} color={colors.primary.dark} strokeWidth={1.6} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: SIDE },
  imageCard: { borderRadius: 24, overflow: 'hidden', backgroundColor: colors.accent.DEFAULT },
  imageFill: { width: '100%', height: '100%' },
  // Positions en % de la bannière : le texte des images s'arrête vers 60 % de la hauteur.
  imageActions: {
    position: 'absolute',
    left: '5.5%',
    top: '66%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  opBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opLogo: { width: 28, height: 28 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: colors.accent.DEFAULT,
  },
  text: { flex: 1 },
  title: { ...typography.headline, fontWeight: '700', color: colors.primary.dark },
  body: { ...typography.footnote, color: colors.primary.dark, opacity: 0.85, marginTop: 4 },
  art: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
