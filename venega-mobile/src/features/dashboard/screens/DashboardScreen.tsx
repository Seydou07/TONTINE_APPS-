import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, ChevronRight, Gift, HandHeart, HeartHandshake, Plus, UserPlus, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { mockCurrentUser, CircleType } from '@venega/types';
import type { Circle } from '@venega/types';
import { getCircles, getNextContribution } from '../../circles/circleStore';
import { HeroHeader, HeroStatusBar, heroColors } from '../../../components/ui';
import PromoCarousel from '../components/PromoCarousel';

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F';

/** Hauteur dont le diaporama chevauche le bandeau vert. */
const CARD_OVERLAP = 64;

function circleMeta(c: Circle): { icon: LucideIcon; subtitle: string } {
  if (c.type === CircleType.AID_APPEAL) {
    return { icon: HeartHandshake, subtitle: `Collecte · objectif ${formatXOF(c.rules.goalAmount ?? 0)}` };
  }
  if (c.type === CircleType.NATURE) {
    return { icon: Gift, subtitle: `${c.memberCount} membres · ${c.rules.goalItem ?? 'En nature'}` };
  }
  if (c.type === CircleType.SOLIDARITY_ONLY) {
    return { icon: HeartHandshake, subtitle: `${c.memberCount} membres · Solidarité` };
  }
  return { icon: Users, subtitle: `${c.memberCount} membres · ${formatXOF(c.tontineAmount)} par tour` };
}

export default function DashboardScreen() {
  const router = useRouter();
  const [circles, setCircles] = useState<Circle[]>(getCircles());

  useFocusEffect(
    useCallback(() => {
      setCircles(getCircles());
    }, []),
  );

  const me = mockCurrentUser;
  const fullName = [me.firstName, me.lastName].filter(Boolean).join(' ');

  const openCircle = (c: Circle) => {
    if (c.type === CircleType.AID_APPEAL) router.push(`/aid/${c.id}` as any);
    else if (c.type === CircleType.SOLIDARITY_ONLY) router.push(`/circle/${c.id}/solidarity` as any);
    else router.push(`/circle/${c.id}/tontine` as any);
  };

  return (
    <View style={styles.container}>
      <HeroStatusBar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Section verte : salutation ── */}
        <HeroHeader overlap={CARD_OVERLAP}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}
              accessibilityLabel="Mon profil"
            >
              {me.avatarUrl ? (
                <Image source={{ uri: me.avatarUrl }} style={styles.avatar} contentFit="cover" transition={200} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>{me.firstName.charAt(0)}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.flex}>
              <Text style={styles.greeting}>Bonjour</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {fullName}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bell}
              onPress={() => router.push('/(tabs)/notifications')}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell size={22} color={heroColors.accent} strokeWidth={1.9} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
        </HeroHeader>

        {/* ── Diaporama (chevauche le vert) ── */}
        <PromoCarousel style={styles.promo} />

        <View style={styles.body}>
          {/* ── Actions ── */}
          <View style={styles.actions}>
            <ActionTile icon={Plus} label="Créer un cercle" onPress={() => router.push('/circles/create')} />
            <ActionTile icon={UserPlus} label="Rejoindre un cercle" onPress={() => router.push('/circles/join')} />
            <ActionTile icon={HandHeart} label="Lancer une cagnotte" onPress={() => router.push('/aid/create' as any)} />
          </View>

          {/* ── Mes cercles ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes cercles</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/circles')} hitSlop={8} activeOpacity={0.6}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {circles.slice(0, 5).map((c, i, list) => {
              const { icon: Icon, subtitle } = circleMeta(c);
              const active = !!c.activatedAt;
              return (
                <TouchableOpacity key={c.id} style={styles.row} activeOpacity={0.6} onPress={() => openCircle(c)}>
                  <View style={[styles.rowIcon, !active && styles.rowIconOff]}>
                    <Icon size={20} color={active ? colors.primary.DEFAULT : colors.subtle} strokeWidth={1.8} />
                  </View>
                  <View style={[styles.rowBody, i < list.length - 1 && styles.rowBorder]}>
                    <View style={styles.flex}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {active ? subtitle : 'En attente d’activation'}
                      </Text>
                    </View>
                    {active && <DueTag circle={c} />}
                    <ChevronRight size={18} color={colors.subtle} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** Échéance courte à droite d'une ligne de cercle : « Aujourd’hui », « Demain », « Dans 3 j ». */
function DueTag({ circle }: { circle: Circle }) {
  const next = getNextContribution(circle);
  if (!next) return null;
  const label = next.daysLeft <= 0 ? 'Aujourd’hui' : next.daysLeft === 1 ? 'Demain' : `Dans ${next.daysLeft} j`;
  return (
    <View style={[styles.dueTag, next.daysLeft <= 1 && styles.dueTagSoon]}>
      <Text style={[styles.dueTagText, next.daysLeft <= 1 && styles.dueTagTextSoon]}>{label}</Text>
    </View>
  );
}

function ActionTile({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIcon}>
        <Icon size={20} color={colors.primary.dark} strokeWidth={2} />
      </View>
      <Text style={styles.actionLabel} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: heroColors.accent },
  avatarFallback: { backgroundColor: heroColors.button, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { ...typography.headline, color: heroColors.accent },
  greeting: { ...typography.callout, fontWeight: '600', color: heroColors.accent },
  userName: { ...typography.headline, fontSize: 18, color: heroColors.text, marginTop: 2 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: heroColors.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger.DEFAULT,
    borderWidth: 1.5,
    borderColor: colors.primary.dark,
  },

  promo: { marginTop: -CARD_OVERLAP },

  body: { paddingHorizontal: 16 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { ...typography.footnote, fontWeight: '600', color: colors.ink, textAlign: 'center' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: { ...typography.headline, color: colors.ink },
  seeAll: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT },

  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 12 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIconOff: { backgroundColor: colors.fill },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingRight: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  dueTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: colors.primary.tint },
  dueTagSoon: { backgroundColor: colors.accent.tint },
  dueTagText: { ...typography.caption, fontWeight: '600', color: colors.primary.DEFAULT },
  dueTagTextSoon: { color: colors.accent.dark },
});
