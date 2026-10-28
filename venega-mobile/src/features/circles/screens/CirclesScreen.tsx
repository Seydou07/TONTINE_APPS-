import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Users, Search, ChevronRight, HeartHandshake, Gift, Plus, Repeat, Clock, X } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { CircleType } from '@venega/types';
import type { Circle } from '@venega/types';
import { getCircles, getFounderCircleIds, CIRCLE_CREATION_FEE } from '../circleStore';
import { Button, Chip } from '../../../components/ui';

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

type RoleFilter = 'ALL' | 'CREATED' | 'MEMBER';

const typeMeta: Record<string, { label: string; icon: LucideIcon; fg: string; bg: string }> = {
  TONTINE_ONLY: { label: 'Tontine', icon: Repeat, fg: colors.primary.DEFAULT, bg: colors.primary.tint },
  NATURE: { label: 'Tontine en nature', icon: Gift, fg: colors.accent.deep, bg: colors.accent.tint },
  SOLIDARITY_ONLY: { label: 'Solidarité', icon: HeartHandshake, fg: colors.info.DEFAULT, bg: colors.info.tint },
  AID_APPEAL: { label: 'Appel à l’aide', icon: HeartHandshake, fg: colors.danger.DEFAULT, bg: colors.danger.tint },
};

const frequencyText: Record<string, string> = {
  DAILY: 'Chaque jour',
  WEEKLY: 'Chaque semaine',
  BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Chaque mois',
};

export default function CirclesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [circles, setCircles] = useState<Circle[]>(getCircles());

  useFocusEffect(
    useCallback(() => {
      setCircles(getCircles());
    }, []),
  );

  const createdCircleIds = getFounderCircleIds();
  const activeCount = circles.filter((c) => !!c.activatedAt).length;
  const pendingCount = circles.length - activeCount;

  const filteredCircles = circles.filter((circle) => {
    if (!circle.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;
    const isOwner = createdCircleIds.includes(circle.id);
    if (roleFilter === 'CREATED') return isOwner;
    if (roleFilter === 'MEMBER') return !isOwner;
    return true;
  });

  const openActivation = (id: string) => router.push(`/payment?circleId=${id}&type=ACTIVATION` as any);

  const openCircle = (circle: Circle) => {
    if (!circle.activatedAt) return openActivation(circle.id);
    if (circle.type === CircleType.AID_APPEAL) return router.push(`/aid/${circle.id}` as any);
    if (circle.type === CircleType.SOLIDARITY_ONLY) return router.push(`/circle/${circle.id}/solidarity` as any);
    if (circle.type === CircleType.TONTINE_ONLY) return router.push(`/circle/${circle.id}/tontine` as any);
    router.push(`/circle/${circle.id}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[1]}
        >
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.title}>Mes cercles</Text>
              <Text style={styles.subtitle}>
                {activeCount} actif{activeCount > 1 ? 's' : ''}
                {pendingCount > 0 ? ` · ${pendingCount} en attente` : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/circles/join')}
              activeOpacity={0.7}
              accessibilityLabel="Rejoindre un cercle"
            >
              <Plus size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Recherche + filtres (restent visibles au défilement) */}
          <View style={styles.toolbar}>
            <View style={styles.search}>
              <Search size={18} color={colors.subtle} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un cercle"
                placeholderTextColor={colors.subtle}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel="Effacer">
                  <X size={16} color={colors.subtle} />
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.chips}>
              <Chip label={`Tous · ${circles.length}`} selected={roleFilter === 'ALL'} onPress={() => setRoleFilter('ALL')} />
              <Chip label="Créés par moi" selected={roleFilter === 'CREATED'} onPress={() => setRoleFilter('CREATED')} />
              <Chip label="Membre" selected={roleFilter === 'MEMBER'} onPress={() => setRoleFilter('MEMBER')} />
            </View>
          </View>

          {filteredCircles.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Users size={24} color={colors.subtle} strokeWidth={1.6} />
              </View>
              <Text style={styles.emptyTitle}>Aucun cercle trouvé</Text>
              <Text style={styles.emptyText}>Essayez un autre mot-clé ou un autre filtre.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filteredCircles.map((circle) => {
                const meta = typeMeta[circle.type] ?? typeMeta.TONTINE_ONLY!;
                const Icon = meta.icon;
                const isAid = circle.type === CircleType.AID_APPEAL;
                const isFounder = createdCircleIds.includes(circle.id);
                const pending = !circle.activatedAt;
                const amount = isAid
                  ? circle.rules?.goalAmount ?? 0
                  : (circle.tontineAmount || 0) + (circle.solidarityAmount || 0);

                return (
                  <TouchableOpacity
                    key={circle.id}
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() => openCircle(circle)}
                  >
                    <View style={styles.cardTop}>
                      <View style={[styles.cardIcon, { backgroundColor: pending ? colors.fill : meta.bg }]}>
                        <Icon size={22} color={pending ? colors.subtle : meta.fg} strokeWidth={1.8} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.cardName} numberOfLines={2}>
                          {circle.name}
                        </Text>
                        <Text style={styles.cardType} numberOfLines={1}>
                          {meta.label} · {isFounder ? 'Fondateur' : 'Membre'}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={colors.subtle} />
                    </View>

                    <View style={styles.cardStats}>
                      <Stat label={isAid ? 'Objectif' : 'Cotisation'} value={formatXOF(amount)} />
                      <Stat label={isAid ? 'Contributeurs' : 'Membres'} value={`${circle.memberCount}`} />
                      <Stat label="Fréquence" value={isAid ? '—' : frequencyText[circle.frequency] ?? 'Régulière'} />
                    </View>

                    {pending && (
                      <View style={styles.pendingBox}>
                        <View style={styles.pendingInfo}>
                          <Clock size={16} color={colors.accent.deep} />
                          <Text style={styles.pendingText}>En attente d’activation</Text>
                        </View>
                        <Button
                          title={`Activer · ${formatXOF(CIRCLE_CREATION_FEE)}`}
                          size="sm"
                          onPress={() => openActivation(circle.id)}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },

  toolbar: { backgroundColor: colors.fill, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, gap: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.ink, paddingVertical: 0 },
  chips: { flexDirection: 'row', gap: 8 },

  list: { paddingHorizontal: 16, gap: 12 },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardName: { ...typography.bodyStrong, color: colors.ink },
  cardType: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  cardStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    gap: 12,
  },
  stat: { flex: 1 },
  statLabel: { ...typography.caption, fontWeight: '400', color: colors.muted },
  statValue: { ...typography.callout, fontWeight: '600', color: colors.ink, marginTop: 2 },

  pendingBox: {
    marginTop: 14,
    padding: 12,
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.accent.tint,
  },
  pendingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingText: { ...typography.footnote, fontWeight: '600', color: colors.accent.deep },

  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: { ...typography.headline, color: colors.ink },
  emptyText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
