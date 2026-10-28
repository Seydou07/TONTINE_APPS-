import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button, IconButton } from '../../../components/ui';
import { getProfile, setAvatarUrl } from '../profileStore';

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

export default function ProfilePhotoScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(getProfile());

  useFocusEffect(
    useCallback(() => {
      setProfile(getProfile());
    }, [])
  );

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Accès à la galerie requis',
        'Autorisez l\'accès à vos photos pour changer votre photo de profil.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
      setProfile(getProfile());
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Photo de profil</Text>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.photoArea}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={[styles.photo, styles.photoInitials]}>
              <Text style={styles.photoInitialsText}>{getInitials(profile.name)}</Text>
            </View>
          )}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.hint}>Visible par les membres de vos cercles</Text>
        </View>

        <View style={styles.footer}>
          <Button title="Changer la photo" icon={Camera} onPress={handleChangePhoto} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    flex: 1,
    ...typography.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  headerSide: { width: 40 },
  photoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  photo: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.fill,
  },
  photoInitials: {
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitialsText: {
    fontSize: 72,
    lineHeight: 84,
    fontWeight: '600',
    color: colors.primary.dark,
  },
  name: {
    ...typography.headline,
    color: colors.ink,
    marginTop: 24,
    textAlign: 'center',
  },
  hint: {
    ...typography.callout,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
});
