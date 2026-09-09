import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldAlert, LogOut, Check, HandCoins, Calculator, CheckCircle2 } from 'lucide-react-native';
import {
  getCircle,
  getActiveCycle,
  getCurrentUser,
  computeDepartureBreakdown,
  computeRecalculatedContribution,
  requestDeparture,
} from '../circleStore';
import { mockMemberships } from '@venega/types';
import type { DepartureRequest } from '@venega/types';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

export default function DepartureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircle('c1');
  const cycle = getActiveCycle(circle!);
  const me = getCurrentUser();
  const memberships = mockMemberships.filter((m) => m.circleId === circleId);
  const currentMembership = memberships.find((m) => m.userId === me.id);

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<DepartureRequest | null>(null);

  if (!circle || !currentMembership || !me) return null;

  const hasReceivedPayout = currentMembership.hasReceivedPayout;
  const breakdown = computeDepartureBreakdown(circle, cycle, currentMembership);
  const recalculated = computeRecalculatedContribution(circle);

  /** Déjà reçu la cagnotte → départ bloqué (anti-fuite). */
  if (hasReceivedPayout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quitter le cercle</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.blockedCard}>
            <View style={styles.blockedIcon}>
              <ShieldAlert size={28} color={colors.danger.DEFAULT} />
            </View>
            <Text style={styles.blockedTitle}>Départ impossible</Text>
            <Text style={styles.blockedText}>
              Vous avez déjà reçu la cagnotte de ce cercle. Un membre qui a touché son gain ne peut pas quitter le cercle avant la fin du cycle — c'est la règle qui protège les autres membres.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
              <Text style={styles.btnPrimaryText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /** Demande déjà envoyée → écran de statut. */
  if (request) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demande envoyée</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={34} color="#059669" />
            </View>
            <Text style={styles.successTitle}>Votre demande de départ a été transmise</Text>
            <Text style={styles.successText}>
              Le fondateur doit approuver votre départ. Aucun nouveau membre ne sera ajouté : les cagnottes seront recalculées automatiquement.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>À récupérer (main à main)</Text>
              <Text style={styles.summaryValue}>{formatXOF(request.totalRecover)}</Text>
              <Text style={styles.summaryHint}>{request.reimbursements.length} tour(s) cotisé(s) sans cagnotte reçue</Text>
            </View>

            <Text style={styles.remindText}>
              Vous avez cotisé {request.pastTurns} tour(s). Ceux qui ont bénéficié de votre cotisation vous rembourseront directement.
            </Text>

            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
              <Text style={styles.btnPrimaryText}>Retour au cercle</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const created = requestDeparture(circle!.id, me.id, me.displayName);
      setRequest(created);
      setSubmitting(false);
    }, 900);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quitter le cercle</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ce que je n'ai pas encore reçu */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <HandCoins size={20} color="#074B36" />
            <Text style={styles.infoTitle}>Sans remboursement, vous perdez :</Text>
          </View>
          <View style={styles.lossRow}>
            <Text style={styles.lossLabel}>Cotisations déjà versées ({breakdown.pastTurns} tour(s))</Text>
            <Text style={[styles.lossValue, { color: colors.danger.DEFAULT }]}>{formatXOF(breakdown.totalRecover)}</Text>
          </View>
        </View>

        {/* Remboursement par les bénéficiaires */}
        <View style={styles.refundCard}>
          <View style={styles.refundHeader}>
            <HandCoins size={20} color="#059669" />
            <Text style={styles.refundTitle}>Ceux qui ont bénéficié de vos tours vous remboursent</Text>
          </View>
          <Text style={styles.refundIntro}>
            Vous avez cotisé sans recevoir de cagnotte. Chaque bénéficiaire de vos tours vous remet une cotisation, main à main :
          </Text>

          {breakdown.reimbursements.length > 0 ? (
            <View style={styles.breakdownList}>
              {breakdown.reimbursements.map((r) => (
                <View key={r.turnNumber} style={styles.breakdownRow}>
                  <View style={styles.turnPill}>
                    <Text style={styles.turnPillText}>Tour {r.turnNumber}</Text>
                  </View>
                  <Text style={styles.breakdownName} numberOfLines={1}>{r.beneficiaryName}</Text>
                  <Text style={styles.breakdownAmount}>{formatXOF(r.amount)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.refundIntro}>
              Aucun tour passé à rembourser — vous n'avez pas encore cotisé.
            </Text>
          )}

          <View style={styles.refundTotal}>
            <Text style={styles.refundTotalLabel}>Total à récupérer</Text>
            <Text style={styles.refundTotalValue}>{formatXOF(breakdown.totalRecover)}</Text>
          </View>
          <Text style={styles.refundNote}>Le remboursement se fait directement avec chaque bénéficiaire, sans passer par l'application.</Text>
        </View>

        {/* Recalcul des cagnottes */}
        <View style={styles.recalcCard}>
          <View style={styles.recalcHeader}>
            <Calculator size={20} color="#0369A1" />
            <Text style={styles.recalcTitle}>Aucun remplaçant, cagnottes recalculées</Text>
          </View>
          <Text style={styles.recalcText}>
            À votre départ, le cercle continue normalement SANS ajouter de nouveau membre. Pour que le pot reste entier, la cotisation passe de {formatXOF(circle.tontineAmount)} à {formatXOF(recalculated)} par membre restant.
          </Text>
        </View>

        {/* Confirmation */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConfirmed(!confirmed)}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
            {confirmed && <Check size={14} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>
            Je comprends : je quitte le cercle, les autres membres me remboursent mes {breakdown.pastTurns} tour(s) cotisé(s) et les cagnottes seront recalculées.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, (!confirmed || submitting) && styles.submitBtnDisabled]}
          disabled={!confirmed || submitting}
          onPress={handleSubmit}
        >
          <LogOut size={18} color="#fff" />
          <Text style={styles.submitText}>{submitting ? 'Envoi en cours…' : 'Demander à quitter le cercle'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  scroll: { padding: spacing[5], paddingBottom: 40, gap: 16 },

  blockedCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, padding: spacing[5], alignItems: 'center' },
  blockedIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4] },
  blockedTitle: { fontSize: 18, fontWeight: '700', color: colors.danger.DEFAULT, fontFamily: 'Sora', marginBottom: spacing[3] },
  blockedText: { fontSize: 14, color: '#7F1D1D', fontFamily: 'WorkSans', textAlign: 'center', lineHeight: 20, marginBottom: spacing[5] },

  infoCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4] },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[2] },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  lossRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2] },
  lossLabel: { flex: 1, fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  lossValue: { fontSize: 14, fontWeight: '700', fontFamily: 'WorkSans', marginLeft: spacing[3] },

  refundCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 14, padding: spacing[4] },
  refundHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[2] },
  refundTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#065F46', fontFamily: 'Sora', lineHeight: 18 },
  refundIntro: { fontSize: 13, color: '#065F46', fontFamily: 'WorkSans', lineHeight: 18, marginBottom: spacing[3] },
  breakdownList: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', overflow: 'hidden' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing[3], paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  turnPill: { backgroundColor: 'rgba(7, 75, 54, 0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  turnPillText: { fontSize: 11, fontWeight: '700', color: '#074B36', fontFamily: 'WorkSans' },
  breakdownName: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  breakdownAmount: { fontSize: 13, fontWeight: '700', color: '#059669', fontFamily: 'WorkSans' },
  refundTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing[3] },
  refundTotalLabel: { fontSize: 13, fontWeight: '600', color: '#065F46', fontFamily: 'WorkSans' },
  refundTotalValue: { fontSize: 17, fontWeight: '800', color: '#059669', fontFamily: 'Sora' },
  refundNote: { fontSize: 11.5, color: '#16A34A', fontFamily: 'WorkSans', marginTop: spacing[2], lineHeight: 16 },

  recalcCard: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 14, padding: spacing[4] },
  recalcHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[2] },
  recalcTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0369A1', fontFamily: 'Sora' },
  recalcText: { fontSize: 13, color: '#0C4A6E', fontFamily: 'WorkSans', lineHeight: 18 },

  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  checkboxLabel: { flex: 1, fontSize: 13, color: colors.text, fontFamily: 'WorkSans', lineHeight: 18 },

  submitBtn: { flexDirection: 'row', backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing[2] },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },

  btnPrimary: { backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 14, paddingHorizontal: spacing[5], alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },

  successCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 16, padding: spacing[5], alignItems: 'center' },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16, 185, 129, 0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4] },
  successTitle: { fontSize: 17, fontWeight: '700', color: '#065F46', fontFamily: 'Sora', textAlign: 'center', marginBottom: spacing[2] },
  successText: { fontSize: 13.5, color: '#065F46', fontFamily: 'WorkSans', textAlign: 'center', lineHeight: 20, marginBottom: spacing[4] },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#BBF7D0', padding: spacing[4], width: '100%', alignItems: 'center', marginBottom: spacing[3] },
  summaryLabel: { fontSize: 12.5, color: '#16A34A', fontFamily: 'WorkSans', marginBottom: 2 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#059669', fontFamily: 'Sora', marginBottom: 2 },
  summaryHint: { fontSize: 11.5, color: '#65A30D', fontFamily: 'WorkSans' },
  remindText: { fontSize: 12.5, color: '#065F46', fontFamily: 'WorkSans', textAlign: 'center', lineHeight: 18, marginBottom: spacing[4] },
});
