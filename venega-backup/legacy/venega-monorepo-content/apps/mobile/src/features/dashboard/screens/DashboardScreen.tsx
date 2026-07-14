import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Users, Coins, CheckCircle2, AlertCircle, ArrowRight, Bell, Search } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, radius } from '../../../../packages/design-tokens/src';
import { mockCircles, mockCurrentUser, mockCircleStats } from '../../../../packages/types/src/mock-data';
import CircleCard from '../components/CircleCard';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Bonjour,</Text>
          <Text style={styles.nameText}>{mockCurrentUser.firstName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={20} color={colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Rechercher...</Text>
        </Animated.View>

        {/* Hero Image */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.heroContainer}>
          <Image
            source="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Gérez vos économies avec transparence</Text>
            <Text style={styles.heroSubtitle}>
              Venega vous aide à organiser vos tontines et vos caisses de solidarité
            </Text>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total collecté', value: formatXOF(mockCircleStats.totalCollected), icon: Coins, iconColor: colors.primary.DEFAULT, iconBg: colors.primary.tint, delay: 300 },
            { label: 'Membres actifs', value: mockCircleStats.memberCount.toString(), icon: Users, iconColor: colors.accent.DEFAULT, iconBg: colors.accent.tint, delay: 350 },
          ].map((stat, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(stat.delay).duration(600)}
              style={[styles.statCard, { flex: 1, marginRight: index === 0 ? spacing[3] : 0 }]}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                <stat.icon size={24} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Payé ce mois', value: mockCircleStats.paidCount.toString(), icon: CheckCircle2, iconColor: colors.primary.DEFAULT, iconBg: colors.primary.tint, delay: 400 },
            { label: 'En retard', value: mockCircleStats.lateCount.toString(), icon: AlertCircle, iconColor: colors.danger.DEFAULT, iconBg: colors.danger.tint, delay: 450 },
          ].map((stat, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(stat.delay).duration(600)}
              style={[styles.statCard, { flex: 1, marginRight: index === 0 ? spacing[3] : 0 }]}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                <stat.icon size={24} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* My Circles Header */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes cercles</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Voir tout</Text>
            <ArrowRight size={16} color={colors.primary.DEFAULT} />
          </TouchableOpacity>
        </Animated.View>

        {/* Circles List */}
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
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  greetingText: { fontSize: 16, color: colors.textMuted, fontFamily: 'WorkSans' },
  nameText: { fontSize: 24, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  notificationButton: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  notificationBadge: {
    position: 'absolute', top: 10, right: 10, width: 8, height: 8,
    borderRadius: 4, backgroundColor: colors.accent.DEFAULT,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing[6], paddingBottom: spacing[8] },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing[4], paddingVertical: spacing[3], marginBottom: spacing[6],
  },
  searchIcon: { marginRight: spacing[3] },
  searchPlaceholder: { fontSize: 16, color: colors.textMuted, fontFamily: 'WorkSans' },
  heroContainer: { borderRadius: radius.lg, overflow: 'hidden', height: 200, marginBottom: spacing[6] },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 110, 79, 0.65)',
  },
  heroContent: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', padding: spacing[6] },
  heroTitle: {
    fontSize: 20, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Sora',
    marginBottom: spacing[2], lineHeight: 26,
  },
  heroSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'WorkSans', lineHeight: 20 },
  statsRow: { flexDirection: 'row', marginBottom: spacing[4] },
  statCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing[5], borderWidth: 1, borderColor: colors.border,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing[3],
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[1] },
  statLabel: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing[4], marginBottom: spacing[4],
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'Sora' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  seeAllText: { fontSize: 14, fontWeight: '500', color: colors.primary.DEFAULT, fontFamily: 'WorkSans' },
});
