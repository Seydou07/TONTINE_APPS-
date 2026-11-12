import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2 } from 'lucide-react-native';
import { colors, motion, radius, shadows, typography } from '@venega/design-tokens';

/** Petite confirmation en bas d'écran (« Réglage enregistré »), qui disparaît seule. */
export function useToast(duration = 1800) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback(
    (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return { message, show };
}

export function Toast({ message }: { message: string | null }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  if (!message) return null;
  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 16) + 8 }]}>
      <Animated.View
        entering={reduced ? undefined : FadeInDown.duration(motion.base)}
        exiting={reduced ? undefined : FadeOutDown.duration(motion.fast)}
        style={styles.toast}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <CheckCircle2 size={18} color={colors.accent.DEFAULT} />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.dark,
    ...shadows.md,
  },
  text: { ...typography.callout, fontWeight: '600', color: '#FFFFFF' },
});
