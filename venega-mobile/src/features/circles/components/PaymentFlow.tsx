import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, typography } from '@venega/design-tokens';
import { Button, Sheet } from '../../../components/ui';
import { checkPayment, dialAndWait } from '../ussd';
import type { PaymentOutcome } from '../ussd';
import { operatorLogos } from './OperatorPicker';

/**
 * Parcours de paiement unique de l'application :
 *   1. l'utilisateur choisit l'opérateur (OperatorPicker) ;
 *   2. bouton « Payer <montant> » → feuille « Confirmer le paiement » (PaymentConfirmSheet) ;
 *   3. « Confirmer » lance le code USSD (le code secret se saisit dans la fenêtre de l'opérateur) ;
 *   4. au retour, le paiement est vérifié (PaymentResultHost) : `onReturn` n'est appelé que si le
 *      montant complet est reçu. Incomplet → « Compléter » ; rien reçu → solde insuffisant / réessayer.
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

// ── Vérification au retour : une seule feuille de résultat pour toute l'app ──

type Pending = { operatorId: string; amount: number; onCompleted: () => void };
type HostState =
  | { step: 'idle' }
  | { step: 'checking' }
  | { step: 'result'; outcome: Exclude<PaymentOutcome, { status: 'COMPLETED' }>; pending: Pending };

let hostState: HostState = { step: 'idle' };
const listeners = new Set<(s: HostState) => void>();
const setHost = (next: HostState) => {
  hostState = next;
  listeners.forEach((l) => l(next));
};

async function verify(pending: Pending) {
  setHost({ step: 'checking' });
  const outcome = await checkPayment(pending.operatorId, pending.amount);
  if (outcome.status === 'COMPLETED') {
    setHost({ step: 'idle' });
    pending.onCompleted();
  } else {
    setHost({ step: 'result', outcome, pending });
  }
}

async function pay(pending: Pending) {
  try {
    await dialAndWait(pending.operatorId, pending.amount);
  } catch {
    setHost({ step: 'result', outcome: { status: 'NOT_RECEIVED' }, pending });
    return;
  }
  await verify(pending);
}

/** Lance le code USSD ; `onReturn` est appelé seulement quand le montant complet est reçu. */
export function useUssdPayment(onReturn: () => void) {
  const [dialing, setDialing] = useState(false);
  const onReturnRef = useRef(onReturn);
  onReturnRef.current = onReturn;

  const dial = (operatorId: string, amount: number) => {
    setDialing(true);
    pay({ operatorId, amount, onCompleted: () => onReturnRef.current() }).finally(() => setDialing(false));
  };

  return { dial, dialing };
}

/** À monter une seule fois (app/_layout.tsx) : vérification, paiement incomplet, paiement non reçu. */
export function PaymentResultHost() {
  const [state, setState] = useState<HostState>(hostState);
  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const close = () => setHost({ step: 'idle' });

  if (state.step === 'checking') {
    return (
      <Sheet visible onClose={() => {}} title="Vérification du paiement">
        <View style={styles.checking}>
          <ActivityIndicator color={colors.primary.DEFAULT} />
          <Text style={styles.text}>Nous attendons la confirmation de votre opérateur.</Text>
        </View>
      </Sheet>
    );
  }

  if (state.step === 'result' && state.outcome.status === 'PARTIAL') {
    const { received, missing } = state.outcome;
    const { operatorId, onCompleted } = state.pending;
    return (
      <Sheet visible onClose={close} title="Paiement incomplet">
        <Text style={styles.text}>
          Nous avons reçu <Text style={styles.strong}>{formatPayAmount(received)}</Text>. Il manque{' '}
          <Text style={styles.strong}>{formatPayAmount(missing)}</Text>.
        </Text>
        <Text style={styles.detail}>
          Votre paiement n’est pas validé tant que le montant complet n’est pas reçu. La somme déjà envoyée est
          conservée.
        </Text>
        <View style={styles.actions}>
          <Button title="Plus tard" variant="secondary" onPress={close} style={styles.flex} />
          <Button
            title={`Compléter ${formatPayAmount(missing)}`}
            onPress={() => pay({ operatorId, amount: missing, onCompleted })}
            style={styles.flex}
          />
        </View>
      </Sheet>
    );
  }

  if (state.step === 'result') {
    return (
      <Sheet visible onClose={close} title="Paiement non reçu">
        <Text style={styles.text}>Votre opérateur n’a confirmé aucun paiement.</Text>
        <Text style={styles.detail}>
          Si votre opérateur a affiché « Solde insuffisant », rechargez votre compte {operatorName(state.pending.operatorId)}{' '}
          puis réessayez. Si vous avez annulé ou mal saisi votre code secret, réessayez simplement. Si vous avez reçu un
          SMS de débit, ne payez pas une deuxième fois : le paiement sera pris en compte dès sa confirmation, ou
          contactez le support.
        </Text>
        <View style={styles.actions}>
          <Button title="Fermer" variant="secondary" onPress={close} style={styles.flex} />
          <Button title="Réessayer" onPress={() => pay(state.pending)} style={styles.flex} />
        </View>
      </Sheet>
    );
  }

  return null;
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

      <Text style={styles.hint}>
        Votre opérateur va vous demander votre code secret. Saisissez-le uniquement dans sa fenêtre : Venega ne vous le
        demandera jamais.
      </Text>

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
  checking: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
});
