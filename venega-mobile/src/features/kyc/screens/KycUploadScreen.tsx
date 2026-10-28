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
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  ScanFace,
  Image as ImageIcon,
  X,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Button, IconButton, ListGroup, ListRow, Sheet } from '../../../components/ui';

/* ── Ligne d'étape (document à fournir) ── */

function UploadStep({
  icon: Icon,
  title,
  subtitle,
  done,
  onPress,
  last,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  done: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityState={{ checked: done }}
      style={styles.step}
    >
      <View style={[styles.stepIcon, done && styles.stepIconDone]}>
        {done ? (
          <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <Icon size={20} color={colors.primary.DEFAULT} strokeWidth={1.8} />
        )}
      </View>
      <View style={[styles.stepBody, !last && styles.stepBorder]}>
        <View style={styles.stepText}>
          <Text style={styles.stepTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.stepSub, done && styles.stepSubDone]}>{subtitle}</Text>
        </View>
        {done ? (
          <Text style={styles.stepAction}>Refaire</Text>
        ) : (
          <ChevronRight size={18} color={colors.subtle} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function KycUploadScreen() {
  const router = useRouter();
  const [cnibRectoUploaded, setCnibRectoUploaded] = useState(false);
  const [cnibVersoUploaded, setCnibVersoUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Choix du mode d'ajout (caméra ou galerie)
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

  const doneCount = [cnibRectoUploaded, cnibVersoUploaded, selfieUploaded].filter(Boolean).length;
  const cameraTitle =
    cameraMode === 'selfie' ? 'Selfie de vérification' : cameraMode === 'recto' ? 'CNIB recto' : 'CNIB verso';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Vérification d'identité</Text>
          <Text style={styles.headerStep}>{doneCount}/3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Vos documents</Text>
          <Text style={styles.subtitle}>
            Ajoutez les deux faces de votre CNIB puis prenez un selfie pour valider votre compte.
          </Text>

          <Text style={styles.groupTitle}>Pièce d'identité</Text>
          <View style={styles.group}>
            <UploadStep
              icon={CreditCard}
              title="CNIB — recto"
              subtitle={cnibRectoUploaded ? 'Photo ajoutée' : 'Face avant, avec votre photo'}
              done={cnibRectoUploaded}
              onPress={() => handleDocumentClick('recto')}
            />
            <UploadStep
              icon={CreditCard}
              title="CNIB — verso"
              subtitle={cnibVersoUploaded ? 'Photo ajoutée' : 'Face arrière'}
              done={cnibVersoUploaded}
              onPress={() => handleDocumentClick('verso')}
              last
            />
          </View>

          <Text style={[styles.groupTitle, styles.groupSpacing]}>Selfie</Text>
          <View style={styles.group}>
            <UploadStep
              icon={ScanFace}
              title="Selfie de vérification"
              subtitle={selfieUploaded ? 'Selfie capturé' : 'Visage centré et bien éclairé'}
              done={selfieUploaded}
              onPress={openSelfieCamera}
              last
            />
          </View>

          <View style={styles.note}>
            <Lock size={16} color={colors.muted} strokeWidth={2} />
            <Text style={styles.noteText}>
              Vos documents sont chiffrés et restent strictement confidentiels.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Soumettre pour vérification"
            onPress={handleSubmit}
            loading={loading}
            disabled={doneCount < 3}
          />
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Choix : caméra ou galerie ── */}
      <Sheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        title={activeTarget === 'verso' ? 'Ajouter le verso' : 'Ajouter le recto'}
      >
        <ListGroup>
          <ListRow
            icon={Camera}
            tone="primary"
            title="Prendre une photo"
            subtitle="Ouvrir la caméra"
            onPress={selectCamera}
          />
          <ListRow
            icon={ImageIcon}
            tone="primary"
            title="Importer une image"
            subtitle="Choisir dans la galerie"
            onPress={selectGalleryUpload}
            last
          />
        </ListGroup>
      </Sheet>

      {/* ── Caméra (viseur simulé) ── */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.camera}>
          <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
          <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <IconButton
                icon={X}
                variant="plain"
                color="#FFFFFF"
                accessibilityLabel="Fermer la caméra"
                onPress={() => setCameraVisible(false)}
              />
              <Text style={[styles.headerTitle, styles.cameraTitle]}>{cameraTitle}</Text>
              <View style={styles.headerSide} />
            </View>

            <View style={styles.viewfinder}>
              <View style={cameraMode === 'selfie' ? styles.ovalFrame : styles.cardFrame} />
              <Text style={styles.frameHint}>
                {cameraMode === 'selfie'
                  ? 'Placez votre visage dans l\'ovale'
                  : 'Alignez la carte dans le cadre'}
              </Text>
            </View>

            <View style={styles.shutterBar}>
              <TouchableOpacity
                style={[styles.shutter, isCapturing && styles.shutterBusy]}
                onPress={takePhoto}
                disabled={isCapturing}
                accessibilityRole="button"
                accessibilityLabel="Prendre la photo"
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
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
  headerStep: {
    width: 40,
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
    textAlign: 'center',
  },
  headerSide: { width: 40 },

  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  title: {
    ...typography.title,
    color: colors.ink,
  },
  subtitle: {
    ...typography.callout,
    color: colors.muted,
    marginTop: 8,
    marginBottom: 28,
  },
  groupTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupSpacing: { marginTop: 24 },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },

  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    gap: 14,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconDone: {
    backgroundColor: colors.primary.DEFAULT,
  },
  stepBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingRight: 14,
  },
  stepBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  stepText: { flex: 1 },
  stepTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.ink,
  },
  stepSub: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 2,
  },
  stepSubDone: {
    color: colors.primary.DEFAULT,
    fontWeight: '500',
  },
  stepAction: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
  },

  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    ...typography.footnote,
    color: colors.muted,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.muted,
  },

  /* ── Caméra ── */
  camera: { flex: 1, backgroundColor: colors.ink },
  cameraTitle: { color: '#FFFFFF' },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  ovalFrame: {
    width: 240,
    height: 320,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardFrame: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  frameHint: {
    ...typography.callout,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  shutterBar: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterBusy: { opacity: 0.5 },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
});
