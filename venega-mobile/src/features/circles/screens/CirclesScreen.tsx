import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter } from 'expo-router';
import { Users, Coins, ArrowRight, Plus, LogIn } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockCircles } from '@venega/types';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export default function CirclesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Cercles</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/circles/join')}>
            <LogIn size={18} color={colors.primary.DEFAULT} />
            <Text style={styles.headerBtnText}>Rejoindre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtnPrimary} onPress={() => router.push('/circles/create')}>
            <Plus size={18} color="#fff" />
            <Text style={styles.headerBtnPrimaryText}>Créer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {mockCircles.map((circle, index) => (
          <Animated.View key={circle.id} entering={FadeInDown.delay(index * 80).duration(500)}>
            <TouchableOpacity
              style={styles.circleCard}
              onPress={() => router.push(`/circle/${circle.id}`)}
            >
              <View style={styles.circleIcon}>
                <Users size={20} color={colors.primary.DEFAULT} />
              </View>
              <View style={styles.circleInfo}>
                <Text style={styles.circleName}>{circle.name}</Text>
                <Text style={styles.circleMeta}>
                  {circle.type === 'TONTINE_ONLY' ? 'Tontine' : circle.type === 'SOLIDARITY_ONLY' ? 'Solidarité' : 'Hybride'} — {circle.memberCount} membres
                </Text>
              </View>
              <View style={styles.circleRight}>
                <Text style={styles.circleAmount}>{formatXOF(circle.tontineAmount)}</Text>
                <ArrowRight size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[3] },
  headerActions: { flexDirection: 'row', gap: spacing[2] },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  headerBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary.DEFAULT, fontFamily: 'WorkSans' },
  headerBtnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.primary.DEFAULT, borderRadius: 12 },
  headerBtnPrimaryText: { fontSize: 13, fontWeight: '600', color: '#fff', fontFamily: 'WorkSans' },
  scroll: { padding: spacing[5], paddingBottom: 40 },
  circleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[3] },
  circleIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  circleInfo: { flex: 1 },
  circleName: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  circleMeta: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: 2 },
  circleRight: { alignItems: 'flex-end', gap: 4 },
  circleAmount: { fontSize: 14, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
});
