import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { getCircle, getCircles, getCircleMembers, getCurrentUser } from '../circleStore';
import { Role } from '@venega/types';
import { Avatar } from '../../../components/ui';
import { RoleBadge, ScreenHeader, cardStyle } from '../components/SolidarityParts';

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Présidente',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

const rolePriority: Record<Role, number> = {
  [Role.PRESIDENT]: 0,
  [Role.TREASURER]: 1,
  [Role.SECRETARY]: 2,
  [Role.MEMBER]: 3,
};

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

export default function SolidarityMembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const me = getCurrentUser();
  const members = [...getCircleMembers(circle.id)].sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Membres" subtitle={`${members.length} membres · ${circle.name}`} onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[cardStyle, styles.listCard]}>
            {members.map((m, idx) => {
              const fullName = `${m.user.firstName} ${m.user.lastName}`;
              return (
                <TouchableOpacity
                  key={m.userId}
                  activeOpacity={0.6}
                  style={styles.row}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/circle/[id]/solidarity-member/[userId]', params: { id: circle.id, userId: m.userId } })}
                >
                  <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                  <View style={[styles.rowBody, idx < members.length - 1 && styles.rowBorder]}>
                    <View style={styles.flex}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {fullName}{m.userId === me.id ? ' (Moi)' : ''}
                      </Text>
                      <View style={styles.meta}>
                        <RoleBadge role={m.role} label={roleLabel[m.role]} />
                        <Text style={styles.rowSub}>Membre depuis {formatMonthYear(m.joinedAt)}</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={colors.subtle} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },
  listCard: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 12 },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingRight: 14,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 3 },
});
