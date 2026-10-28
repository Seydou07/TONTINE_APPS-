import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Modal, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { typography } from '@venega/design-tokens';
import { Avatar, IconButton } from './ui';

interface AvatarViewerModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  photoUrl?: string;
  /** Obsolète — les initiales sont calculées par <Avatar> à partir de `name`. */
  initials?: string;
  /** Obsolète — ignoré : le fond suit le style unique de <Avatar>. */
  color?: string;
}

/** Visionneuse plein écran de la photo de profil d'un membre. */
export default function AvatarViewerModal({
  visible,
  onClose,
  name,
  photoUrl,
}: AvatarViewerModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} accessibilityLabel="Fermer">
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.content}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <Avatar name={name} size={240} />
          )}
          <Text style={styles.name}>{name}</Text>
        </TouchableOpacity>
        <IconButton
          icon={X}
          variant="plain"
          color="#FFFFFF"
          accessibilityLabel="Fermer"
          onPress={onClose}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
        />
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 24, 29, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: { alignItems: 'center', gap: 16 },
  photo: { width: 240, height: 240, borderRadius: 120 },
  name: { ...typography.headline, color: '#FFFFFF', textAlign: 'center' },
  closeBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
});
