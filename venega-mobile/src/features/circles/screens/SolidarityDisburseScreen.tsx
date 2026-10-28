import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchX } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Avatar, Button } from '../../../components/ui';
import OperatorPicker from '../components/OperatorPicker';
import { EmptyState } from '../components/SolidarityParts';
import {
  PAYMENT_OPERATORS,
  PaymentConfirmSheet,
  formatPayAmount as formatXOF,
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
import {
  getCircle,
  getCircles,
  getCurrentUser,
  getSolidarityRequests,
  getSolidarityTotals,
  getCircleMembers,
  disburseSolidarityRequest,
} from '../circleStore';

export default function SolidarityDisburseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; requestId: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const request = getSolidarityRequests(circle.id).find((r) => r.id === params.requestId);
  const totals = getSolidarityTotals(circle.id);
  const beneficiary = request ? getCircleMembers(circle.id).find((m) => m.userId === request.userId) : undefined;
  const me = getCurrentUser();

  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Au retour de l'USSD : le secours est marqué comme versé.
  const { dial } = useUssdPayment(() => {
    if (!request) return;
    disburseSolidarityRequest(request.id);
    router.back();
  });

  if (!request) {
    return (
      <View style={paymentStyles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={paymentStyles.flex} edges={['top']}>
          <PaymentHeader title="Verser le secours" onBack={() => router.back()} />
          <EmptyState icon={SearchX} title="Demande introuvable" text="Cette demande n'existe plus ou a été retirée." style={styles.notFound} />
        </SafeAreaView>
      </View>
    );
  }

  const amount = request.amountRequested;

  const handleConfirm = () => {
    if (!selectedOperator) return;
    setShowConfirm(false);
    dial(selectedOperator, amount);
  };

  return (
    <View style={paymentStyles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={paymentStyles.flex} edges={['top', 'bottom']}>
        <PaymentHeader title="Verser le secours" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={paymentStyles.scroll} showsVerticalScrollIndicator={false}>
          <PaymentAmountCard amount={amount} sub={`Secours pour ${request.requesterName} · ${circle.name}`} />

          <SummaryCard>
            <SummaryRow
              label="Bénéficiaire"
              value={request.requesterName}
              leading={<Avatar name={request.requesterName} uri={beneficiary?.user.avatarUrl} size={32} />}
            />
            <SummaryRow label="Numéro Mobile Money" value={beneficiary?.user.phoneNumber ?? '—'} />
            <View style={styles.reasonBlock}>
              <Text style={styles.reasonLabel}>Motif</Text>
              <Text style={styles.reasonText}>{request.reason}</Text>
            </View>
            <SummaryRow label="Solde de la caisse" value={formatXOF(totals.balance)} />
            <SummaryRow label="Montant à verser" value={formatXOF(amount)} strong last />
          </SummaryCard>
          <PaymentHint>Ce motif sera visible par tous les membres, avec le montant.</PaymentHint>

          <PaymentSectionTitle>Choisissez l'opérateur</PaymentSectionTitle>
          <OperatorPicker operators={PAYMENT_OPERATORS} value={selectedOperator} onChange={setSelectedOperator} />
        </ScrollView>

        <PaymentFooter>
          <Button title={payButtonTitle(amount)} disabled={!selectedOperator} onPress={() => setShowConfirm(true)} />
        </PaymentFooter>
      </SafeAreaView>

      <PaymentConfirmSheet
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        amount={amount}
        operatorId={selectedOperator}
        phone={me.phoneNumber}
        detail={`Versement à ${request.requesterName}${beneficiary?.user.phoneNumber ? ` (${beneficiary.user.phoneNumber})` : ''} · Caisse de solidarité`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: { marginTop: 40 },
  reasonBlock: {
    gap: 4,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  reasonLabel: { ...typography.callout, color: colors.muted },
  reasonText: { ...typography.callout, color: colors.ink },
});
