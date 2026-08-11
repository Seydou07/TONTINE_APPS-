import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  X,
  UserCheck,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockMembershipRequests } from '@venega/types';
import { MembershipRequestStatus } from '@venega/types';

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

export default function RequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState(mockMembershipRequests);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: MembershipRequestStatus.APPROVED, decidedAt: new Date().toISOString() }
          : r
      )
    );
    Alert.alert('Demande approuvée', 'Le membre a été accepté dans le cercle.');
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: MembershipRequestStatus.REJECTED,
              decidedAt: new Date().toISOString(),
              rejectionReason: 'Pièces non conformes',
            }
          : r
      )
    );
  };

  const pending = requests.filter((r) => r.status === MembershipRequestStatus.PENDING);
  const processed = requests.filter((r) => r.status !== MembershipRequestStatus.PENDING);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Demandes d'adhésion</Text>
            <View style={{ width: 38 }} />
          </View>
          <Text style={styles.headerSubtitle}>
            Consultez les pièces KYC et validez les nouveaux membres
          </Text>
        </View>

        {/* Corps emboîté crème */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {pending.length > 0 && (
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionHeading}>En attente de validation ({pending.length})</Text>

                {pending.map((req) => {
                  const isExpanded = expandedId === req.id;
                  return (
                    <View key={req.id} style={styles.requestCard}>
                      <TouchableOpacity
                        style={styles.cardHeaderRow}
                        activeOpacity={0.8}
                        onPress={() => setExpandedId(isExpanded ? null : req.id)}
                      >
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarInitial}>{req.fullName.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.candidateName}>{req.fullName}</Text>
                            <BadgeCheck size={16} color="#10B981" />
                          </View>
                          <Text style={styles.candidatePhone}>{req.phoneNumber}</Text>
                        </View>
                        {isExpanded ? (
                          <ChevronUp size={20} color="#94A3B8" />
                        ) : (
                          <ChevronDown size={20} color="#94A3B8" />
                        )}
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.cardExpandedBody}>
                          <View style={styles.kycDocsBox}>
                            <View style={styles.kycHeader}>
                              <ShieldCheck size={16} color="#074B36" />
                              <Text style={styles.kycTitle}>Pièces d'identité téléversées</Text>
                            </View>
                            <View style={styles.docButtonsRow}>
                              <TouchableOpacity
                                style={styles.docViewBtn}
                                onPress={() => Alert.alert('CNIB Recto', 'Affichage de la pièce d\'identité')}
                              >
                                <FileText size={14} color="#074B36" />
                                <Text style={styles.docViewText}>CNIB Recto</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.docViewBtn}
                                onPress={() => Alert.alert('CNIB Verso', 'Affichage du verso')}
                              >
                                <FileText size={14} color="#074B36" />
                                <Text style={styles.docViewText}>CNIB Verso</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.docViewBtn}
                                onPress={() => Alert.alert('Selfie', 'Affichage du selfie d\'identification')}
                              >
                                <UserCheck size={14} color="#074B36" />
                                <Text style={styles.docViewText}>Selfie</Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.financialSummaryCard}>
                            <View style={styles.summaryRow}>
                              <Text style={styles.summaryLabel}>Dépôt de garantie :</Text>
                              <Text style={styles.summaryVal}>{formatXOF(req.depositAmount)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                              <Text style={styles.summaryLabel}>Frais de rachat :</Text>
                              <Text style={styles.summaryVal}>{formatXOF(req.joiningFee)}</Text>
                            </View>
                          </View>

                          <View style={styles.actionsBtnRow}>
                            <TouchableOpacity
                              style={styles.rejectPillBtn}
                              onPress={() => handleReject(req.id)}
                            >
                              <X size={16} color="#EF4444" />
                              <Text style={styles.rejectPillText}>Rejeter</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.approvePillBtn}
                              onPress={() => handleApprove(req.id)}
                            >
                              <Check size={16} color="#FFFFFF" />
                              <Text style={styles.approvePillText}>Approuver</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {processed.length > 0 && (
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionHeading}>Demandes traitées ({processed.length})</Text>
                {processed.map((req) => {
                  const isApproved = req.status === MembershipRequestStatus.APPROVED;
                  return (
                    <View key={req.id} style={styles.processedCard}>
                      <View style={styles.avatarCircleSmall}>
                        <Text style={styles.avatarInitialSmall}>{req.fullName.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.candidateName}>{req.fullName}</Text>
                        <Text style={styles.candidatePhone}>{req.phoneNumber}</Text>
                      </View>
                      <View style={[styles.statusTag, isApproved ? styles.statusApproved : styles.statusRejected]}>
                        <Text style={[styles.statusTagText, isApproved ? styles.statusApprovedText : styles.statusRejectedText]}>
                          {isApproved ? 'Approuvée' : 'Rejetée'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {pending.length === 0 && processed.length === 0 && (
              <View style={styles.emptyState}>
                <UserCheck size={44} color="#CBD5E1" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>Aucune demande</Text>
                <Text style={styles.emptySub}>Aucune demande d'adhésion en attente.</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    gap: 16,
  },
  sectionGroup: {
    gap: 12,
  },
  sectionHeading: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#074B36',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#074B36',
  },
  candidateName: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
  },
  candidatePhone: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 1,
  },
  cardExpandedBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
    paddingTop: 12,
  },
  kycDocsBox: {
    backgroundColor: '#FAF7F1',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kycTitle: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#074B36',
  },
  docButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  docViewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docViewText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 11.5,
    color: '#074B36',
  },
  financialSummaryCard: {
    backgroundColor: 'rgba(7, 75, 54, 0.04)',
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
  },
  summaryVal: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#0F172A',
  },
  actionsBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rejectPillBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectPillText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#EF4444',
  },
  approvePillBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  approvePillText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  processedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialSmall: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#64748B',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
  },
  statusApprovedText: {
    color: '#059669',
  },
  statusRejectedText: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
});
