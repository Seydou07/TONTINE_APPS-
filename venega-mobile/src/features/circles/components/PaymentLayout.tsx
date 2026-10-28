import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { IconButton } from '../../../components/ui';
import { formatPayAmount } from './PaymentFlow';

/**
 * Mise en page commune à tous les écrans de paiement (cotisation, adhésion, versement de cagnotte, secours) :
 * en-tête blanc · carte montant · carte récapitulative · choix de l'opérateur · pied fixe « Payer X F CFA ».
 */

export function PaymentHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={onBack} />
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export function PaymentAmountCard({ amount, sub, label = 'Montant à payer' }: { amount: number; sub?: string; label?: string }) {
  return (
    <View style={styles.amountCard}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text style={styles.amountValue}>{formatPayAmount(amount)}</Text>
      {sub ? <Text style={styles.amountSub}>{sub}</Text> : null}
    </View>
  );
}

export function SummaryCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function SummaryRow({
  label,
  value,
  strong,
  last,
  leading,
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
  /** Élément affiché avant la valeur (ex. Avatar). */
  leading?: React.ReactNode;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {leading}
        <Text style={[styles.rowValue, strong && styles.rowValueStrong]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function PaymentHint({ children }: { children: React.ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

export function PaymentSectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function PaymentFooter({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

export const paymentStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
});

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, backgroundColor: colors.bg },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSpacer: { width: 40 },

  amountCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.primary.dark,
    marginBottom: 20,
  },
  amountLabel: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8 },
  amountValue: { ...typography.display, color: '#FFFFFF', marginTop: 4, textAlign: 'center' },
  amountSub: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8, marginTop: 4, textAlign: 'center' },

  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLabel: { ...typography.callout, color: colors.muted },
  rowRight: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  rowValue: { flexShrink: 1, ...typography.callout, fontWeight: '500', color: colors.ink, textAlign: 'right' },
  rowValueStrong: { fontWeight: '700', color: colors.primary.dark },
  hint: { ...typography.footnote, color: colors.muted, marginTop: 8 },

  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginTop: 28, marginBottom: 12 },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
});
