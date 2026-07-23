import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, X, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { mockMembershipRequests, mockCircles } from '@venega/types';
import { MembershipRequestStatus } from '@venega/types';

export default function RequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState(mockMembershipRequests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const circle = mockCircles.find((c) => c.id === 'c1');

  const handleApprove = (id: string) => {
    setRequests((prev: typeof requests) => prev.map((r: typeof prev[0]) => r.id === id ? { ...r, status: MembershipRequestStatus.APPROVED, decidedAt: new Date().toISOString() } : r));
  };

  const handleReject = (id: string) => {
    setRequests((prev: typeof requests) => prev.map((r: typeof prev[0]) => r.id === id ? { ...r, status: MembershipRequestStatus.REJECTED, decidedAt: new Date().toISOString(), rejectionReason: 'Non conforme' } : r));
  };

  const pending = requests.filter((r: typeof requests[0]) => r.status === MembershipRequestStatus.PENDING);
  const processed = requests.filter((r: typeof requests[0]) => r.status !== MembershipRequestStatus.PENDING);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demandes d'adhésion</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>En attente ({pending.length})</Text>
            {pending.map((req: typeof pending[0]) => {
              const isExpanded = expandedId === req.id;
              return (
                <View key={req.id} style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpandedId(isExpanded ? null : req.id)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{req.fullName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{req.fullName}</Text>
                      <Text style={styles.cardMeta}>{req.phoneNumber}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: spacing[2] }}>
                      <Text style={styles.cardAmount}>{req.joiningFee.toLocaleString()} XOF</Text>
                      <Text style={styles.cardAmountLabel}>frais de rachat</Text>
                    </View>
                    {isExpanded ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.cardBody}>
                      <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Dépôt Mobile Money</Text>
                          <Text style={styles.infoValue}>{req.depositNumber}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>CNIB</Text>
                          <View style={styles.docRow}>
                            <TouchableOpacity style={styles.docBtn}><Text style={styles.docBtnText}>Recto</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.docBtn}><Text style={styles.docBtnText}>Verso</Text></TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      <View style={styles.paymentCard}>
                        <View style={styles.row}><Text style={styles.rowLabel}>Frais de rachat</Text><Text style={styles.rowValue}>{req.joiningFee.toLocaleString()} XOF</Text></View>
                        {circle?.depositRequired && <View style={styles.row}><Text style={styles.rowLabel}>Dépôt de garantie</Text><Text style={styles.rowValue}>{req.depositAmount.toLocaleString()} XOF</Text></View>}
                        <View style={[styles.row, styles.rowTotal]}><Text style={styles.totalLabel}>Total à payer</Text><Text style={styles.totalValue}>{(req.joiningFee + req.depositAmount).toLocaleString()} XOF</Text></View>
                      </View>

                      <View style={styles.conditionsOk}>
                        <Check size={14} color={colors.success} />
                        <Text style={styles.conditionsOkText}>Conditions acceptées par le candidat</Text>
                      </View>

                      <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.btnReject} onPress={() => handleReject(req.id)}>
                          <X size={16} color="#DC2626" />
                          <Text style={styles.btnRejectText}>Rejeter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnApprove} onPress={() => handleApprove(req.id)}>
                          <Check size={16} color="#fff" />
                          <Text style={styles.btnApproveText}>Approuver</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {processed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Traitées</Text>
            {processed.map((req: typeof processed[0]) => (
              <View key={req.id} style={styles.processedCard}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>{req.fullName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{req.fullName}</Text>
                  <Text style={styles.cardMeta}>{req.phoneNumber}</Text>
                </View>
                <View style={[styles.statusBadge, req.status === MembershipRequestStatus.APPROVED ? styles.statusApproved : styles.statusRejected]}>
                  <Text style={[styles.statusText, req.status === MembershipRequestStatus.APPROVED ? styles.statusTextApproved : styles.statusTextRejected]}>
                    {req.status === MembershipRequestStatus.APPROVED ? 'Approuvée' : 'Rejetée'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {pending.length === 0 && processed.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucune demande</Text>
            <Text style={styles.emptyText}>Aucune demande d'adhésion en cours pour ce cercle.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  scroll: { padding: spacing[5], paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[4] },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[3], overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing[4] },
  cardBody: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing[4] },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
  cardName: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  cardMeta: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  cardAmount: { fontSize: 14, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
  cardAmountLabel: { fontSize: 11, color: colors.textMuted, fontFamily: 'WorkSans' },
  infoGrid: { gap: spacing[3], marginBottom: spacing[4] },
  infoItem: {},
  infoLabel: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  docRow: { flexDirection: 'row', gap: spacing[2] },
  docBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  docBtnText: { fontSize: 12, color: colors.text, fontFamily: 'WorkSans' },
  paymentCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: spacing[3], marginBottom: spacing[3] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  rowTotal: { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 4, paddingTop: 8 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
  conditionsOk: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing[4] },
  conditionsOkText: { fontSize: 13, fontWeight: '600', color: colors.success, fontFamily: 'WorkSans' },
  btnRow: { flexDirection: 'row', gap: spacing[3] },
  btnReject: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, paddingVertical: 12, backgroundColor: '#FEF2F2' },
  btnRejectText: { fontSize: 14, fontWeight: '600', color: '#DC2626', fontFamily: 'WorkSans' },
  btnApprove: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 12, backgroundColor: colors.success },
  btnApproveText: { fontSize: 14, fontWeight: '600', color: '#fff', fontFamily: 'WorkSans' },
  processedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[3] },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  avatarSmallText: { fontSize: 14, fontWeight: '700', color: colors.textMuted, fontFamily: 'Sora' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusApproved: { backgroundColor: '#ECFDF5' },
  statusRejected: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 12, fontWeight: '600', fontFamily: 'WorkSans' },
  statusTextApproved: { color: colors.success },
  statusTextRejected: { color: '#DC2626' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[2] },
  emptyText: { fontSize: 14, color: colors.textMuted, fontFamily: 'WorkSans' },
});
