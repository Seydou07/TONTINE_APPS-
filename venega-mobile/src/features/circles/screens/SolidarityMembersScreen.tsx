import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getCircle, getCircles, getCircleMembers, getCurrentUser } from '../circleStore';
import { Role } from '@venega/types';

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Présidente',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

const roleBadgeStyle: Partial<Record<Role, { bg: string; color: string }>> = {
  [Role.PRESIDENT]: { bg: '#FBF1DD', color: '#B9852A' },
  [Role.TREASURER]: { bg: '#E4F0EB', color: '#0B6E4F' },
  [Role.SECRETARY]: { bg: '#EBF8FF', color: '#3182CE' },
};

const rolePriority: Record<Role, number> = {
  [Role.PRESIDENT]: 0,
  [Role.TREASURER]: 1,
  [Role.SECRETARY]: 2,
  [Role.MEMBER]: 3,
};

const avatarPalette = ['#D9A441', '#0B6E4F', '#7A4E9C', '#3182CE', '#B9852A', '#E53E3E'];

const avatarColor = (userId: string) => {
  const sum = userId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length];
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

  const initials = (first?: string, last?: string) =>
    ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#1A202C" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Membres</Text>
          </View>
          <Text style={styles.headerSub}>{members.length} membres · {circle.name}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {members.map((m, idx) => {
            const badge = roleBadgeStyle[m.role];
            return (
              <TouchableOpacity
                key={m.userId}
                activeOpacity={0.75}
                style={[styles.memberRow, idx === members.length - 1 && styles.memberRowLast]}
                onPress={() => router.push({ pathname: '/circle/[id]/solidarity-member/[userId]', params: { id: circle.id, userId: m.userId } })}
              >
                <View style={[styles.avatar, { backgroundColor: avatarColor(m.userId) }]}>
                  <Text style={styles.avatarText}>{initials(m.user.firstName, m.user.lastName)}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {m.user.firstName} {m.user.lastName}{m.userId === me.id ? ' (Moi)' : ''}
                  </Text>
                  <View style={styles.memberMetaRow}>
                    {badge && (
                      <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.roleBadgeText, { color: badge.color }]}>{roleLabel[m.role]}</Text>
                      </View>
                    )}
                    <Text style={styles.memberSince}>Membre depuis {formatMonthYear(m.joinedAt)}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#CBD5E1" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14, gap: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginLeft: -6 },
  headerTitle: { fontFamily: 'SoraBold', fontSize: 20, color: '#1A202C' },
  headerSub: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#94A3B8', marginLeft: 32 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6',
    gap: 12,
  },
  memberRowLast: { borderBottomWidth: 0 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: 'SoraBold', fontSize: 14, color: '#FFFFFF' },
  memberInfo: { flex: 1, gap: 4 },
  memberName: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#0F172A' },
  memberMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  roleBadge: { paddingHorizontal: 9, paddingVertical: 2.5, borderRadius: 7 },
  roleBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 10.5 },
  memberSince: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8' },
});
