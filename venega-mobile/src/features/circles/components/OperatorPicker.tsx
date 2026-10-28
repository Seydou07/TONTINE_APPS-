import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, typography } from '@venega/design-tokens';

export const operatorLogos: Record<string, number> = {
  ORANGE: require('../../../../assets/operators/orange.png'),
  MOOV: require('../../../../assets/operators/moov.png'),
  WAVE: require('../../../../assets/operators/wave.png'),
};

type Operator = { id: string; name: string };

/** Choix de l'opérateur mobile money : une carte sélectionnable par opérateur. */
export default function OperatorPicker({
  operators,
  value,
  onChange,
}: {
  operators: Operator[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {operators.map((op) => {
        const selected = op.id === value;
        return (
          <TouchableOpacity
            key={op.id}
            onPress={() => onChange(op.id)}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={op.name}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <Image source={operatorLogos[op.id]} style={styles.logo} contentFit="contain" />
            <Text style={styles.name}>{op.name}</Text>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Affichage d'un code USSD, en grand et espacé pour être recopié sans erreur. */
export function UssdCodeBox({ code }: { code: string }) {
  return (
    <View style={styles.codeBox}>
      <Text style={styles.codeText} selectable accessibilityLabel={`Code USSD ${code}`}>
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.tint,
  },
  logo: { width: 40, height: 40, borderRadius: radius.sm },
  name: { flex: 1, ...typography.callout, fontWeight: '600', color: colors.ink },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: colors.primary.DEFAULT },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary.DEFAULT },

  codeBox: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 1.5,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
