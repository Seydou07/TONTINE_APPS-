import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import {
  getCircle,
  getCircles,
  getCurrentUser,
  activateCircle,
  recordContribution,
  recordSolidarityContribution,
  CIRCLE_CREATION_FEE,
} from '../circleStore';
import { CircleType } from '@venega/types';
import { Button } from '../../../components/ui';
import OperatorPicker from '../components/OperatorPicker';
import {
  PAYMENT_OPERATORS,
  PaymentConfirmSheet,
  formatPayAmount,
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

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ circleId?: string; amount?: string; type?: string }>();
  // Cercle introuvable : on ne paie jamais « par défaut » pour un autre cercle (ex. activer le mauvais).
  const found = getCircle(params.circleId ?? '');
  const circle = found ?? getCircles()[0]!;
  const paymentType = params.type === 'SOLIDARITY' ? 'SOLIDARITY' : params.type === 'ACTIVATION' ? 'ACTIVATION' : 'TONTINE';
  const amount = paymentType === 'ACTIVATION' ? CIRCLE_CREATION_FEE : (parseFloat(params.amount || '0') || circle.tontineAmount || 0);
  const me = getCurrentUser();

  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { dial } = useUssdPayment(() => {
    if (paymentType === 'ACTIVATION') {
      activateCircle(circle.id);
      router.replace((circle.type === CircleType.SOLIDARITY_ONLY ? `/circle/${circle.id}/solidarity` : `/circle/${circle.id}`) as any);
    } else {
      // Montant complet confirmé : la cotisation du tour est enregistrée (statut « payé », caisse créditée).
      if (paymentType === 'SOLIDARITY') {
        recordSolidarityContribution(circle.id, me.id, `${me.firstName} ${me.lastName}`, amount);
      } else {
        recordContribution(circle.id, me.id);
      }
      router.back();
    }
  });

  const handleConfirm = () => {
    if (!selectedOperator || !found) return;
    setShowConfirm(false);
    dial(selectedOperator, amount);
  };

  if (!found) {
    return (
      <View style={paymentStyles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={paymentStyles.flex} edges={['top', 'bottom']}>
          <PaymentHeader title="Paiement" onBack={() => router.back()} />
          <View style={paymentStyles.scroll}>
            <PaymentHint>Ce cercle est introuvable. Revenez en arrière et réessayez depuis la fiche du cercle.</PaymentHint>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const typeLabel =
    paymentType === 'SOLIDARITY' ? 'Cotisation solidarité'
    : paymentType === 'ACTIVATION' ? "Frais d'activation"
    : 'Cotisation tontine';

  return (
    <View style={paymentStyles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={paymentStyles.flex} edges={['top', 'bottom']}>
        <PaymentHeader
          title={paymentType === 'ACTIVATION' ? 'Activer le cercle' : 'Payer ma cotisation'}
          onBack={() => router.back()}
        />

        <ScrollView contentContainerStyle={paymentStyles.scroll} showsVerticalScrollIndicator={false}>
          <PaymentAmountCard amount={amount} sub={`${typeLabel} · ${circle.name}`} />

          {paymentType === 'ACTIVATION' && (
            <View style={styles.notice}>
              <Info size={18} color={colors.accent.deep} />
              <Text style={styles.noticeText}>
                Votre cercle est créé mais pas encore actif. Réglez les frais d'activation pour le mettre en service.
              </Text>
            </View>
          )}

          <SummaryCard>
            <SummaryRow label="Cercle" value={circle.name} />
            <SummaryRow label={paymentType === 'ACTIVATION' ? 'Type de frais' : 'Type de cotisation'} value={typeLabel} />
            <SummaryRow label="Numéro Mobile Money" value={me.phoneNumber} />
            <SummaryRow label="Montant" value={formatPayAmount(amount)} strong last />
          </SummaryCard>
          <PaymentHint>Le paiement est envoyé directement depuis votre numéro Mobile Money.</PaymentHint>

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
        detail={`${typeLabel} · ${circle.name}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.accent.tint,
    marginBottom: 20,
  },
  noticeText: { flex: 1, ...typography.footnote, color: colors.inkSoft },
});
