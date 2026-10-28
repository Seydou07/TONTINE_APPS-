import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  BadgeCheck,
  Camera,
  ChevronDown,
  FileText,
  Gauge,
  HelpCircle,
  History,
  Lock,
  LogOut,
  Mail,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { KycStatus } from '@venega/types';
import { getProfile } from '../profileStore';
import { logout as endSession } from '../../auth/api';
import { getCircles, getCurrentUser } from '../../circles/circleStore';
import { Button, HeroHeader, HeroStatusBar, ListGroup, ListRow, Sheet, TextField, heroColors } from '../../../components/ui';

/** Hauteur dont la carte des chiffres clés chevauche le bandeau vert. */
const STATS_OVERLAP = 36;

const FAQ_ITEMS = [
  {
    question: 'Comment fonctionnent les tours de tontine ?',
    answer:
      'À chaque tour, tous les membres versent leur cotisation. La somme collectée est attribuée au bénéficiaire désigné pour ce tour.',
  },
  {
    question: 'Que se passe-t-il si un membre prend du retard ?',
    answer:
      'Des pénalités peuvent s’appliquer selon les règles du cercle. Le score de fiabilité du membre diminue et il peut être relancé ou remplacé.',
  },
  {
    question: 'Comment payer mes cotisations ?',
    answer: 'Les paiements se font par mobile money : Orange Money, Moov Money ou Wave.',
  },
  {
    question: 'Comment vérifier mon identité ?',
    answer: 'Dans « Vérification d’identité », envoyez une photo de votre CNIB puis prenez un selfie de confirmation.',
  },
];

const kycLabel: Record<string, { text: string; ok: boolean }> = {
  [KycStatus.VERIFIED]: { text: 'Vérifiée', ok: true },
  [KycStatus.PENDING]: { text: 'En cours', ok: false },
  [KycStatus.REJECTED]: { text: 'Refusée', ok: false },
  [KycStatus.NOT_SUBMITTED]: { text: 'À faire', ok: false },
};

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '')).toUpperCase();
}

/** « +22670123456 » → « 70 12 34 56 » */
function localPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^226/, '');
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const fullName = `${user.firstName} ${user.lastName}`;
  const memberSince = new Date(user.createdAt).getFullYear();
  const circleCount = getCircles().filter((c) => !!c.activatedAt).length;
  const kyc = kycLabel[user.kycStatus] ?? kycLabel[KycStatus.NOT_SUBMITTED]!;

  const [avatarUrl, setAvatarUrl] = useState(getProfile().avatarUrl);
  const [momoPhone, setMomoPhone] = useState(localPhone(user.phoneNumber));
  const [draftPhone, setDraftPhone] = useState(momoPhone);

  const [phoneSheet, setPhoneSheet] = useState(false);
  const [helpSheet, setHelpSheet] = useState(false);
  const [logoutSheet, setLogoutSheet] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      setAvatarUrl(getProfile().avatarUrl);
    }, []),
  );

  const savePhone = () => {
    if (draftPhone.replace(/\D/g, '').length !== 8) return;
    setMomoPhone(draftPhone.trim());
    setPhoneSheet(false);
  };

  const logout = async () => {
    setLogoutSheet(false);
    await endSession();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <HeroStatusBar />
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Identité (section verte) ── */}
          <HeroHeader overlap={STATS_OVERLAP} style={styles.hero}>
            <View style={styles.identity}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/profile-photo' as any)}
                accessibilityRole="button"
                accessibilityLabel="Changer la photo de profil"
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitials}>{initials(fullName)}</Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={14} color={colors.ink} />
                </View>
              </TouchableOpacity>

              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {fullName}
                </Text>
                {kyc.ok ? <BadgeCheck size={20} color={colors.primary.dark} fill={heroColors.accent} /> : null}
              </View>
              <Text style={styles.phone}>+226 {localPhone(user.phoneNumber)}</Text>

              <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile-setup')} activeOpacity={0.7}>
                <Text style={styles.editBtnText}>Modifier le profil</Text>
              </TouchableOpacity>
            </View>
          </HeroHeader>

          {/* ── Chiffres clés ── */}
          <View style={styles.stats}>
            <Stat value={`${circleCount}`} label="Cercles" />
            <View style={styles.statDivider} />
            <Stat value={`${user.reputationScore}`} label="Fiabilité" onPress={() => router.push('/reliability' as any)} />
            <View style={styles.statDivider} />
            <Stat value={`${memberSince}`} label="Membre depuis" />
          </View>

          {/* ── Vérification à compléter ── */}
          {!kyc.ok && (
            <TouchableOpacity style={styles.kycBanner} activeOpacity={0.85} onPress={() => router.push('/kyc-intro' as any)}>
              <View style={styles.kycIcon}>
                <ShieldCheck size={20} color={colors.accent.deep} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.kycTitle}>Vérifiez votre identité</Text>
                <Text style={styles.kycText}>Obligatoire pour créer ou rejoindre un cercle.</Text>
              </View>
              <Text style={styles.kycAction}>Commencer</Text>
            </TouchableOpacity>
          )}

          <ListGroup title="Compte" style={styles.group}>
            <ListRow icon={UserRound} title="Informations personnelles" onPress={() => router.push('/profile-setup')} />
            <ListRow
              icon={ShieldCheck}
              title="Vérification d’identité"
              value={kyc.text}
              valueTone={kyc.ok ? 'success' : 'muted'}
              onPress={() => router.push('/kyc-upload')}
            />
            <ListRow icon={Lock} title="Mot de passe" onPress={() => {}} last />
          </ListGroup>

          <ListGroup title="Paiements" style={styles.group}>
            <ListRow
              icon={Smartphone}
              title="Numéro mobile money"
              subtitle="Pour recevoir vos cagnottes"
              value={momoPhone}
              onPress={() => {
                setDraftPhone(momoPhone);
                setPhoneSheet(true);
              }}
            />
            <ListRow icon={History} title="Historique des transactions" onPress={() => router.push('/activity' as any)} />
            <ListRow icon={Gauge} title="Score de fiabilité" onPress={() => router.push('/reliability' as any)} last />
          </ListGroup>

          <ListGroup title="Aide" style={styles.group}>
            <ListRow icon={HelpCircle} title="Centre d’aide" onPress={() => setHelpSheet(true)} />
            <ListRow icon={FileText} title="Conditions d’utilisation" onPress={() => {}} last />
          </ListGroup>

          <ListGroup style={styles.group}>
            <ListRow icon={LogOut} tone="danger" title="Se déconnecter" chevron={false} onPress={() => setLogoutSheet(true)} last />
          </ListGroup>

          <Text style={styles.version}>Venega · version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </ScrollView>
      </View>

      {/* ── Numéro mobile money ── */}
      <Sheet visible={phoneSheet} onClose={() => setPhoneSheet(false)} title="Numéro mobile money">
        <Text style={styles.sheetText}>Les cagnottes et remboursements seront versés sur ce numéro.</Text>
        <TextField
          prefix="+226"
          placeholder="70 12 34 56"
          keyboardType="phone-pad"
          maxLength={11}
          value={draftPhone}
          onChangeText={setDraftPhone}
          autoFocus
        />
        <Button
          title="Enregistrer"
          onPress={savePhone}
          disabled={draftPhone.replace(/\D/g, '').length !== 8}
          style={styles.sheetCta}
        />
      </Sheet>

      {/* ── Centre d'aide ── */}
      <Sheet visible={helpSheet} onClose={() => setHelpSheet(false)} title="Centre d’aide">
        <ScrollView style={styles.faqList} showsVerticalScrollIndicator={false}>
          {FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i;
            return (
              <View key={item.question} style={[styles.faqItem, i < FAQ_ITEMS.length - 1 && styles.faqBorder]}>
                <TouchableOpacity style={styles.faqHeader} onPress={() => setOpenFaq(open ? null : i)} activeOpacity={0.6}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <ChevronDown
                    size={18}
                    color={colors.subtle}
                    style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {open && <Text style={styles.faqAnswer}>{item.answer}</Text>}
              </View>
            );
          })}
        </ScrollView>
        <Text style={styles.contactTitle}>Nous contacter</Text>
        <View style={styles.contactRow}>
          <Button title="Appeler" icon={PhoneCall} variant="secondary" size="sm" style={styles.flex} />
          <Button title="E-mail" icon={Mail} variant="secondary" size="sm" style={styles.flex} />
        </View>
      </Sheet>

      {/* ── Déconnexion ── */}
      <Sheet visible={logoutSheet} onClose={() => setLogoutSheet(false)} title="Se déconnecter ?">
        <Text style={styles.sheetText}>Vous devrez saisir à nouveau votre numéro et votre mot de passe.</Text>
        <Button title="Se déconnecter" variant="danger" onPress={logout} />
        <Button title="Annuler" variant="ghost" onPress={() => setLogoutSheet(false)} style={styles.sheetCancel} />
      </Sheet>
    </View>
  );
}

function Stat({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.stat} onPress={onPress} disabled={!onPress} activeOpacity={0.6}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  // Le bandeau occupe toute la largeur malgré le padding horizontal du ScrollView.
  hero: { marginHorizontal: -16 },

  identity: { alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: heroColors.accent },
  avatarFallback: { backgroundColor: heroColors.button, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: heroColors.accent },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, maxWidth: '90%' },
  name: { ...typography.title, fontSize: 22, color: heroColors.text, flexShrink: 1 },
  phone: { ...typography.callout, color: heroColors.textSoft, marginTop: 4 },
  editBtn: {
    marginTop: 16,
    height: 40,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    backgroundColor: heroColors.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
  },
  editBtnText: { ...typography.callout, fontWeight: '600', color: heroColors.text },

  stats: {
    marginTop: -STATS_OVERLAP,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.headline, fontSize: 18, fontWeight: '700', color: colors.ink },
  statLabel: { ...typography.caption, fontWeight: '400', color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.line },

  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.tint,
  },
  kycIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  kycText: { ...typography.footnote, color: colors.inkSoft, marginTop: 1 },
  kycAction: { ...typography.footnote, fontWeight: '700', color: colors.accent.deep },

  group: { marginTop: 24 },
  version: { ...typography.caption, fontWeight: '400', color: colors.subtle, textAlign: 'center', marginTop: 28 },

  sheetText: { ...typography.callout, color: colors.muted, marginBottom: 16 },
  sheetCta: { marginTop: 20 },
  sheetCancel: { marginTop: 8 },
  faqList: { maxHeight: 320 },
  faqItem: { paddingVertical: 14 },
  faqBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqQuestion: { flex: 1, ...typography.body, fontWeight: '500', color: colors.ink },
  faqAnswer: { ...typography.callout, color: colors.muted, marginTop: 8 },
  contactTitle: { ...typography.footnote, fontWeight: '600', color: colors.muted, marginTop: 16, marginBottom: 10 },
  contactRow: { flexDirection: 'row', gap: 10 },
});
