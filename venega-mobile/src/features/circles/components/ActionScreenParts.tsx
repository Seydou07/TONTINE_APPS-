import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { IconButton } from '../../../components/ui';

/** Éléments partagés des écrans d'action d'un cercle (départ, exclusion, gouvernance…). */

export function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={onBack} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.headerSub} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerSide} />
      </View>
    </>
  );
}

export function ScreenFooter({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

type Tone = 'info' | 'warning' | 'danger' | 'primary' | 'neutral';

const toneColors: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: colors.info.tint, fg: colors.info.DEFAULT },
  warning: { bg: colors.accent.tint, fg: colors.accent.deep },
  danger: { bg: colors.danger.tint, fg: colors.danger.dark },
  primary: { bg: colors.primary.tint, fg: colors.primary.dark },
  neutral: { bg: colors.fill, fg: colors.inkSoft },
};

/** Encadré d'information teinté : icône + titre facultatif + texte. */
export function Notice({
  icon: Icon,
  title,
  children,
  tone = 'info',
  style,
}: {
  icon?: LucideIcon;
  title?: string;
  children: React.ReactNode;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  const t = toneColors[tone];
  return (
    <View style={[styles.notice, { backgroundColor: t.bg }, style]}>
      {Icon ? <Icon size={18} color={t.fg} strokeWidth={2} style={styles.noticeIcon} /> : null}
      <View style={styles.noticeBody}>
        {title ? <Text style={[styles.noticeTitle, { color: t.fg }]}>{title}</Text> : null}
        <Text style={[styles.noticeText, { color: colors.inkSoft }]}>{children}</Text>
      </View>
    </View>
  );
}

/** Case à cocher avec libellé (confirmation). */
export function CheckRow({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) {
  return (
    <TouchableOpacity
      style={styles.checkRow}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Ligne libellé / valeur. */
export function KeyValue({
  label,
  value,
  valueColor,
  strong,
  last,
}: {
  label: string;
  value: string;
  valueColor?: string;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.kv, !last && styles.kvBorder]}>
      <Text style={[styles.kvLabel, strong && styles.kvLabelStrong]}>{label}</Text>
      <Text style={[styles.kvValue, strong && styles.kvValueStrong, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

/** État centré (succès, vide, bloqué) : pastille 56 px + titre + texte. */
export function CenteredState({
  icon: Icon,
  tone = 'primary',
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  tone?: Tone;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  const t = toneColors[tone];
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, { backgroundColor: t.bg }]}>
        <Icon size={26} color={t.fg} strokeWidth={1.8} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {text ? <Text style={styles.stateText}>{text}</Text> : null}
      {children}
    </View>
  );
}

export const actionStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
});

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.bg,
  },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSub: { ...typography.caption, fontWeight: '400', color: colors.muted, textAlign: 'center' },
  headerSide: { width: 40 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },

  sectionTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
    marginLeft: 4,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: radius.md,
    padding: 14,
  },
  noticeIcon: { marginTop: 1 },
  noticeBody: { flex: 1 },
  noticeTitle: { ...typography.callout, fontWeight: '600', marginBottom: 2 },
  noticeText: { ...typography.footnote },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  checkLabel: { flex: 1, ...typography.footnote, color: colors.inkSoft },

  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 12 },
  kvBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  kvLabel: { flex: 1, ...typography.callout, color: colors.muted },
  kvLabelStrong: { fontWeight: '600', color: colors.ink },
  kvValue: { ...typography.callout, fontWeight: '600', color: colors.ink },
  kvValueStrong: { ...typography.headline },

  state: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 12 },
  stateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  stateText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
