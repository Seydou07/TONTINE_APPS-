import React, { useEffect, useRef, useState } from 'react';
import { AppState, Linking, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, typography } from '@venega/design-tokens';
import { buildUssdCode } from '../circleStore';
import { Button, Sheet } from '../../../components/ui';
import { operatorLogos } from './OperatorPicker';

/**
 * Parcours de paiement unique de l'application :
 *   1. l'utilisateur choisit l'opérateur (OperatorPicker) ;
 *   2. bouton « Payer <montant> » → feuille « Confirmer le paiement » (PaymentConfirmSheet) ;
 *   3. « Confirmer » compose le code USSD ; au retour dans l'app, `onReturn` est appelé.
 * Tous les paiements (cotisation, adhésion, versement de cagnotte, aide, don) passent par ici.
 */

export const PAYMENT_OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money' },
  { id: 'MOOV', name: 'Moov Money' },
  { id: 'WAVE', name: 'Wave' },
];

export const formatPayAmount = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

/** Libellé standard du bouton de paiement : « Payer 60 000 F CFA ». */
export const payButtonTitle = (amount: number) => `Payer ${formatPayAmount(amount)}`;

export function operatorName(id: string | null | undefined): string {
  return PAYMENT_OPERATORS.find((o) => o.id === id)?.name ?? 'Mobile Money';
}

/** Compose le code USSD puis appelle `onReturn` quand l'utilisateur revient dans l'application. */
export function useUssdPayment(onReturn: () => void) {
  const [dialing, setDialing] = useState(false);
  const onReturnRef = useRef(onReturn);
  onReturnRef.current = onReturn;

  useEffect(() => {
    if (!dialing) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setDialing(false);
        onReturnRef.current();
      }
    });
    return () => sub.remove();
  }, [dialing]);

  const dial = (operatorId: string, amount: number) => {
    const ussd = buildUssdCode(operatorId, amount);
    setDialing(true);
    Linking.openURL(`tel:${encodeURIComponent(ussd)}`).catch(() => setDialing(false));
  };

  return { dial, dialing };
}

type ConfirmProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  operatorId: string | null;
  /** Numéro débité. */
  phone: string;
  /** Ligne facultative sous le montant (ex. « Versement à Awa Zongo »). */
  detail?: string;
};

/** Feuille « Confirmer le paiement » — identique pour tous les paiements. */
export function PaymentConfirmSheet({ visible, onClose, onConfirm, amount, operatorId, phone, detail }: ConfirmProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Confirmer le paiement">
      <Text style={styles.text}>
        Vous êtes sur le point de payer <Text style={styles.strong}>{formatPayAmount(amount)}</Text> depuis le numéro{' '}
        <Text style={styles.strong}>{phone}</Text>.
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}

      {operatorId && (
        <View style={styles.payVia}>
          {operatorLogos[operatorId] ? (
            <Image source={operatorLogos[operatorId]} style={styles.logo} contentFit="contain" />
          ) : null}
          <Text style={styles.payViaText}>Paiement via {operatorName(operatorId)}</Text>
        </View>
      )}

      <Text style={styles.hint}>Le code USSD s’ouvre dans votre téléphone : validez avec votre code secret.</Text>

      <View style={styles.actions}>
        <Button title="Annuler" variant="secondary" onPress={onClose} style={styles.flex} />
        <Button title="Confirmer" onPress={onConfirm} style={styles.flex} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  text: { ...typography.body, color: colors.inkSoft },
  strong: { fontWeight: '700', color: colors.ink },
  detail: { ...typography.callout, color: colors.muted, marginTop: 6 },
  payVia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginTop: 16,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  logo: { width: 32, height: 32, borderRadius: 8 },
  payViaText: { ...typography.callout, fontWeight: '600', color: colors.ink },
  hint: { ...typography.footnote, color: colors.muted, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
