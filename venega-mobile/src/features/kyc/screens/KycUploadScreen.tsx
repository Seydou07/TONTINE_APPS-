import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Upload,
  BadgeCheck,
  Image as ImageIcon,
  X,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function KycUploadScreen() {
  const router = useRouter();
  const [cnibRectoUploaded, setCnibRectoUploaded] = useState(false);
  const [cnibVersoUploaded, setCnibVersoUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Picker Option Modal (Camera vs Gallery Upload)
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeTarget, setActiveTarget] = useState<'recto' | 'verso' | null>(null);

  // Modal Caméra
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraMode, setCameraMode] = useState<'recto' | 'verso' | 'selfie'>('recto');
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDocumentClick = (target: 'recto' | 'verso') => {
    setActiveTarget(target);
    setPickerVisible(true);
  };

  const selectCamera = () => {
    setPickerVisible(false);
    if (activeTarget) {
      setCameraMode(activeTarget);
      setCameraVisible(true);
    }
  };

  const selectGalleryUpload = () => {
    setPickerVisible(false);
    if (activeTarget === 'recto') {
      setCnibRectoUploaded(true);
    } else if (activeTarget === 'verso') {
      setCnibVersoUploaded(true);
    }
    setActiveTarget(null);
  };

  const openSelfieCamera = () => {
    setCameraMode('selfie');
    setCameraVisible(true);
  };

  const takePhoto = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      setCameraVisible(false);
      if (cameraMode === 'recto') setCnibRectoUploaded(true);
      if (cameraMode === 'verso') setCnibVersoUploaded(true);
      if (cameraMode === 'selfie') setSelfieUploaded(true);
    }, 800);
  };

  const handleSubmit = () => {
    if (!cnibRectoUploaded || !cnibVersoUploaded || !selfieUploaded) {
      Alert.alert('Incomplet', 'Veuillez ajouter la CNIB (Recto & Verso) et votre Selfie d\'identification.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/kyc-success');
    }, 1500);
  };

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

          <View style={styles.heroTextGroup}>
            <Text style={styles.heroTitle}>Identification (KYC)</Text>
            <Text style={styles.heroSubtitle}>
              Ajoutez votre pièce d'identité (CNIB) et un selfie pour valider votre compte.
            </Text>
          </View>
        </View>

        {/* Corps emboîté crème */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Note de sécurité */}
            <View style={styles.securityBanner}>
              <ShieldCheck size={20} color="#074B36" />
              <Text style={styles.securityBannerText}>
                Vos documents d'identité sont cryptés et strictement confidentiels.
              </Text>
            </View>

            {/* 1. CNIB Recto */}
            <Text style={styles.uploadSectionTitle}>1. CNIB — Recto *</Text>
            <TouchableOpacity
              style={[styles.uploadCard, cnibRectoUploaded && styles.uploadCardDone]}
              activeOpacity={0.8}
              onPress={() => handleDocumentClick('recto')}
            >
              <View style={[styles.uploadIconWrap, cnibRectoUploaded && styles.uploadIconWrapDone]}>
                {cnibRectoUploaded ? (
                  <CheckCircle2 size={22} color="#10B981" />
                ) : (
                  <FileCheck2 size={22} color="#074B36" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadCardTitle}>CNIB (Face avant / Recto)</Text>
                <Text style={styles.uploadCardSub}>
                  {cnibRectoUploaded ? 'Document recto ajouté' : 'Prendre une photo ou importer un fichier'}
                </Text>
              </View>
              <Upload size={18} color={cnibRectoUploaded ? '#10B981' : '#94A3B8'} />
            </TouchableOpacity>

            {/* 2. CNIB Verso */}
            <Text style={styles.uploadSectionTitle}>2. CNIB — Verso *</Text>
            <TouchableOpacity
              style={[styles.uploadCard, cnibVersoUploaded && styles.uploadCardDone]}
              activeOpacity={0.8}
              onPress={() => handleDocumentClick('verso')}
            >
              <View style={[styles.uploadIconWrap, cnibVersoUploaded && styles.uploadIconWrapDone]}>
                {cnibVersoUploaded ? (
                  <CheckCircle2 size={22} color="#10B981" />
                ) : (
                  <FileCheck2 size={22} color="#074B36" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadCardTitle}>CNIB (Face arrière / Verso)</Text>
                <Text style={styles.uploadCardSub}>
                  {cnibVersoUploaded ? 'Document verso ajouté' : 'Prendre une photo ou importer un fichier'}
                </Text>
              </View>
              <Upload size={18} color={cnibVersoUploaded ? '#10B981' : '#94A3B8'} />
            </TouchableOpacity>

            {/* 3. Selfie d'identification */}
            <Text style={styles.uploadSectionTitle}>3. Selfie de vérification *</Text>
            <TouchableOpacity
              style={[styles.selfieZone, selfieUploaded && styles.selfieZoneDone]}
              activeOpacity={0.8}
              onPress={openSelfieCamera}
            >
              <View style={styles.cameraCircle}>
                {selfieUploaded ? (
                  <BadgeCheck size={32} color="#10B981" />
                ) : (
                  <Camera size={32} color="#074B36" />
                )}
              </View>
              <Text style={styles.selfieTitle}>Prendre un selfie</Text>
              <Text style={styles.selfieSub}>
                {selfieUploaded
                  ? 'Selfie d\'identification capturé'
                  : 'Placez votre visage au centre du cadrage'}
              </Text>
            </TouchableOpacity>

            {/* Bouton de soumission */}
            <TouchableOpacity
              style={styles.primaryPillBtn}
              activeOpacity={0.88}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.primaryPillBtnText}>
                {loading ? 'Vérification en cours...' : 'Soumettre pour vérification'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.skipBtnText}>Ignorer pour l'instant</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Modal de Sélection (Caméra vs Galerie) */}
        <Modal visible={pickerVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.pickerModalCard}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Mode d'ajout du document</Text>
                <TouchableOpacity onPress={() => setPickerVisible(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.pickerOptionBtn} onPress={selectCamera}>
                <View style={styles.pickerOptionIconWrap}>
                  <Camera size={22} color="#074B36" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerOptionTitle}>Prendre une photo</Text>
                  <Text style={styles.pickerOptionSub}>Ouvrir la caméra de l'appareil</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pickerOptionBtn} onPress={selectGalleryUpload}>
                <View style={styles.pickerOptionIconWrap}>
                  <ImageIcon size={22} color="#074B36" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerOptionTitle}>Importer une image</Text>
                  <Text style={styles.pickerOptionSub}>Choisir depuis la galerie de photos</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal Caméra Interactive */}
        <Modal visible={cameraVisible} animationType="slide" transparent={false}>
          <View style={styles.cameraModalContainer}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* En-tête caméra */}
              <View style={styles.cameraTopBar}>
                <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setCameraVisible(false)}>
                  <ArrowLeft size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.cameraTitleText}>
                  {cameraMode === 'selfie' ? 'Selfie de vérification' : cameraMode === 'recto' ? 'CNIB Recto' : 'CNIB Verso'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Viseur de la caméra */}
              <View style={styles.viewfinderWrap}>
                {cameraMode === 'selfie' ? (
                  <View style={styles.ovalFrame}>
                    <Text style={styles.frameInstruction}>Cadrez votre visage ici</Text>
                  </View>
                ) : (
                  <View style={styles.cardFrame}>
                    <Text style={styles.frameInstruction}>Alignez la carte CNIB dans le cadre</Text>
                  </View>
                )}
              </View>

              {/* Barre de déclencheur caméra */}
              <View style={styles.cameraBottomBar}>
                <TouchableOpacity
                  style={[styles.shutterBtn, isCapturing && styles.shutterBtnCapturing]}
                  onPress={takePhoto}
                  disabled={isCapturing}
                >
                  <View style={styles.shutterInnerCircle} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 12,
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
    fontSize: 20,
    color: '#FFFFFF',
  },
  heroTextGroup: {
    marginTop: 4,
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    gap: 14,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(7, 75, 54, 0.06)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
  },
  securityBannerText: {
    flex: 1,
    fontFamily: 'WorkSansMedium',
    fontSize: 12.5,
    color: '#074B36',
  },
  uploadSectionTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#074B36',
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  uploadCardDone: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  uploadIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconWrapDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  uploadCardTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  uploadCardSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  selfieZone: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#074B36',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  selfieZoneDone: {
    borderColor: '#10B981',
    borderStyle: 'solid',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfieTitle: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
  },
  selfieSub: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
  },
  primaryPillBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipBtnText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13.5,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  pickerModalCard: {
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 14,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pickerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#074B36',
  },
  pickerOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  pickerOptionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOptionTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#0F172A',
  },
  pickerOptionSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cameraModalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  cameraTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cameraCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitleText: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  viewfinderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ovalFrame: {
    width: 240,
    height: 320,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: '#36E395',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(54, 227, 149, 0.05)',
  },
  cardFrame: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#36E395',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(54, 227, 149, 0.05)',
  },
  frameInstruction: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraBottomBar: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#074B36',
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterBtnCapturing: {
    opacity: 0.5,
  },
  shutterInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
});
