import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, UserPlus, Copy, Share2, Clock } from 'lucide-react-native';
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

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  };

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1A202C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inviter un membre</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introBlock}>
            <View style={styles.introIcon}>
              <UserPlus size={26} color="#0B6E4F" />
            </View>
            <Text style={styles.introTitle}>Tout membre peut inviter</Text>
            <Text style={styles.introText}>
              Partagez ce code avec la personne. Sa demande arrivera au fondateur pour validation
              avant qu'elle ne rejoigne le cercle.
            </Text>
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Code d'invitation</Text>
            <Text style={styles.codeValue}>{circle.inviteCode}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.85} onPress={handleCopy}>
              <Copy size={16} color="#1A202C" />
              <Text style={styles.actionBtnSecondaryText}>Copier le code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnPrimary} activeOpacity={0.88} onPress={handleShare}>
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnPrimaryText}>Partager</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.sectionLabel}>En attente d'approbation</Text>
            {pending.length === 0 ? (
              <Text style={styles.emptyText}>Aucune demande en attente pour le moment.</Text>
            ) : (
              pending.map((r) => (
                <View key={r.id} style={styles.pendingRow}>
                  <View style={styles.pendingAvatar}>
                    <Text style={styles.pendingAvatarText}>{initials(r.fullName)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pendingName} numberOfLines={1}>{r.fullName}</Text>
                    <Text style={styles.pendingMeta}>Demande envoyée {formatRelative(r.createdAt)}</Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Clock size={13} color="#B9852A" />
                    <Text style={styles.pendingBadgeText}>En attente</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SoraBold', fontSize: 17, color: '#1A202C' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 50, gap: 22 },
  introBlock: { alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  introIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E4F0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: { fontFamily: 'SoraBold', fontSize: 16, color: '#1A202C', textAlign: 'center' },
  introText: { fontFamily: 'WorkSans', fontSize: 12.5, lineHeight: 18, color: '#64748B', textAlign: 'center' },
  codeBox: {
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8' },
  codeValue: { fontFamily: 'SoraBold', fontSize: 22, color: '#074B36', letterSpacing: 2 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
  },
  actionBtnSecondaryText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#1A202C' },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#074B36',
  },
  actionBtnPrimaryText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#FFFFFF' },
  sectionLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#1A202C',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  emptyText: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#94A3B8' },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
    borderRadius: 16,
    padding: 13,
  },
  pendingAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF1DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAvatarText: { fontFamily: 'SoraBold', fontSize: 13, color: '#B9852A' },
  pendingName: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#1A202C' },
  pendingMeta: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8', marginTop: 1 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pendingBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 11, color: '#B9852A' },
});
