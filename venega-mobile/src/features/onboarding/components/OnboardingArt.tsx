import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Check, HandCoins, HeartHandshake, Lock, LockOpen, ShieldCheck, Smartphone, Wallet } from 'lucide-react-native';
import { colors, motion, numeric, radius, typography } from '@venega/design-tokens';

/**
 * Illustrations animées de l'introduction, dessinées en composants natifs (pas d'image) :
 * aucune somme ni personne inventée — des initiales génériques et des états du produit.
 * Les boucles tournent seulement sur la diapositive visible et s'arrêtent si l'utilisateur
 * a demandé de réduire les animations (état final affiché, immobile).
 */

const INITIALS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/** Boucle d'étapes : renvoie l'étape courante (0..count-1), figée sur `still` sans animation. */
function useStep(active: boolean, count: number, every: number, still: number) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(reduced ? still : 0);
  useEffect(() => {
    if (reduced) {
      setStep(still);
      return;
    }
    if (!active) return;
    const id = setInterval(() => setStep((s) => (s + 1) % count), every);
    return () => clearInterval(id);
  }, [active, count, every, reduced, still]);
  return step;
}

/* ── 1. La roue de rotation ── */

const WHEEL = 248;
const NODE = 44;
const RING = 98;

export function RotationArt({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  // Compteur qui ne revient jamais en arrière : la roue tourne toujours dans le même sens.
  const tick = useStep(active, 10000, 1700, 0);
  const step = tick % INITIALS.length;
  const angle = useSharedValue(0);

  useEffect(() => {
    // La roue avance d'un cran : le membre suivant arrive en haut, à la place du bénéficiaire.
    const target = -tick * (360 / INITIALS.length);
    angle.value = reduced ? target : withTiming(target, { duration: 800, easing: Easing.inOut(Easing.cubic) });
  }, [tick, reduced, angle]);

  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));
  const upright = useAnimatedStyle(() => ({ transform: [{ rotate: `${-angle.value}deg` }] }));

  return (
    <View style={styles.wheel} accessible accessibilityLabel="Roue de rotation : un bénéficiaire différent à chaque tour">
      <View style={styles.wheelTrack} />
      <Animated.View style={[StyleSheet.absoluteFill, ring]}>
        {INITIALS.map((letter, i) => {
          const a = (i / INITIALS.length) * 2 * Math.PI - Math.PI / 2;
          const served = i < step;
          return (
            <Animated.View
              key={letter}
              style={[
                styles.node,
                {
                  left: WHEEL / 2 + RING * Math.cos(a) - NODE / 2,
                  top: WHEEL / 2 + RING * Math.sin(a) - NODE / 2,
                },
                served && styles.nodeServed,
                upright,
              ]}
            >
              <Text style={[styles.nodeText, served && styles.nodeTextServed]}>{letter}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>
      {/* Repère fixe du bénéficiaire, en haut de la roue */}
      <View style={styles.beneficiaryHalo} pointerEvents="none" />
      <View style={styles.center}>
        <Wallet size={22} color={colors.primary.DEFAULT} />
        <Text style={styles.centerLabel}>Cagnotte</Text>
        <Text style={styles.centerSub}>du tour</Text>
      </View>
      <View style={styles.turnPill}>
        <Text style={styles.turnPillText}>Tour {step + 1}</Text>
      </View>
    </View>
  );
}

/* ── 2. Les cotisations arrivent ── */

const PAYERS = ['A', 'B', 'C', 'D'];

export function ContributionsArt({ active }: { active: boolean }) {
  // Étapes 0..4 : nombre de cotisations reçues ; 5 : cagnotte versée ; puis la boucle reprend.
  const step = useStep(active, 7, 1100, 5);
  const received = Math.min(step, PAYERS.length);
  const done = step >= 5;
  const fill = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const v = received / PAYERS.length;
    fill.value = reduced ? v : withTiming(v, { duration: motion.slow });
  }, [received, reduced, fill]);
  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.value }] }));

  return (
    <View style={styles.panel} accessible accessibilityLabel="Les cotisations arrivent une à une ; la cagnotte part quand tout est reçu">
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>Cotisations du tour</Text>
        <Text style={styles.panelCount}>
          {received} / {PAYERS.length}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.trackFill, bar]} />
      </View>
      <View style={styles.rows}>
        {PAYERS.map((p, i) => {
          const ok = i < received;
          return (
            <View key={p} style={styles.payRow}>
              <View style={[styles.payAvatar, ok && styles.payAvatarOk]}>
                <Text style={[styles.payInitial, ok && styles.payInitialOk]}>{p}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.payTitle}>{ok ? 'Cotisation reçue' : 'En attente'}</Text>
                <View style={styles.payMeta}>
                  <Smartphone size={12} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.paySub}>Mobile Money</Text>
                </View>
              </View>
              {ok ? (
                <Animated.View key={`${p}-${step}`} entering={FadeIn.duration(motion.base)} style={styles.check}>
                  <Check size={14} color={colors.primary.dark} strokeWidth={3} />
                </Animated.View>
              ) : (
                <View style={styles.checkEmpty} />
              )}
            </View>
          );
        })}
      </View>
      {done ? (
        <Animated.View entering={FadeInDown.duration(motion.base)} style={styles.paidPill}>
          <HandCoins size={16} color={colors.primary.dark} />
          <Text style={styles.paidText}>Cagnotte versée au bénéficiaire</Text>
        </Animated.View>
      ) : (
        <View style={styles.waitPill}>
          <Text style={styles.waitText}>Versée quand tout le monde a cotisé</Text>
        </View>
      )}
    </View>
  );
}

/* ── 3. La solidarité sous contrôle ── */

const VALIDATORS = ['A', 'B', 'C'];

export function SolidarityArt({ active }: { active: boolean }) {
  // 0..3 accords reçus, puis l'aide est débloquée ; la boucle reprend.
  const step = useStep(active, 6, 1200, 4);
  const approvals = Math.min(step, VALIDATORS.length);
  const unlocked = step >= 4;
  const LockIcon = unlocked ? LockOpen : Lock;
  return (
    <View style={styles.solid} accessible accessibilityLabel="L’aide est débloquée seulement après l’accord des validateurs">
      <View style={styles.vault}>
        <HeartHandshake size={30} color={colors.primary.DEFAULT} />
        <Text style={styles.vaultTitle}>Caisse d’entraide</Text>
        <View style={[styles.lockPill, unlocked && styles.lockPillOpen]}>
          <LockIcon size={13} color={unlocked ? colors.primary.dark : colors.accent.dark} strokeWidth={2.4} />
          <Text style={[styles.lockText, unlocked && styles.lockTextOpen]}>{unlocked ? 'Aide débloquée' : 'Argent bloqué'}</Text>
        </View>
      </View>
      <Text style={styles.validLabel}>Accord des validateurs</Text>
      <View style={styles.validRow}>
        {VALIDATORS.map((v, i) => {
          const ok = i < approvals;
          return (
            <View key={v} style={styles.validator}>
              <View style={[styles.validAvatar, ok && styles.validAvatarOk]}>
                <Text style={[styles.payInitial, ok && styles.payInitialOk]}>{v}</Text>
              </View>
              {ok ? (
                <Animated.View key={`${v}-${step}`} entering={FadeIn.duration(motion.base)} style={styles.validCheck}>
                  <Check size={11} color={colors.primary.dark} strokeWidth={3.2} />
                </Animated.View>
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={styles.shieldNote}>
        <ShieldCheck size={14} color={colors.accent.DEFAULT} />
        <Text style={styles.shieldText}>Le fondateur ne touche jamais l’argent</Text>
      </View>
    </View>
  );
}

const onGreenSoft = 'rgba(255,255,255,0.12)';

const styles = StyleSheet.create({
  flex: { flex: 1 },

  wheel: { width: WHEEL, height: WHEEL },
  wheelTrack: {
    position: 'absolute',
    left: WHEEL / 2 - RING,
    top: WHEEL / 2 - RING,
    width: RING * 2,
    height: RING * 2,
    borderRadius: RING,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    borderStyle: 'dashed',
  },
  node: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeServed: { backgroundColor: colors.primary.light },
  nodeText: { ...typography.bodyStrong, color: colors.primary.dark },
  nodeTextServed: { color: '#FFFFFF' },
  beneficiaryHalo: {
    position: 'absolute',
    left: WHEEL / 2 - NODE / 2 - 5,
    top: WHEEL / 2 - RING - NODE / 2 - 5,
    width: NODE + 10,
    height: NODE + 10,
    borderRadius: (NODE + 10) / 2,
    borderWidth: 3,
    borderColor: colors.accent.DEFAULT,
  },
  center: {
    position: 'absolute',
    left: WHEEL / 2 - 52,
    top: WHEEL / 2 - 52,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: { ...typography.footnote, fontWeight: '700', color: colors.ink, marginTop: 4 },
  centerSub: { ...typography.caption, fontWeight: '400', color: colors.muted },
  turnPill: {
    position: 'absolute',
    alignSelf: 'center',
    top: -6,
    left: WHEEL / 2 + 30,
    paddingHorizontal: 10,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.DEFAULT,
    justifyContent: 'center',
  },
  turnPillText: { ...typography.caption, ...numeric, fontWeight: '700', color: colors.ink },

  panel: {
    width: 288,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: onGreenSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  panelTitle: { ...typography.footnote, fontWeight: '600', color: '#FFFFFF' },
  panelCount: { ...typography.headline, ...numeric, color: colors.accent.DEFAULT },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 10, overflow: 'hidden' },
  trackFill: { ...StyleSheet.absoluteFill, backgroundColor: colors.accent.DEFAULT, transformOrigin: 'left' },
  rows: { marginTop: 12, gap: 10 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payAvatarOk: { backgroundColor: '#FFFFFF' },
  payInitial: { ...typography.footnote, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  payInitialOk: { color: colors.primary.dark },
  payTitle: { ...typography.footnote, fontWeight: '600', color: '#FFFFFF' },
  payMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  paySub: { ...typography.caption, fontWeight: '400', color: 'rgba(255,255,255,0.6)' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 36,
    marginTop: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.DEFAULT,
  },
  paidText: { ...typography.footnote, fontWeight: '700', color: colors.primary.dark },
  waitPill: {
    height: 36,
    marginTop: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitText: { ...typography.footnote, color: 'rgba(255,255,255,0.75)' },

  solid: { width: 288, alignItems: 'center' },
  vault: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
  },
  vaultTitle: { ...typography.bodyStrong, color: colors.ink, marginTop: 8 },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.tint,
  },
  lockPillOpen: { backgroundColor: colors.primary.tint },
  lockText: { ...typography.caption, color: colors.accent.dark },
  lockTextOpen: { color: colors.primary.dark },
  validLabel: { ...typography.footnote, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 20 },
  validRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  validator: { width: 48, height: 48 },
  validAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validAvatarOk: { backgroundColor: '#FFFFFF' },
  validCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent.DEFAULT,
    borderWidth: 2,
    borderColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 },
  shieldText: { ...typography.caption, fontWeight: '500', color: 'rgba(255,255,255,0.85)' },
});
