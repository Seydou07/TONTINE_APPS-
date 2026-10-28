import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Gift,
  HeartHandshake,
  History,
  Plus,
  UserPlus,
  Users,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { mockCurrentUser, mockTransactions, CircleType, TransactionStatus, TransactionType } from '@venega/types';
import type { Circle } from '@venega/types';
import { getCircles } from '../../circles/circleStore';

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F';

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const isContribution = (type: string) =>
  type === TransactionType.TONTINE_CONTRIBUTION || type === TransactionType.SOLIDARITY_CONTRIBUTION;

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
  const mine = mockTransactions.filter((t) => t.userId === me.id && t.status === TransactionStatus.COMPLETED);
  const totalPaid = mine.filter((t) => isContribution(t.type)).reduce((s, t) => s + t.amount, 0);
  const totalReceived = mine.filter((t) => t.type === TransactionType.PAYOUT).reduce((s, t) => s + t.amount, 0);

  const circleIds = new Set(circles.map((c) => c.id));
  const recent = mockTransactions
    .filter((t) => circleIds.has(t.circleId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const openCircle = (c: Circle) => {
    if (c.type === CircleType.AID_APPEAL) router.push(`/aid/${c.id}` as any);
    else if (c.type === CircleType.SOLIDARITY_ONLY) router.push(`/circle/${c.id}/solidarity` as any);
    else if (c.type === CircleType.TONTINE_ONLY) router.push(`/circle/${c.id}/tontine` as any);
    else router.push(`/circle/${c.id}` as any);
  };

  const actions: { label: string; icon: LucideIcon; route: string }[] = [
    { label: 'Créer', icon: Plus, route: '/circles/create' },
    { label: 'Rejoindre', icon: UserPlus, route: '/circles/join' },
    { label: 'Cercles', icon: Users, route: '/(tabs)/circles' },
    { label: 'Historique', icon: History, route: '/activity' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── En-tête ── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
              {me.avatarUrl ? (
                <Image source={{ uri: me.avatarUrl }} style={styles.avatar} contentFit="cover" transition={200} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>{me.firstName.charAt(0)}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.flex}>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {me.firstName}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bell}
              onPress={() => router.push('/(tabs)/notifications')}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell size={22} color={colors.ink} strokeWidth={1.8} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* ── Synthèse ── */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total cotisé</Text>
            <Text style={styles.balanceValue}>{formatXOF(totalPaid)}</Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Cagnottes reçues</Text>
                <Text style={styles.balanceItemValue}>{formatXOF(totalReceived)}</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Cercles actifs</Text>
                <Text style={styles.balanceItemValue}>{circles.filter((c) => !!c.activatedAt).length}</Text>
              </View>
            </View>
          </View>

          {/* ── Actions rapides ── */}
          <View style={styles.actions}>
            {actions.map(({ label, icon: Icon, route }) => (
              <TouchableOpacity
                key={label}
                style={styles.action}
                activeOpacity={0.7}
                onPress={() => router.push(route as any)}
              >
                <View style={styles.actionIcon}>
                  <Icon size={22} color={colors.primary.dark} strokeWidth={1.8} />
                </View>
                <Text style={styles.actionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Mes cercles ── */}
          <SectionHeader title="Mes cercles" onSeeAll={() => router.push('/(tabs)/circles')} />
          <View style={styles.card}>
            {circles.slice(0, 4).map((c, i, list) => {
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
                    <ChevronRight size={18} color={colors.subtle} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Activité récente ── */}
          <SectionHeader title="Activité récente" onSeeAll={() => router.push('/activity' as any)} />
          <View style={styles.card}>
            {recent.map((t, i) => {
              const credit = isContribution(t.type);
              const pending = t.status === TransactionStatus.PENDING;
              const Icon = credit ? ArrowUpRight : ArrowDownLeft;
              const circleName = circles.find((c) => c.id === t.circleId)?.name ?? '';
              const label = credit ? `Cotisation de ${t.memberName.split(' ')[0]}` : `Cagnotte versée à ${t.memberName.split(' ')[0]}`;
              return (
                <View key={t.id} style={styles.row}>
                  <View
                    style={[
                      styles.rowIcon,
                      styles.rowIconRound,
                      { backgroundColor: pending ? colors.accent.tint : credit ? colors.primary.tint : colors.fill },
                    ]}
                  >
                    <Icon size={18} color={pending ? colors.accent.dark : credit ? colors.primary.DEFAULT : colors.inkSoft} />
                  </View>
                  <View style={[styles.rowBody, i < recent.length - 1 && styles.rowBorder]}>
                    <View style={styles.flex}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {label}
                      </Text>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {circleName} · {formatDay(t.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.amountCol}>
                      <Text style={[styles.amount, { color: credit ? colors.primary.DEFAULT : colors.ink }]}>
                        {credit ? '+' : '−'}
                        {formatXOF(t.amount)}
                      </Text>
                      {pending && <Text style={styles.pending}>En attente</Text>}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} hitSlop={8} activeOpacity={0.6}>
        <Text style={styles.seeAll}>Voir tout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { ...typography.headline, color: colors.primary.dark },
  greeting: { ...typography.footnote, color: colors.muted },
  userName: { ...typography.headline, fontSize: 18, fontWeight: '700', color: colors.ink },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger.DEFAULT,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },

  balanceCard: {
    backgroundColor: colors.primary.dark,
    borderRadius: 24,
    padding: 20,
  },
  balanceLabel: { ...typography.footnote, color: 'rgba(255,255,255,0.72)' },
  balanceValue: { ...typography.display, color: '#FFFFFF', marginTop: 4 },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  balanceItem: { flex: 1 },
  balanceItemLabel: { ...typography.caption, fontWeight: '400', color: 'rgba(255,255,255,0.72)' },
  balanceItemValue: { ...typography.bodyStrong, color: '#FFFFFF', marginTop: 2 },
  balanceDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },

  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  action: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { ...typography.footnote, fontWeight: '500', color: colors.ink },

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
  rowIconRound: { borderRadius: 20 },
  rowIconOff: { backgroundColor: colors.fill },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingRight: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  amountCol: { alignItems: 'flex-end' },
  amount: { ...typography.callout, fontWeight: '700' },
  pending: { ...typography.caption, color: colors.accent.dark, marginTop: 2 },
});
