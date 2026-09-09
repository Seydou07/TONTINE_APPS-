import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { X } from 'lucide-react-native';

interface AvatarViewerModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  photoUrl?: string;
  initials: string;
  color: string;
}

export default function AvatarViewerModal({
  visible,
  onClose,
  name,
  photoUrl,
  initials,
  color,
}: AvatarViewerModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.content}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.initialsCircle, { backgroundColor: color }]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.name}>{name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10, 10, 12, 0.94)', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', gap: 18 },
  photo: { width: 260, height: 260, borderRadius: 130 },
  initialsCircle: { justifyContent: 'center', alignItems: 'center' },
  initialsText: { fontFamily: 'SoraBold', fontSize: 76, color: '#FFFFFF' },
  name: { fontFamily: 'SoraBold', fontSize: 17, color: '#FFFFFF' },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
