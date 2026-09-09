import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, UserMinus, LogOut, ShieldCheck, ShieldOff } from 'lucide-react-native';
import {
  getCircle,
  getCircles,
  getCircleMembers,
  getFounderCircleIds,
  getCurrentUser,
  getLedgerEntries,
  removeMember,
  getLateCount,
  getSolidarityValidators,
  toggleSolidarityValidator,
} from '../circleStore';
import { Role } from '@venega/types';

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Président',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function SolidarityMemberProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; userId: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();

  const member = getCircleMembers(circle.id).find((m) => m.userId === params.userId);
  const contributions = getLedgerEntries(circle.id).filter(
    (e) => e.type === 'CREDIT' && e.userId === params.userId
  );
  const total = contributions.reduce((s, e) => s + e.amount, 0);
  const lateCount = getLateCount(circle.id, params.userId);
  const isMemberValidator = getSolidarityValidators(circle.id).includes(params.userId);
  const [, forceRender] = useState(0);

  const initials = (first?: string, last?: string) =>
    ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '?';

  const handleToggleValidator = () => {
    if (!member) return;
    const result = toggleSolidarityValidator(circle.id, member.userId);
    if (!result.success) {
      Alert.alert('Impossible pour le moment', result.reason);
      return;
    }
    forceRender((n) => n + 1);
  };

  const handleRemove = () => {
    if (!member) return;
    Alert.alert(
      'Retirer du cercle ?',
      `${member.user.firstName} ${member.user.lastName} ne fera plus partie de la caisse de solidarité "${circle.name}".`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            removeMember(circle.id, member.userId);
            router.back();
          },
        },
      ]
    );
  };

  const handleLeave = () => {
    if (!member) return;
    Alert.alert(
      'Quitter le cercle ?',
      `Vous ne ferez plus partie de la caisse de solidarité "${circle.name}".`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => {
            removeMember(circle.id, member.userId);
            router.push('/(tabs)/circles');
          },
        },
      ]
    );
  };

  if (!member) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
          <TouchableOpacity style={styles.notFoundBack} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1A202C" />
          </TouchableOpacity>
          <Text style={styles.notFoundText}>Membre introuvable.</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1A202C" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{initials(member.user.firstName, member.user.lastName)}</Text>
            </View>
            <Text style={styles.name}>{member.user.firstName} {member.user.lastName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleLabel[member.role]}</Text>
            </View>
            <Text style={styles.meta}>
              {member.user.phoneNumber} · Membre depuis {formatDate(member.joinedAt)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatXOF(total)}</Text>
              <Text style={styles.statLabel}>Total cotisé</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{contributions.length}</Text>
              <Text style={styles.statLabel}>Cotisation(s)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, lateCount > 0 && styles.statValueWarning]}>{lateCount}</Text>
              <Text style={styles.statLabel}>Retard(s)</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Ses cotisations</Text>
          {contributions.length === 0 ? (
            <Text style={styles.emptyText}>Aucune cotisation enregistrée pour ce membre.</Text>
          ) : (
            contributions.map((c, idx) => (
              <View key={c.id} style={[styles.contribRow, idx === contributions.length - 1 && styles.contribRowLast]}>
                <Text style={styles.contribDate}>{formatDate(c.createdAt)}</Text>
                <Text style={styles.contribAmount}>+{formatXOF(c.amount)}</Text>
              </View>
            ))
          )}

          {member.userId === me.id ? (
            <TouchableOpacity style={styles.removeBtn} activeOpacity={0.85} onPress={handleLeave}>
              <LogOut size={16} color="#E53E3E" />
              <Text style={styles.removeBtnText}>Quitter le cercle</Text>
            </TouchableOpacity>
          ) : (
            isFounder && (
              <>
                <TouchableOpacity style={styles.validatorBtn} activeOpacity={0.85} onPress={handleToggleValidator}>
                  {isMemberValidator ? (
                    <ShieldOff size={16} color="#B9852A" />
                  ) : (
                    <ShieldCheck size={16} color="#0B6E4F" />
                  )}
                  <Text style={[styles.validatorBtnText, isMemberValidator && styles.validatorBtnTextRemove]}>
                    {isMemberValidator ? 'Retirer le droit d\'approbateur' : 'Nommer approbateur'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} activeOpacity={0.85} onPress={handleRemove}>
                  <UserMinus size={16} color="#E53E3E" />
                  <Text style={styles.removeBtnText}>Retirer du cercle</Text>
                </TouchableOpacity>
                <Text style={styles.removeHint}>Visible uniquement par le fondateur</Text>
              </>
            )
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  notFoundBack: { margin: 20, width: 38, height: 38, justifyContent: 'center' },
  notFoundText: { fontFamily: 'WorkSans', fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 40 },
  topBar: { paddingHorizontal: 20, paddingTop: 4 },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },
  profileHeader: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  avatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#0B6E4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: { fontFamily: 'SoraBold', fontSize: 28, color: '#FFFFFF' },
  name: { fontFamily: 'SoraBold', fontSize: 19, color: '#1A202C', marginTop: 4 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: '#E4F0EB' },
  roleBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 11, color: '#0B6E4F' },
  meta: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#94A3B8' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
    borderRadius: 16,
    paddingVertical: 14,
  },
  statValue: { fontFamily: 'SoraBold', fontSize: 17, color: '#1A202C' },
  statValueWarning: { color: '#B9852A' },
  statLabel: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8', marginTop: 2 },
  sectionLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#1A202C',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  emptyText: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#94A3B8' },
  contribRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6',
  },
  contribRowLast: { borderBottomWidth: 0 },
  contribDate: { fontFamily: 'WorkSans', fontSize: 13, color: '#475569' },
  contribAmount: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#0B6E4F' },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFECEC',
    marginTop: 24,
  },
  removeBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#E53E3E' },
  removeHint: { fontFamily: 'WorkSans', fontSize: 10.5, color: '#94A3B8', textAlign: 'center', marginTop: 6 },
  validatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E4F0EB',
    marginTop: 24,
  },
  validatorBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#0B6E4F' },
  validatorBtnTextRemove: { color: '#B9852A' },
});
