import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera } from 'lucide-react-native';
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
      <StatusBar barStyle="light-content" backgroundColor="#0B140F" />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={17} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.nameText} numberOfLines={1}>{profile.name}</Text>
        <View style={styles.closeBtnPlaceholder} />
      </View>

      <View style={styles.photoArea}>
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={styles.photoInitials}>
            <Text style={styles.photoInitialsText}>{getInitials(profile.name)}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.changeBtn} activeOpacity={0.88} onPress={handleChangePhoto}>
          <Camera size={17} color="#074B36" />
          <Text style={styles.changeBtnText}>Changer la photo</Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>Visible par les membres de vos cercles</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B140F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnPlaceholder: {
    width: 38,
  },
  nameText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  photoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  photo: {
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  photoInitials: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#D9A441',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitialsText: {
    fontFamily: 'SoraBold',
    fontSize: 88,
    color: '#FFFFFF',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    gap: 12,
  },
  changeBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  changeBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#074B36',
  },
  hintText: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
