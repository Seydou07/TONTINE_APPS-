import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, numeric, radius, typography } from '@venega/design-tokens';
import Sheet from './Sheet';
import Button from './Button';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const WEEKDAYS_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const pad = (n: number) => String(n).padStart(2, '0');
const toDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromDay = (s?: string) => {
  const m = s ? /^(\d{4})-(\d{2})-(\d{2})/.exec(s) : null;
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
};

/** Grille d'un mois, semaines commençant le lundi (usage au Burkina Faso). */
function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** « 2026-12-06 » */
  value?: string;
  /** Jours antérieurs non sélectionnables (« 2026-11-12 »). */
  minDate?: string;
  /** Met en avant les jours de cotisation (ex. tous les samedis). */
  highlightWeekday?: number;
  onConfirm: (day: string) => void;
  confirmLabel?: string;
};

/** Calendrier dans une feuille : aucun module natif, police système, cibles de 44 px. */
export function DatePickerSheet({ visible, onClose, title, value, minDate, highlightWeekday, onConfirm, confirmLabel }: Props) {
  const initial = fromDay(value) ?? fromDay(minDate) ?? new Date();
  const [cursor, setCursor] = useState({ y: initial.getFullYear(), m: initial.getMonth() });
  const [picked, setPicked] = useState<string | undefined>(value);

  useEffect(() => {
    if (!visible) return;
    const d = fromDay(value) ?? fromDay(minDate) ?? new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setPicked(value);
  }, [visible, value, minDate]);

  const cells = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor]);
  const min = fromDay(minDate);
  const today = toDay(new Date());
  const canGoBack = !min || new Date(cursor.y, cursor.m, 1) > new Date(min.getFullYear(), min.getMonth(), 1);
  const shift = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.monthBar}>
        <Pressable
          onPress={() => canGoBack && shift(-1)}
          disabled={!canGoBack}
          style={[styles.navBtn, !canGoBack && styles.navOff]}
          accessibilityRole="button"
          accessibilityLabel="Mois précédent"
        >
          <ChevronLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.monthLabel} accessibilityRole="header">
          {MONTHS[cursor.m]} {cursor.y}
        </Text>
        <Pressable onPress={() => shift(1)} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Mois suivant">
          <ChevronRight size={20} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.week}>
        {WEEKDAYS_SHORT.map((d, i) => (
          <Text key={i} style={[styles.weekday, highlightWeekday === i + 1 && styles.weekdayHot]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={styles.cell} />;
          const key = toDay(d);
          const disabled = !!min && d < min;
          const selected = key === picked;
          const isToday = key === today;
          const hot = highlightWeekday === ((d.getDay() + 6) % 7) + 1 && !disabled;
          return (
            <Pressable
              key={i}
              disabled={disabled}
              onPress={() => setPicked(key)}
              style={styles.cell}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`${WEEKDAYS_LONG[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`}
            >
              <View style={[styles.day, hot && styles.dayHot, isToday && styles.dayToday, selected && styles.daySelected]}>
                <Text
                  style={[
                    styles.dayText,
                    disabled && styles.dayDisabled,
                    hot && styles.dayHotText,
                    selected && styles.daySelectedText,
                  ]}
                >
                  {d.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button
        title={confirmLabel ?? 'Choisir cette date'}
        disabled={!picked}
        onPress={() => picked && onConfirm(picked)}
        style={styles.confirm}
      />
    </Sheet>
  );
}

/** Choix du jour de la semaine : sept pastilles L M M J V S D. */
export function WeekdayPicker({ value, onChange }: { value?: number; onChange: (weekday: number) => void }) {
  return (
    <View style={styles.weekRow} accessibilityRole="radiogroup">
      {WEEKDAYS_SHORT.map((d, i) => {
        const selected = value === i + 1;
        return (
          <Pressable
            key={i}
            onPress={() => onChange(i + 1)}
            style={[styles.weekPill, selected && styles.weekPillOn]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={WEEKDAYS_LONG[i]}
          >
            <Text style={[styles.weekPillText, selected && styles.weekPillTextOn]}>{d}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Choix du jour du mois (1 à 31). Les jours 29 à 31 sont ramenés au dernier jour des mois courts. */
export function MonthDayPicker({ value, onChange }: { value?: number; onChange: (day: number) => void }) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
        const selected = value === n;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={styles.cell}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={n === 1 ? 'Le 1er du mois' : `Le ${n} du mois`}
          >
            <View style={[styles.day, selected && styles.daySelected]}>
              <Text style={[styles.dayText, selected && styles.daySelectedText]}>{n}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navOff: { opacity: 0.35 },
  monthLabel: { ...typography.headline, color: colors.ink },
  week: { flexDirection: 'row', marginTop: 4 },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', ...typography.caption, color: colors.muted, paddingVertical: 6 },
  weekdayHot: { color: colors.primary.DEFAULT },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 46, justifyContent: 'center', alignItems: 'center' },
  day: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  dayHot: { backgroundColor: colors.primary.tint },
  dayToday: { borderWidth: 1, borderColor: colors.lineStrong },
  daySelected: { backgroundColor: colors.primary.DEFAULT, borderWidth: 0 },
  dayText: { ...typography.callout, ...numeric, fontWeight: '500', color: colors.ink },
  dayHotText: { color: colors.primary.dark },
  dayDisabled: { color: colors.lineStrong },
  daySelectedText: { color: '#FFFFFF', fontWeight: '700' },
  confirm: { marginTop: 16 },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  weekPill: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekPillOn: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  weekPillText: { ...typography.callout, fontWeight: '600', color: colors.inkSoft },
  weekPillTextOn: { color: '#FFFFFF' },
});
