/**
 * Documents d'identité d'un membre / candidat (CNIB recto, verso, selfie)
 * + visionneuse plein écran.
 *
 * La visionneuse est un `Modal` rendu À L'INTÉRIEUR du composant : posé dans
 * une `Sheet`, il est donc imbriqué et s'affiche bien au-dessus de la feuille.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { FileText, UserCheck, ShieldCheck, X, FileX } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { IconButton, initialsOf } from '../../../components/ui';

export type MemberDocumentKind = 'front' | 'back' | 'selfie';

export interface MemberDocumentsProps {
  /** Nom affiché sur les aperçus */
  fullName: string;
  phoneNumber?: string;
  /** Photo de profil (utilisée pour l'aperçu du selfie en démo) */
  avatarUrl?: string;
  cnibFrontUrl?: string;
  cnibBackUrl?: string;
  selfieUrl?: string;
  /** Titre de section (défaut « Documents ») ; `null` pour le masquer */
  title?: string | null;
  /** Appelé à chaque ouverture d'un document */
  onOpen?: (kind: MemberDocumentKind) => void;
  /** Documents déjà consultés (affiche « Consulté ») */
  viewed?: Partial<Record<MemberDocumentKind, boolean>>;
}

export function MemberDocuments({
  fullName,
  phoneNumber,
  avatarUrl,
  cnibFrontUrl,
  cnibBackUrl,
  selfieUrl,
  title = 'Documents',
  onOpen,
  viewed,
}: MemberDocumentsProps) {
  const [open, setOpen] = useState<MemberDocumentKind | null>(null);

  const rows: { kind: MemberDocumentKind; icon: LucideIcon; title: string; sub: string }[] = [];
  if (cnibFrontUrl) rows.push({ kind: 'front', icon: FileText, title: 'CNIB recto', sub: 'Photo, identité et numéro' });
  if (cnibBackUrl) rows.push({ kind: 'back', icon: FileText, title: 'CNIB verso', sub: 'Adresse et détails biométriques' });
  if (selfieUrl) rows.push({ kind: 'selfie', icon: UserCheck, title: 'Selfie', sub: 'Vérification faciale' });

  const handleOpen = (kind: MemberDocumentKind) => {
    setOpen(kind);
    onOpen?.(kind);
  };

  return (
    <View>
      {title ? <Text style={styles.sectionLabel}>{title}</Text> : null}

      {rows.length === 0 ? (
        <View style={[styles.card, styles.emptyCard]}>
          <FileX size={20} color={colors.muted} />
          <Text style={styles.emptyText}>Aucun document fourni</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {rows.map((r, idx) => {
            const Icon = r.icon;
            return (
              <React.Fragment key={r.kind}>
                {idx > 0 ? <View style={styles.divider} /> : null}
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={0.6}
                  onPress={() => handleOpen(r.kind)}
                  accessibilityRole="button"
                  accessibilityLabel={`Voir ${r.title}`}
                >
                  <View style={styles.icon}>
                    <Icon size={19} color={colors.primary.DEFAULT} />
                  </View>
                  <View style={styles.flexShrink}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{r.title}</Text>
                    <Text style={styles.rowSub}>{viewed?.[r.kind] ? 'Consulté' : r.sub}</Text>
                  </View>
                  <Text style={styles.see}>Voir</Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      )}

      {/* VISIONNEUSE CNIB PLEIN ÉCRAN */}
      <Modal
        visible={open === 'front' || open === 'back'}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(null)}
      >
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerHeaderText}>CNIB — {open === 'back' ? 'Verso' : 'Recto'}</Text>
            <IconButton icon={X} color="#FFFFFF" style={styles.viewerClose} accessibilityLabel="Fermer" onPress={() => setOpen(null)} />
          </View>
          <View style={styles.docFrame}>
            <View style={styles.docCard}>
              <View style={styles.docTopRow}>
                <ShieldCheck size={24} color={colors.primary.dark} />
                <Text style={styles.docTitle}>RÉPUBLIQUE DE BURKINA FASO</Text>
              </View>
              <View style={styles.docPhotoRow}>
                <View style={styles.docPhoto}>
                  <Text style={styles.docPhotoText}>{initialsOf(fullName)}</Text>
                </View>
                <View style={styles.flexShrink}>
                  <Text style={styles.docName}>{fullName || '—'}</Text>
                  <Text style={styles.docMeta}>N° BFA-CNIB-00945271</Text>
                  <Text style={styles.docMeta}>Né(e) le 12/04/1990</Text>
                </View>
              </View>
              <View style={styles.docDivider} />
              <Text style={styles.docFoot}>
                {open === 'back'
                  ? 'Verso — Adresse et détails biométriques'
                  : 'Recto — Photo, identité et numéro'}
              </Text>
            </View>
            <Text style={styles.docHint}>Aperçu du document simulé pour la démo</Text>
          </View>
        </View>
      </Modal>

      {/* VISIONNEUSE SELFIE PLEIN ÉCRAN */}
      <Modal visible={open === 'selfie'} animationType="fade" transparent onRequestClose={() => setOpen(null)}>
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerHeaderText}>Selfie</Text>
            <IconButton icon={X} color="#FFFFFF" style={styles.viewerClose} accessibilityLabel="Fermer" onPress={() => setOpen(null)} />
          </View>
          <View style={styles.docFrame}>
            <View style={styles.selfieCard}>
              <Image source={{ uri: avatarUrl }} style={styles.selfieImage} contentFit="cover" />
              <View style={styles.selfieLabel}>
                <ShieldCheck size={15} color="#FFFFFF" />
                <Text style={styles.selfieLabelText}>
                  {fullName}
                  {phoneNumber ? ` — ${phoneNumber}` : ''}
                </Text>
              </View>
            </View>
            <Text style={styles.docHint}>Aperçu du selfie simulé pour la démo</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flexShrink: { flex: 1, flexShrink: 1 },
  sectionLabel: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyText: { ...typography.callout, color: colors.muted, flexShrink: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginLeft: 64,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted },
  see: { ...typography.callout, fontWeight: '600', color: colors.primary.DEFAULT },

  /* ── Visionneuses plein écran ── */
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 24, 29, 0.96)',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  viewerHeaderText: { ...typography.headline, color: '#FFFFFF' },
  viewerClose: { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
  docFrame: { flex: 1, justifyContent: 'center' },
  docCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 20,
    aspectRatio: 1.6,
    justifyContent: 'center',
    gap: 14,
  },
  docTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docTitle: { ...typography.caption, fontWeight: '700', color: colors.primary.dark },
  docPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  docPhoto: {
    width: 72,
    height: 88,
    borderRadius: 8,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docPhotoText: { ...typography.title, color: colors.subtle },
  docName: { ...typography.bodyStrong, color: colors.ink },
  docMeta: { ...typography.caption, fontWeight: '400', color: colors.inkSoft, marginTop: 3 },
  docDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  docFoot: { ...typography.caption, color: colors.muted, textAlign: 'center' },
  docHint: {
    ...typography.caption,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
  },
  selfieCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '86%',
    aspectRatio: 0.85,
  },
  selfieImage: { flex: 1 },
  selfieLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.primary.dark,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  selfieLabelText: { ...typography.footnote, fontWeight: '600', color: '#FFFFFF', flexShrink: 1 },
});
