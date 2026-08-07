import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Plus, UserPlus, Wallet, History, ArrowRight, Users, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radius } from '@venega/design-tokens';
import { mockCircles, mockCurrentUser, mockCircleStats } from '@venega/types';
import CircleCard from '../components/CircleCard';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const QUICK_ACTIONS = [
  { icon: Plus, label: 'Créer' },
  { icon: UserPlus, label: 'Rejoindre' },
  { icon: Wallet, label: 'Payer' },
  { icon: History, label: 'Historique' },
];

export default function DashboardScreen() {
  const balance = mockCircleStats.totalCollected - mockCircleStats.totalPaidOut;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Bonjour,</Text>
          <Text style={styles.nameText}>{mockCurrentUser.firstName}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.scoreBadge}>
            <ShieldCheck size={16} color={colors.primary.DEFAULT} />
            <Text style={styles.scoreText}>{mockCurrentUser.reputationScore}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
            <Bell size={20} color={colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <LinearGradient
            colors={['#0B6E4F', '#0F8563', '#0B6E4F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceGlow} />
            <View style={styles.balanceTop}>
              <Text style={styles.balanceLabel}>Épargne en cours</Text>
              <View style={styles.balancePill}>
                <Text style={styles.balancePillText}>En XOF</Text>
              </View>
            </View>
            <Text style={styles.balanceAmount}>{formatXOF(balance)}</Text>

            <View style={styles.balanceDivider} />

            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <View style={styles.balanceStatRow}>
                  <Users size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.balanceStatValue}>{mockCircleStats.memberCount}</Text>
                </View>
                <Text style={styles.balanceStatLabel}>Membres actifs</Text>
              </View>
              <View style={styles.balanceStatCenter}>
                <View style={styles.balanceStatRow}>
                  <ShieldCheck size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.balanceStatValue}>{mockCurrentUser.reputationScore}%</Text>
                </View>
                <Text style={styles.balanceStatLabel}>Fiabilité</Text>
              </View>
              <View style={styles.balanceStat}>
                <View style={styles.balanceStatRow}>
                  <Wallet size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.balanceStatValue}>{mockCircleStats.paidCount}/{mockCircleStats.memberCount}</Text>
                </View>
                <Text style={styles.balanceStatLabel}>Payés ce mois</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, index) => (
            <Animated.View
              key={action.label}
              entering={FadeInDown.delay(200 + index * 60).duration(600)}
              style={styles.actionTile}
            >
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <View style={styles.actionIcon}>
                  <action.icon size={24} color={colors.primary.DEFAULT} strokeWidth={1.9} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Mes cercles</Text>
          <TouchableOpacity style={styles.seeAllButton} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Voir tout</Text>
            <ArrowRight size={16} color={colors.primary.DEFAULT} />
          </TouchableOpacity>
        </Animated.View>

        {mockCircles.map((circle, index) => (
          <Animated.View
            key={circle.id}
            entering={FadeInDown.delay(550 + index * 50).duration(600)}
          >
            <CircleCard circle={circle} />
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  greetingText: { fontFamily: 'WorkSans', fontSize: 15, color: colors.textMuted },
  nameText: { fontFamily: 'SoraBold', fontSize: 24, color: colors.text, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary.tint,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  scoreText: { fontFamily: 'SoraBold', fontSize: 14, color: colors.primary.DEFAULT },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.DEFAULT,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, gap: 0 },
  balanceCard: {
    borderRadius: radius.lg,
    padding: 24,
    overflow: 'hidden',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  balanceGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -80,
    right: -60,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: { fontFamily: 'WorkSansMedium', fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  balancePill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  balancePillText: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#FFFFFF' },
  balanceAmount: {
    fontFamily: 'SoraBold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 18,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceStat: { flex: 1, alignItems: 'flex-start' },
  balanceStatCenter: { flex: 1, alignItems: 'center' },
  balanceStatRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  balanceStatValue: { fontFamily: 'SoraBold', fontSize: 16, color: '#FFFFFF' },
  balanceStatLabel: { fontFamily: 'WorkSans', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  actionTile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  actionButton: { alignItems: 'center', gap: 10 },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 14, color: colors.text },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: { fontFamily: 'SoraBold', fontSize: 18, color: colors.text },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontFamily: 'WorkSansSemiBold', fontSize: 14, color: colors.primary.DEFAULT },
});
