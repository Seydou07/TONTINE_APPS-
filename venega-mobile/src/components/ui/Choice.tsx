import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';

/* ── Puce de sélection (fréquence, seuils…) ── */

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── Carte d'option avec bouton radio ── */

type OptionCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  badge?: string;
  style?: StyleProp<ViewStyle>;
};

export function OptionCard({ title, description, icon: Icon, selected, onPress, badge, style }: OptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, selected && styles.optionSelected, style]}
    >
      {Icon ? (
        <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
          <Icon size={22} color={selected ? '#FFFFFF' : colors.primary.DEFAULT} strokeWidth={1.8} />
        </View>
      ) : null}
      <View style={styles.optionBody}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{title}</Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        {description ? <Text style={styles.optionDesc}>{description}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

/* ── Choix segmenté (deux ou trois options courtes) ── */

type SegmentOption<T extends string> = { key: T; label: string; icon?: LucideIcon };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map(({ key, label, icon: Icon }) => {
        const selected = key === value;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            {Icon ? <Icon size={18} color={selected ? colors.primary.dark : colors.muted} strokeWidth={2} /> : null}
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ── Compteur − / + ── */

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={[styles.stepperBtn, value <= min && styles.stepperBtnOff]}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel="Diminuer"
      >
        <Minus size={18} color={colors.ink} />
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepperBtn, value >= max && styles.stepperBtnOff]}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel="Augmenter"
      >
        <Plus size={18} color={colors.ink} />
      </TouchableOpacity>
    </View>
  );
}

/* ── Ligne réglage : libellé + contrôle à droite ── */

export function SettingRow({
  title,
  description,
  children,
  last,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.setting, !last && styles.settingBorder]}>
      <View style={styles.settingBody}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description ? <Text style={styles.settingDesc}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: colors.primary.DEFAULT, false: colors.lineStrong }}
      thumbColor="#FFFFFF"
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chipText: {
    ...typography.callout,
    fontWeight: '500',
    color: colors.ink,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  optionSelected: {
    borderColor: colors.primary.DEFAULT,
    borderWidth: 1.5,
    backgroundColor: '#F7FBF9',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  optionBody: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  optionDesc: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 3,
  },
  badge: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary.dark,
    backgroundColor: colors.primary.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.DEFAULT,
  },

  segmented: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  segmentSelected: {
    backgroundColor: colors.bg,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    ...typography.callout,
    fontWeight: '500',
    color: colors.muted,
  },
  segmentTextSelected: {
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnOff: {
    opacity: 0.35,
  },
  stepperValue: {
    ...typography.headline,
    color: colors.ink,
    minWidth: 36,
    textAlign: 'center',
  },

  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  settingBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  settingBody: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.ink,
  },
  settingDesc: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 2,
  },
});
