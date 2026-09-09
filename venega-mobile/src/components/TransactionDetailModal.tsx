import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';

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

export default function TransactionDetailModal({
  visible,
  onClose,
  isCredit,
  name,
  amount,
  fields,
}: TransactionDetailModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <Text style={styles.title}>Détails de la transaction</Text>

          <View style={[styles.summaryCard, isCredit ? styles.summaryCardCredit : styles.summaryCardDebit]}>
            <View style={[styles.summaryIcon, isCredit ? styles.summaryIconCredit : styles.summaryIconDebit]}>
              {isCredit ? <ArrowUp size={18} color="#0B6E4F" /> : <ArrowDown size={18} color="#E53E3E" />}
            </View>
            <Text style={styles.summaryName}>{name}</Text>
            <Text style={[styles.summaryAmount, isCredit ? styles.summaryAmountCredit : styles.summaryAmountDebit]}>
              {isCredit ? '+' : '−'}{amount}
            </Text>
          </View>

          <View style={styles.fieldsList}>
            {fields.map((f) => (
              <View key={f.label} style={styles.fieldRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <Text style={styles.fieldValue} numberOfLines={3}>{f.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.okBtn} activeOpacity={0.88} onPress={onClose}>
            <Text style={styles.okBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 18,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#1A202C',
    textAlign: 'center',
  },
  summaryCard: {
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 20,
    gap: 8,
  },
  summaryCardCredit: { backgroundColor: '#E4F0EB' },
  summaryCardDebit: { backgroundColor: '#FFECEC' },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryIconCredit: { backgroundColor: 'rgba(11, 110, 79, 0.15)' },
  summaryIconDebit: { backgroundColor: 'rgba(229, 62, 62, 0.15)' },
  summaryName: { fontFamily: 'WorkSansSemiBold', fontSize: 14, color: '#1A202C' },
  summaryAmount: { fontFamily: 'SoraBold', fontSize: 24 },
  summaryAmountCredit: { color: '#0B6E4F' },
  summaryAmountDebit: { color: '#E53E3E' },
  fieldsList: { gap: 12 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#1A202C', marginTop: 7 },
  fieldLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#1A202C', width: 90 },
  fieldValue: { flex: 1, fontFamily: 'WorkSans', fontSize: 13.5, color: '#334155', textAlign: 'right' },
  okBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  okBtnText: { fontFamily: 'SoraBold', fontSize: 15, color: '#FFFFFF' },
});
