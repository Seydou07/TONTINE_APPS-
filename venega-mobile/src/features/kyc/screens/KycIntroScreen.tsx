import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeft, ArrowRight, FileText, Camera } from 'lucide-react-native';

export default function KYCIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification d'identité</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.illustrationWrap}>
            <ShieldCheck size={44} color="#074B36" />
          </View>

          <Text style={styles.title}>Identification conforme</Text>
          <Text style={styles.subtitle}>
            Pour sécuriser les cotisations et la confiance de votre cercle, votre identité doit être vérifiée.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <FileText size={18} color="#074B36" />
              </View>
              <Text style={styles.infoText}>Pièce d'identité (CNIB ou passeport)</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Camera size={18} color="#074B36" />
              </View>
              <Text style={styles.infoText}>Selfie de vérification</Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.88}
            onPress={() => router.replace('/kyc-upload')}
          >
            <Text style={styles.primaryBtnText}>Commencer la vérification</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipBtnText}>Ignorer pour le moment</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  backBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#0F172A' },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  illustrationWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E4F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 21,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  infoDivider: { height: 1, backgroundColor: '#F1F3F6' },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E4F0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { fontFamily: 'WorkSansMedium', fontSize: 13.5, color: '#0F172A' },
  primaryBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: { fontFamily: 'SoraBold', fontSize: 15.5, color: '#FFFFFF' },
  skipBtn: { paddingVertical: 14, alignItems: 'center' },
  skipBtnText: { fontFamily: 'WorkSansMedium', fontSize: 13.5, color: '#64748B' },
});
