import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeft, ArrowRight, FileText, Camera } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function KYCIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Vérification d'Identité</Text>
            <View style={{ width: 38 }} />
          </View>
        </View>

        {/* Corps emboîté crème */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationWrap}>
              <ShieldCheck size={52} color="#074B36" />
            </View>
          </View>

          <Text style={styles.title}>Identification conforme (KYC)</Text>
          <Text style={styles.subtitle}>
            Afin de sécuriser les cotisations et d'assurer la confiance de votre cercle, veuillez vérifier votre identité.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <FileText size={18} color="#074B36" />
              </View>
              <Text style={styles.infoText}>Pièce d'identité (CNIB ou Passeport)</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Camera size={18} color="#074B36" />
              </View>
              <Text style={styles.infoText}>Selfie d'identification directe</Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={styles.primaryPillBtn}
            activeOpacity={0.88}
            onPress={() => router.replace('/kyc-upload')}
          >
            <Text style={styles.primaryPillBtnText}>Commencer la vérification</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipBtnText}>Ignorer pour le moment</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  illustrationContainer: { alignItems: 'center', marginBottom: 20 },
  illustrationWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 22,
    color: '#074B36',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { fontFamily: 'WorkSansMedium', fontSize: 13.5, color: '#0F172A' },
  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryPillBtnText: { fontFamily: 'SoraBold', fontSize: 15.5, color: '#FFFFFF' },
  skipBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  skipBtnText: { fontFamily: 'WorkSansMedium', fontSize: 13.5, color: '#64748B' },
});
