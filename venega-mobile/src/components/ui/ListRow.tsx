import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, sizes, typography } from '@venega/design-tokens';

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Couleur de l'icône et de son fond teinté. */
  tone?: 'neutral' | 'primary' | 'danger';
  /** Texte affiché à droite (ex. « Vérifié »). */
  value?: string;
  valueTone?: 'muted' | 'success';
  /** Élément à droite à la place de la valeur et du chevron (ex. interrupteur). */
  accessory?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  last?: boolean;
  style?: StyleProp<ViewStyle>;
};

const tones = {
  neutral: { fg: colors.inkSoft, bg: colors.fill },
  primary: { fg: colors.primary.DEFAULT, bg: colors.primary.tint },
  danger: { fg: colors.danger.DEFAULT, bg: colors.danger.tint },
};

/** Ligne de liste standard : icône, libellé, valeur et chevron. */
export function ListRow({
  title,
  subtitle,
  icon: Icon,
  tone = 'neutral',
  value,
  valueTone = 'muted',
  accessory,
  onPress,
  chevron = !!onPress,
  last,
  style,
}: Props) {
  const t = tones[tone];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.6}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[styles.row, style]}
    >
      {Icon ? (
        <View style={[styles.icon, { backgroundColor: t.bg }]}>
          <Icon size={sizes.icon} color={t.fg} strokeWidth={1.8} />
        </View>
      ) : null}
      <View style={[styles.body, !last && styles.border]}>
        <View style={styles.text}>
          <Text style={[styles.title, tone === 'danger' && { color: colors.danger.DEFAULT }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {value ? (
          <Text style={[styles.value, valueTone === 'success' && styles.valueSuccess]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {accessory}
        {chevron && !accessory ? <ChevronRight size={18} color={colors.subtle} /> : null}
      </View>
    </TouchableOpacity>
  );
}

/** Groupe de lignes, avec titre de section facultatif. */
export function ListGroup({ title, children, style }: { title?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.group}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.listItem - 8,
    paddingLeft: 16,
    gap: 14,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingRight: 14,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  text: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '500',
    color: colors.ink,
  },
  subtitle: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 2,
  },
  value: {
    ...typography.callout,
    color: colors.muted,
    maxWidth: 160,
  },
  valueSuccess: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  groupTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
});
