import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Button, Sheet } from './ui';

export interface TransactionDetailField {
  label: string;
  value: string;
}

interface TransactionDetailModalProps {
  visible: boolean;
  onClose: () => void;
  isCredit: boolean;
  name: string;
  amount: string;
  fields: TransactionDetailField[];
}

/** Feuille du bas présentant le détail d'une opération. */
export default function TransactionDetailModal({
  visible,
  onClose,
  isCredit,
  name,
  amount,
  fields,
}: TransactionDetailModalProps) {
  const Icon = isCredit ? ArrowUpRight : ArrowDownLeft;
  return (
    <Sheet visible={visible} onClose={onClose} title="Détails de l’opération">
      <View style={styles.summary}>
        <View style={[styles.summaryIcon, { backgroundColor: isCredit ? colors.primary.tint : colors.fill }]}>
          <Icon size={20} color={isCredit ? colors.primary.DEFAULT : colors.inkSoft} strokeWidth={2} />
        </View>
        <Text style={[styles.summaryAmount, { color: isCredit ? colors.primary.DEFAULT : colors.ink }]}>
          {isCredit ? '+' : '−'}
          {amount}
        </Text>
        <Text style={styles.summaryName}>{name}</Text>
      </View>

      <View style={styles.fields}>
        {fields.map((f, i) => (
          <View key={f.label} style={[styles.fieldRow, i < fields.length - 1 && styles.fieldBorder]}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <Text style={styles.fieldValue}>{f.value}</Text>
          </View>
        ))}
      </View>

      <Button title="Fermer" variant="secondary" onPress={onClose} style={styles.closeBtn} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryAmount: { ...typography.title },
  summaryName: { ...typography.callout, color: colors.muted, marginTop: 2, textAlign: 'center' },

  fields: {
    marginTop: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 12,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  fieldLabel: { ...typography.callout, color: colors.muted },
  fieldValue: { ...typography.callout, fontWeight: '500', color: colors.ink, flex: 1, textAlign: 'right' },

  closeBtn: { marginTop: 20 },
});
