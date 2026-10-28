import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserMinus, LogOut, ShieldCheck, ShieldOff, Receipt, SearchX } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { ListGroup, ListRow } from '../../../components/ui';
import { Avatar, EmptyState, RoleBadge, ScreenHeader, cardStyle } from '../components/SolidarityParts';
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
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Profil du membre" onBack={() => router.back()} />
          <EmptyState icon={SearchX} title="Membre introuvable" text="Ce membre ne fait plus partie du cercle." style={styles.notFound} />
        </SafeAreaView>
      </View>
    );
  }

  const fullName = `${member.user.firstName} ${member.user.lastName}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Profil du membre" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <Avatar name={fullName} userId={member.userId} photoUrl={member.user.avatarUrl} size={80} />
            <Text style={styles.name}>{fullName}</Text>
            <RoleBadge role={member.role} label={roleLabel[member.role]} always />
            <Text style={styles.meta}>
              {member.user.phoneNumber} · Membre depuis {formatDate(member.joinedAt)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[cardStyle, styles.statCard]}>
              <Text style={styles.statValue}>{formatXOF(total)}</Text>
              <Text style={styles.statLabel}>Total cotisé</Text>
            </View>
            <View style={[cardStyle, styles.statCard]}>
              <Text style={styles.statValue}>{contributions.length}</Text>
              <Text style={styles.statLabel}>Cotisation(s)</Text>
            </View>
            <View style={[cardStyle, styles.statCard]}>
              <Text style={[styles.statValue, lateCount > 0 && styles.statValueWarning]}>{lateCount}</Text>
              <Text style={styles.statLabel}>Retard(s)</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Ses cotisations</Text>
          {contributions.length === 0 ? (
            <View style={cardStyle}>
              <EmptyState icon={Receipt} title="Aucune cotisation" text="Aucune cotisation enregistrée pour ce membre." />
            </View>
          ) : (
            <View style={[cardStyle, styles.listCard]}>
              {contributions.map((c, idx) => (
                <View key={c.id} style={[styles.contribRow, idx < contributions.length - 1 && styles.rowBorder]}>
                  <Text style={styles.contribDate}>{formatDate(c.createdAt)}</Text>
                  <Text style={styles.contribAmount}>+{formatXOF(c.amount)}</Text>
                </View>
              ))}
            </View>
          )}

          {member.userId === me.id ? (
            <ListGroup style={styles.actions}>
              <ListRow icon={LogOut} tone="danger" title="Quitter le cercle" onPress={handleLeave} chevron={false} last />
            </ListGroup>
          ) : (
            isFounder && (
              <>
                <ListGroup title="Gestion" style={styles.actions}>
                  <ListRow
                    icon={isMemberValidator ? ShieldOff : ShieldCheck}
                    tone={isMemberValidator ? 'neutral' : 'primary'}
                    title={isMemberValidator ? 'Retirer le droit d\'approbateur' : 'Nommer approbateur'}
                    onPress={handleToggleValidator}
                    chevron={false}
                  />
                  <ListRow icon={UserMinus} tone="danger" title="Retirer du cercle" onPress={handleRemove} chevron={false} last />
                </ListGroup>
                <Text style={styles.actionsHint}>Visible uniquement par le fondateur</Text>
              </>
            )
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  notFound: { marginTop: 40 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 48 },

  profileHeader: { alignItems: 'center', gap: 8, paddingTop: 8, paddingBottom: 24 },
  name: { ...typography.title, color: colors.ink, textAlign: 'center', marginTop: 4 },
  meta: { ...typography.footnote, color: colors.muted, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6 },
  statValue: { ...typography.bodyStrong, color: colors.ink, textAlign: 'center' },
  statValueWarning: { color: colors.accent.deep },
  statLabel: { ...typography.caption, fontWeight: '400', color: colors.muted, marginTop: 2, textAlign: 'center' },

  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 12 },
  listCard: { overflow: 'hidden' },
  contribRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  contribDate: { ...typography.callout, color: colors.inkSoft },
  contribAmount: { ...typography.callout, fontWeight: '600', color: colors.primary.DEFAULT },

  actions: { marginTop: 28 },
  actionsHint: { ...typography.footnote, color: colors.muted, textAlign: 'center', marginTop: 8 },
});
