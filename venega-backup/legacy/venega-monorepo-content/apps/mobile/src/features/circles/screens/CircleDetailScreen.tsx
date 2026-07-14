import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Users, MessageSquare } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../../packages/design-tokens/src';
import { mockCircles, mockMemberships, mockUsers } from '../../../../packages/types/src/mock-data';

export default function CircleDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id;

  const circle = mockCircles.find((c) => c.id === circleId) || mockCircles[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circleId);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{circle.name}</Text>
        </View>

        {/* Hero Image Placeholder */}
        <View style={styles.hero} />

        {/* Circle Type / Info */}
        <View style={styles.infoSection}>
          <Text style={styles.circleType}>
            {circle.type === 'TONTINE_ONLY' ? 'Tontine' : circle.type === 'SOLIDARITY_ONLY' ? 'Solidarité' : 'Tontine + Solidarité'}
          </Text>

          {/* Tontine-specific: Rotation Wheel Placeholder */}
          {circle.type !== 'SOLIDARITY_ONLY' && (
            <View style={styles.rotationContainer}>
              <Text style={styles.sectionTitle}>Tour actuel</Text>
              <View style={styles.beneficiaryCard}>
                <Image
                  source={{
                    uri: mockUsers[1].avatarUrl || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=64&h=64&fit=crop&crop=face',
                  }}
                  style={styles.beneficiaryAvatar}
                />
                <View style={styles.beneficiaryText}>
                  <Text style={styles.beneficiaryName}>{mockUsers[1].displayName}</Text>
                  <Text style={styles.beneficiaryAmount}>
                    {circle.tontineAmount.toLocaleString()} F CFA
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Solidarity-specific: Balance / Goal */}
          {circle.type !== 'TONTINE_ONLY' && (
            <View style={styles.solidarityContainer}>
              <Text style={styles.sectionTitle}>Fonds de solidarité</Text>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Solde disponible</Text>
                <Text style={styles.balanceAmount}>120 000 F CFA</Text>
              </View>
              <View style={styles.goalBar}>
                <View style={styles.goalProgress} />
              </View>
              <Text style={styles.goalText}>Objectif : 200 000 F CFA</Text>
            </View>
          )}

          {/* Members List */}
          <View style={styles.membersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Membres ({memberships.length})</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.membersList}>
              {memberships.map((membership, i) => {
                const user = mockUsers.find((u) => u.id === membership.userId) || mockUsers[0];
                return (
                  <View key={i} style={styles.memberRow}>
                    <Image
                      source={{
                        uri: user.avatarUrl || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=48&h=48&fit=crop&crop=face',
                      }}
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{user.displayName}</Text>
                      <Text style={styles.memberRole}>
                        {membership.role === 'PRESIDENT' ? 'Président' : membership.role === 'TREASURER' ? 'Trésorier' : 'Membre'}
                      </Text>
                    </View>
                    <View style={styles.paymentBadge}>
                      <Text style={styles.paymentBadgeText}>Payé</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnChat}>
          <MessageSquare size={20} color={colors.text} />
          <Text style={styles.btnChatText}>Discussion</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push(`/circle/${circleId}/pay`)}
        >
          <Text style={styles.btnPrimaryText}>
            Payer {circle.tontineAmount.toLocaleString()} F CFA
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollView: { flex: 1 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingHorizontal: spacing[6], paddingVertical: spacing[6],
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Sora', fontSize: 20, fontWeight: '700', color: '#fff', marginLeft: spacing[4],
  },
  hero: { width: '100%', height: 200, backgroundColor: colors.primary.DEFAULT },
  infoSection: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    marginTop: -24, paddingTop: spacing[6], paddingHorizontal: spacing[6],
  },
  circleType: {
    fontFamily: 'WorkSans', fontSize: 14, color: colors.primary.DEFAULT,
    fontWeight: '600', marginBottom: spacing[6],
  },
  sectionTitle: {
    fontFamily: 'Sora', fontSize: 18, fontWeight: '700',
    color: colors.text, marginBottom: spacing[4],
  },
  rotationContainer: { marginBottom: spacing[8] },
  beneficiaryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    padding: spacing[6], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  beneficiaryAvatar: { width: 56, height: 56, borderRadius: 28 },
  beneficiaryText: { marginLeft: spacing[4] },
  beneficiaryName: { fontFamily: 'WorkSans', fontSize: 16, fontWeight: '600', color: colors.text },
  beneficiaryAmount: { fontFamily: 'Sora', fontSize: 18, fontWeight: '700', color: colors.primary.DEFAULT },
  solidarityContainer: { marginBottom: spacing[8] },
  balanceCard: {
    backgroundColor: colors.primary.tint, padding: spacing[6],
    borderRadius: radius.md, marginBottom: spacing[4],
  },
  balanceLabel: { fontFamily: 'WorkSans', fontSize: 14, color: colors.primary.DEFAULT },
  balanceAmount: { fontFamily: 'Sora', fontSize: 28, fontWeight: '700', color: colors.primary.DEFAULT },
  goalBar: {
    height: 10, backgroundColor: colors.border,
    borderRadius: radius.pill, marginBottom: spacing[2],
  },
  goalProgress: {
    width: '60%', height: '100%', backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.pill,
  },
  goalText: { fontFamily: 'WorkSans', fontSize: 14, color: colors.textMuted },
  membersSection: { marginBottom: 120 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAllText: { fontFamily: 'WorkSans', fontSize: 14, color: colors.primary.DEFAULT, fontWeight: '500' },
  membersList: { gap: spacing[4] },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    padding: spacing[6], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  memberAvatar: { width: 48, height: 48, borderRadius: 24 },
  memberInfo: { flex: 1, marginLeft: spacing[4] },
  memberName: { fontFamily: 'WorkSans', fontSize: 15, color: colors.text, fontWeight: '500' },
  memberRole: { fontFamily: 'WorkSans', fontSize: 13, color: colors.textMuted },
  paymentBadge: {
    backgroundColor: colors.primary.tint, paddingHorizontal: spacing[4],
    paddingVertical: spacing[1], borderRadius: radius.pill,
  },
  paymentBadgeText: { fontFamily: 'WorkSans', fontSize: 13, fontWeight: '600', color: colors.success },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface,
    paddingHorizontal: spacing[6], paddingVertical: spacing[6],
    borderTopWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: spacing[4],
  },
  btnChat: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[6],
    backgroundColor: colors.bg, borderRadius: radius.lg, gap: spacing[2],
  },
  btnChatText: { fontFamily: 'WorkSans', fontSize: 16, color: colors.text, fontWeight: '500' },
  btnPrimary: {
    flex: 1, backgroundColor: colors.primary.DEFAULT, paddingVertical: spacing[6],
    borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: 'WorkSans', fontSize: 16, color: '#fff', fontWeight: '600' },
});
