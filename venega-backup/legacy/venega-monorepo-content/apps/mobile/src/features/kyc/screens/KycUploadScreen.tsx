import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { FileText, Camera, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../../packages/design-tokens/src';

export default function KYCUploadScreen() {
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!idUploaded || !selfieUploaded) {
      Alert.alert('Erreur', 'Veuillez uploader les deux documents');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace({ pathname: '/kyc-success', params: { fromCreate: 'false' } });
    }, 1700);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Vérification de vos documents…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepText}>Étape 3 sur 4</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Uploader vos documents</Text>
        <Text style={styles.subtitle}>
          Votre CNIB/passeport et un selfie pour confirmer votre identité. Vos données sont sécurisées.
        </Text>

        {/* Document Upload Buttons */}
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadCard, idUploaded && styles.uploadCardDone]}
            onPress={() => { Alert.alert('Info', 'CNIB.jpg ajouté ! (simulation)'); setIdUploaded(true); }}
          >
            <View style={styles.uploadIcon}>
              {idUploaded ? (
                <CheckCircle2 size={32} color={colors.success} />
              ) : (
                <FileText size={32} color={colors.primary.DEFAULT} />
              )}
            </View>
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadTitle}>CNIB ou Passeport</Text>
              <Text style={styles.uploadSubtitle}>{idUploaded ? 'Document uploadé' : 'Cliquez pour uploader'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadCard, selfieUploaded && styles.uploadCardDone]}
            onPress={() => { Alert.alert('Info', 'Selfie capturé ! (simulation)'); setSelfieUploaded(true); }}
          >
            <View style={styles.uploadIcon}>
              {selfieUploaded ? (
                <CheckCircle2 size={32} color={colors.success} />
              ) : (
                <Camera size={32} color={colors.primary.DEFAULT} />
              )}
            </View>
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadTitle}>Selfie de vérification</Text>
              <Text style={styles.uploadSubtitle}>{selfieUploaded ? 'Selfie uploadé' : 'Prendre un selfie'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
          <Text style={styles.btnPrimaryText}>Envoyer pour vérification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'WorkSans', fontSize: 16, color: colors.textMuted, marginTop: spacing[4] },
  header: {
    paddingHorizontal: spacing[6], paddingVertical: spacing[6],
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  stepText: { fontFamily: 'WorkSans', fontSize: 14, color: colors.textMuted },
  content: { flex: 1, paddingHorizontal: spacing[6], paddingTop: spacing[1] },
  title: { fontFamily: 'Sora', fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing[2] },
  subtitle: {
    fontFamily: 'WorkSans', fontSize: 16, color: colors.textMuted,
    lineHeight: 24, marginBottom: spacing[8],
  },
  uploadContainer: { gap: spacing[6] },
  uploadCard: {
    backgroundColor: colors.surface, padding: spacing[6], borderRadius: radius.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing[6],
    borderWidth: 1, borderColor: colors.border,
  },
  uploadCardDone: { borderColor: colors.success, backgroundColor: colors.primary.tint },
  uploadIcon: {
    width: 60, height: 60, borderRadius: radius.md,
    backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center',
  },
  uploadTextContainer: { flex: 1 },
  uploadTitle: { fontFamily: 'WorkSans', fontSize: 16, color: colors.text, fontWeight: '600' },
  uploadSubtitle: { fontFamily: 'WorkSans', fontSize: 14, color: colors.textMuted, marginTop: 2 },
  btnPrimary: {
    backgroundColor: colors.primary.DEFAULT, paddingVertical: spacing[6],
    borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[8],
  },
  btnPrimaryText: { fontFamily: 'WorkSans', fontSize: 16, color: '#fff', fontWeight: '600' },
});
