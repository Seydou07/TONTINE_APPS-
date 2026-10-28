import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, HandHeart, HeartHandshake, Smartphone, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';

type Slide = {
  id: string;
  title: string;
  text: string;
  cta: string;
  route: string;
  icon: LucideIcon;
};

// TODO: remplacer les icônes par de vraies photos / visuels de campagne quand ils seront disponibles.
const SLIDES: Slide[] = [
  {
    id: 'tontine',
    title: 'Votre tontine, sans cahier',
    text: 'Cotisations, tours et cagnottes suivis automatiquement.',
    cta: 'Créer un cercle',
    route: '/circles/create',
    icon: Users,
  },
  {
    id: 'mobile-money',
    title: 'Cotisez par Mobile Money',
    text: 'Orange Money, Moov Money et Wave acceptés.',
    cta: 'Mes cercles',
    route: '/(tabs)/circles',
    icon: Smartphone,
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

const SIDE = 16;
const GAP = 12;
const AUTOPLAY_MS = 4500;

/** Bannières publicitaires qui défilent automatiquement (pause pendant que l'utilisateur fait glisser). */
export default function PromoCarousel({ style }: { style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = width - SIDE * 2;
  const interval = cardWidth + GAP;

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
          const Icon = item.icon;
          return (
            <View style={[styles.card, { width: cardWidth }]}>
              <View style={styles.text}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.text}</Text>
                <TouchableOpacity
                  style={styles.cta}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaText}>{item.cta}</Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
              <View style={styles.art}>
                <Icon size={44} color={colors.primary.dark} strokeWidth={1.6} />
              </View>
            </View>
          );
        }}
      />
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: SIDE },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 168,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.accent.DEFAULT,
  },
  text: { flex: 1 },
  title: { ...typography.headline, fontSize: 19, lineHeight: 24, fontWeight: '700', color: colors.primary.dark },
  body: { ...typography.footnote, color: colors.primary.dark, opacity: 0.85, marginTop: 6 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 14,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: colors.primary.DEFAULT,
  },
  ctaText: { ...typography.footnote, fontWeight: '600', color: '#FFFFFF' },
  art: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lineStrong },
  dotActive: { width: 18, backgroundColor: colors.primary.DEFAULT },
});
