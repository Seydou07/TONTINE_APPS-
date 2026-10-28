import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Copy, Share2, Clock, Inbox } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button } from '../../../components/ui';
import { Avatar, EmptyState, ScreenHeader, cardStyle } from '../components/SolidarityParts';
import { getCircle, getCircles, getMembershipRequests } from '../circleStore';
import { MembershipRequestStatus } from '@venega/types';

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
};

export default function SolidarityInviteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;

  const pending = getMembershipRequests(circle.id).filter((r) => r.status === MembershipRequestStatus.PENDING);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(circle.inviteCode);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoins la caisse de solidarité "${circle.name}" sur Venega ! Code d'invitation : ${circle.inviteCode}`,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Inviter un membre" subtitle={circle.name} onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <UserPlus size={24} color={colors.primary.DEFAULT} strokeWidth={1.8} />
            </View>
            <Text style={styles.introTitle}>Tout membre peut inviter</Text>
            <Text style={styles.introText}>
              Partagez ce code avec la personne. Sa demande arrivera au fondateur pour validation
              avant qu'elle ne rejoigne le cercle.
            </Text>
          </View>

          <View style={[cardStyle, styles.codeCard]}>
            <Text style={styles.codeLabel}>Code d'invitation</Text>
            <Text style={styles.codeValue} selectable>{circle.inviteCode}</Text>
            <View style={styles.actionsRow}>
              <Button title="Copier" variant="secondary" size="sm" icon={Copy} onPress={handleCopy} style={styles.flex} />
              <Button title="Partager" size="sm" icon={Share2} onPress={handleShare} style={styles.flex} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>En attente d'approbation</Text>
          {pending.length === 0 ? (
            <View style={cardStyle}>
              <EmptyState icon={Inbox} title="Aucune demande" text="Aucune demande en attente pour le moment." />
            </View>
          ) : (
            <View style={[cardStyle, styles.listCard]}>
              {pending.map((r, idx) => (
                <View key={r.id} style={styles.row}>
                  <Avatar name={r.fullName} size={40} tone="soft" />
                  <View style={[styles.rowBody, idx < pending.length - 1 && styles.rowBorder]}>
                    <View style={styles.flex}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{r.fullName}</Text>
                      <Text style={styles.rowSub}>Demande envoyée {formatRelative(r.createdAt)}</Text>
                    </View>
                    <View style={styles.pendingBadge}>
                      <Clock size={13} color={colors.accent.deep} />
                      <Text style={styles.pendingBadgeText}>En attente</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  intro: { alignItems: 'center', paddingHorizontal: 8, marginBottom: 24 },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  introTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  introText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 6 },

  codeCard: { alignItems: 'center', padding: 20, marginBottom: 28 },
  codeLabel: { ...typography.footnote, color: colors.muted },
  codeValue: { ...typography.title, color: colors.primary.dark, letterSpacing: 2, marginTop: 6, marginBottom: 16 },
  actionsRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },

  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 12 },
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
  rowSub: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pendingBadgeText: { ...typography.caption, fontWeight: '600', color: colors.accent.deep },
});
