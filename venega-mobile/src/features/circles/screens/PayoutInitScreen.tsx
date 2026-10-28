import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, CheckCircle2, History, Bell } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { getCircle, getCircles, getActiveCycle, getCycles, getCurrentUser } from '../circleStore';
import { mockMemberships, mockPayoutRecords } from '@venega/types';
import type { PayoutRecord } from '@venega/types';
import { Avatar, Button, Sheet } from '../../../components/ui';
import OperatorPicker from '../components/OperatorPicker';
import {
  PAYMENT_OPERATORS,
  PaymentConfirmSheet,
  formatPayAmount as formatXOF,
  operatorName as getOperatorName,
  payButtonTitle,
  useUssdPayment,
} from '../components/PaymentFlow';
import {
  PaymentAmountCard,
  PaymentFooter,
  PaymentHeader,
  PaymentHint,
  PaymentSectionTitle,
  SummaryCard,
  SummaryRow,
  paymentStyles,
} from '../components/PaymentLayout';

export default function PayoutInitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const me = getCurrentUser();

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circle.id);
  const orderedMembers = [...memberships].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  // Modèle financier (défini à la création du cercle)
  const baseTontineAmount = circle.tontineAmount || 10000;
  const founderManagementFeePerTurn = circle.managementFee || 500;
  const memberCount = orderedMembers.length;

  const totalGrossCollected = (baseTontineAmount + founderManagementFeePerTurn) * memberCount;
  const beneficiaryPotAmount = baseTontineAmount * memberCount;
  const totalFounderFeesCollected = founderManagementFeePerTurn * memberCount;
  const venegaCommission = Math.round(totalFounderFeesCollected * 0.1);
  const netFounderFees = totalFounderFeesCollected - venegaCommission;

  const scrollRef = useRef<ScrollViewInstance>(null);

  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const [history, setHistory] = useState<PayoutRecord[]>(() =>
    mockPayoutRecords
      .filter((p) => p.circleId === circle.id && p.status === 'PAID')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  const beneficiaryName = `${beneficiary?.user?.firstName ?? ''} ${beneficiary?.user?.lastName ?? ''}`.trim();
  const operatorName = selectedOperator ? getOperatorName(selectedOperator) : undefined;
  const turn = cycle?.currentTurn ?? 1;

  // Au retour de l'USSD : le versement est enregistré et la notification Venega s'affiche.
  const { dial } = useUssdPayment(() => {
    const now = new Date();
    const newRecord: PayoutRecord = {
      id: `p${Date.now()}`,
      circleId: circle.id,
      cycleId: cycle?.id ?? 'cy1',
      beneficiaryName,
      beneficiaryAvatar: beneficiary?.user?.avatarUrl,
      totalAmount: totalGrossCollected,
      beneficiaryAmount: beneficiaryPotAmount,
      founderFees: netFounderFees,
      venegaCommission,
      operator: getOperatorName(selectedOperator),
      status: 'PAID',
      createdAt: now.toISOString(),
    };
    setHistory((h) => [newRecord, ...h]);
    setShowNotification(true);
  });

  const handleConfirm = () => {
    if (!selectedOperator) return;
    setShowConfirm(false);
    setRefNumber(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    dial(selectedOperator, beneficiaryPotAmount);
  };

  const handleViewHistory = () => {
    setShowNotification(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' à ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <View style={paymentStyles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={paymentStyles.flex} edges={['top', 'bottom']}>
        <PaymentHeader title="Verser la cagnotte" onBack={() => router.back()} />

        <ScrollView ref={scrollRef} contentContainerStyle={paymentStyles.scroll} showsVerticalScrollIndicator={false}>
          <PaymentAmountCard amount={beneficiaryPotAmount} sub={`Cagnotte du tour ${turn} · ${circle.name}`} />

          <SummaryCard>
            <SummaryRow
              label="Bénéficiaire"
              value={beneficiaryName || '—'}
              leading={<Avatar name={beneficiaryName || '?'} uri={beneficiary?.user?.avatarUrl} size={32} />}
            />
            <SummaryRow label="Numéro Mobile Money" value={beneficiary?.user?.phoneNumber ?? '—'} />
            <SummaryRow label="Tour" value={`Tour ${turn}`} />
            <SummaryRow label="Total collecté" value={formatXOF(totalGrossCollected)} />
            <SummaryRow label="Frais fondateur" value={formatXOF(netFounderFees)} />
            <SummaryRow label="Commission Venega" value={formatXOF(venegaCommission)} />
            <SummaryRow label="Somme à verser" value={formatXOF(beneficiaryPotAmount)} strong last />
          </SummaryCard>
          <PaymentHint>Le versement passe par le compte hub Venega (CityNet Pay).</PaymentHint>

          <PaymentSectionTitle>Choisissez l'opérateur</PaymentSectionTitle>
          <OperatorPicker operators={PAYMENT_OPERATORS} value={selectedOperator} onChange={setSelectedOperator} />

          {/* Historique des versements (seulement les payés) */}
          <PaymentSectionTitle>Historique des versements</PaymentSectionTitle>
          {history.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <History size={24} color={colors.subtle} />
              </View>
              <Text style={styles.emptyTitle}>Aucun versement</Text>
              <Text style={styles.emptyText}>Les versements payés apparaîtront ici.</Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {history.map((p: PayoutRecord, idx: number) => (
                <View key={p.id} style={[styles.historyRow, idx < history.length - 1 && styles.rowBorder]}>
                  <Avatar name={p.beneficiaryName} uri={p.beneficiaryAvatar} size={40} />
                  <View style={styles.flex}>
                    <Text style={styles.historyName} numberOfLines={1}>{p.beneficiaryName}</Text>
                    <Text style={styles.historyMeta}>
                      {formatDate(p.createdAt)} · {p.operator}
                    </Text>
                    <Text style={styles.historyRef}>Réf. TX-{p.id.toUpperCase().slice(1)}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>−{formatXOF(p.beneficiaryAmount)}</Text>
                    <View style={styles.paidTag}>
                      <CheckCircle2 size={12} color={colors.primary.DEFAULT} />
                      <Text style={styles.paidTagText}>Payé</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <PaymentFooter>
          <Button
            title={payButtonTitle(beneficiaryPotAmount)}
            disabled={!selectedOperator}
            onPress={() => setShowConfirm(true)}
          />
        </PaymentFooter>
      </SafeAreaView>

      <PaymentConfirmSheet
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        amount={beneficiaryPotAmount}
        operatorId={selectedOperator}
        phone={me.phoneNumber}
        detail={`Versement à ${beneficiaryName || 'bénéficiaire'} · Compte hub Venega`}
      />

      {/* Notification Venega : versement effectué */}
      <Sheet visible={showNotification} onClose={() => setShowNotification(false)}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.notifHead}>
            <View style={styles.bellCircle}>
              <Bell size={24} color={colors.accent.deep} />
            </View>
            <Text style={styles.notifTag}>Notification Venega</Text>
            <Text style={styles.notifTitle}>Versement effectué</Text>
          </View>

          <View style={styles.paidNotice}>
            <CheckLine>
              Vous avez versé {formatXOF(beneficiaryPotAmount)} à {beneficiaryName}.
            </CheckLine>
            <CheckLine>Vous avez reçu {formatXOF(netFounderFees)} (frais fondateur) sur votre compte.</CheckLine>
          </View>

          <View style={styles.sheetBlock}>
            <SummaryCard>
              <SummaryRow label="Bénéficiaire" value={beneficiaryName} />
              <SummaryRow label="Somme versée" value={formatXOF(beneficiaryPotAmount)} strong />
              <SummaryRow label="Reçu (fondateur)" value={formatXOF(netFounderFees)} />
              <SummaryRow label="Commission Venega" value={formatXOF(venegaCommission)} />
              <SummaryRow label="Opérateur" value={operatorName ?? '—'} />
              <SummaryRow label="Référence" value={refNumber} />
              <SummaryRow label="Date" value={formatDate(new Date().toISOString())} last />
            </SummaryCard>
          </View>

          <View style={styles.sheetActions}>
            <Button title="Voir l'historique complet" icon={History} onPress={handleViewHistory} />
            <Button title="Fermer" variant="secondary" onPress={() => setShowNotification(false)} />
          </View>
        </ScrollView>
      </Sheet>
    </View>
  );
}

/** Ligne de confirmation précédée d'une coche Lucide. */
function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.checkLine}>
      <View style={styles.checkIcon}>
        <Check size={12} color="#FFFFFF" strokeWidth={3} />
      </View>
      <Text style={styles.checkText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },

  /* Historique */
  historyCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  historyName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  historyMeta: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  historyRef: { ...typography.caption, fontWeight: '400', color: colors.subtle, marginTop: 1 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { ...typography.callout, fontWeight: '600', color: colors.ink },
  paidTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  paidTagText: { ...typography.caption, fontWeight: '600', color: colors.primary.dark },
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: { ...typography.headline, color: colors.ink },
  emptyText: { ...typography.callout, color: colors.muted, marginTop: 4, textAlign: 'center' },

  /* Notification */
  sheetBlock: { marginTop: 16 },
  sheetActions: { gap: 10, marginTop: 20 },
  notifHead: { alignItems: 'center', marginBottom: 16 },
  bellCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  notifTag: { ...typography.caption, color: colors.accent.deep },
  notifTitle: { ...typography.title, color: colors.ink, marginTop: 2, textAlign: 'center' },
  paidNotice: { gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.primary.tint },
  checkLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 1,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { flex: 1, ...typography.footnote, fontWeight: '500', color: colors.ink },
});
