import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchX, ShieldCheck, FileX } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Avatar } from '../../../components/ui';
import { EmptyState, RoleBadge, ScreenHeader, cardStyle } from '../components/SolidarityParts';
import { MemberDocuments } from '../components/MemberDocuments';
import {
  getCircle,
  getCircles,
  getCircleMembers,
  getFounderCircleIds,
  getMemberDocuments,
  getMembershipRequests,
} from '../circleStore';
import { Role } from '@venega/types';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Profil d'un membre de tontine (route `/circle/[id]/member/[userId]`). */
export default function MemberProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; userId: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const isFounder = getFounderCircleIds().includes(circle.id);

  const member = getCircleMembers(circle.id).find((m) => m.userId === params.userId);
  const docs = getMemberDocuments(circle.id, params.userId);
  // Repli : membre validé mais pas encore dans la liste des membres → infos de sa demande.
  const request = member
    ? undefined
    : getMembershipRequests(circle.id).find((r) => r.userId === params.userId);

  if (!member && !request) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Profil du membre" onBack={() => router.back()} />
          <EmptyState icon={SearchX} title="Membre introuvable" text="Ce membre ne fait plus partie du cercle." style={styles.notFound} />
        </SafeAreaView>
      </View>
    );
  }

  const fullName = member ? `${member.user.firstName} ${member.user.lastName}` : request!.fullName;
  const phone = member?.user.phoneNumber ?? request!.phoneNumber;
  const avatarUrl = member?.user.avatarUrl ?? request?.user?.avatarUrl;
  // Tontine : seulement Fondateur ou Membre (pas de trésorier / secrétaire).
  const isMemberFounder = member?.role === Role.PRESIDENT;
  const role = isMemberFounder ? Role.PRESIDENT : Role.MEMBER;
  const roleLabel = isMemberFounder ? 'Fondateur' : 'Membre';

  const infoRows: { label: string; value: string }[] = [];
  if (member?.turnOrder !== undefined) infoRows.push({ label: 'Tour de passage', value: `Tour ${member.turnOrder}` });
  infoRows.push({ label: 'Membre depuis', value: formatDate(member?.joinedAt ?? request?.decidedAt ?? request?.createdAt) });
  if (docs?.depositNumber) infoRows.push({ label: 'Numéro Mobile Money', value: docs.depositNumber });
  if (member && typeof member.reliabilityScore === 'number') {
    infoRows.push({ label: 'Score de fiabilité', value: `${member.reliabilityScore} / 100` });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Profil du membre" subtitle={circle.name} onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <Avatar name={fullName} uri={avatarUrl} size={56} />
            <Text style={styles.name}>{fullName}</Text>
            <RoleBadge role={role} label={roleLabel} always />
            <Text style={styles.meta}>{phone}</Text>
          </View>

          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={[cardStyle, styles.infoCard]}>
            {infoRows.map((r, idx) => (
              <View key={r.label} style={[styles.infoRow, idx < infoRows.length - 1 && styles.rowBorder]}>
                <Text style={styles.infoLabel}>{r.label}</Text>
                <Text style={styles.infoValue}>{r.value}</Text>
              </View>
            ))}
          </View>

          {!docs ? (
            <>
              <Text style={[styles.sectionTitle, styles.sectionGap]}>Documents</Text>
              <View style={cardStyle}>
                <EmptyState icon={FileX} title="Aucun document fourni" />
              </View>
            </>
          ) : isFounder ? (
            <>
              <Text style={[styles.sectionTitle, styles.sectionGap]}>Documents</Text>
              <MemberDocuments
                title={null}
                fullName={fullName}
                phoneNumber={phone}
                avatarUrl={avatarUrl}
                cnibFrontUrl={docs.cnibFrontUrl}
                cnibBackUrl={docs.cnibBackUrl}
                selfieUrl={docs.selfieUrl}
              />
              <Text style={styles.hint}>
                Fournis le {formatDate(docs.submittedAt)} · Visible uniquement par le fondateur
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, styles.sectionGap]}>Documents</Text>
              <View style={[cardStyle, styles.verifiedRow]}>
                <ShieldCheck size={20} color={colors.primary.DEFAULT} />
                <Text style={styles.verifiedText}>Documents vérifiés par le fondateur</Text>
              </View>
            </>
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

  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 12 },
  sectionGap: { marginTop: 28 },
  infoCard: { paddingHorizontal: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  infoLabel: { ...typography.callout, color: colors.muted, flexShrink: 1 },
  infoValue: { ...typography.callout, fontWeight: '600', color: colors.ink, textAlign: 'right', flexShrink: 1 },

  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  verifiedText: { ...typography.callout, color: colors.inkSoft, flexShrink: 1 },
  hint: { ...typography.footnote, color: colors.muted, textAlign: 'center', marginTop: 8 },
});
