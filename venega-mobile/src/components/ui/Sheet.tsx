import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { colors, motion, typography } from '@venega/design-tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

/**
 * Feuille modale : le voile apparaît en fondu, le panneau glisse du bas (transform seulement).
 * Sans animation de glissement si l'utilisateur a demandé de réduire les animations.
 */
export default function Sheet({ visible, onClose, title, children }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const entering = reduced ? undefined : SlideInDown.duration(motion.slow).easing(Easing.out(Easing.cubic));
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
        <Animated.View entering={entering} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.handle} />
          {title ? (
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 39, 28, 0.42)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: 16,
  },
  title: {
    ...typography.headline,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 12,
  },
});
