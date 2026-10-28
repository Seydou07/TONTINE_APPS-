import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Share } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, HeartHandshake, ShieldCheck, Check, EyeOff, Share2 } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { mockAidAppeal, mockAidContributions, PaymentMethod, ContributorVisibility } from '@venega/types';
import { Avatar, Button, Chip, IconButton, Sheet, SettingRow, TextField, Toggle } from '../../src/components/ui';
import { getAidAppeal, getAidShareLink, getCircle } from '../../src/features/circles/circleStore';
import OperatorPicker, { operatorLogos } from '../../src/features/circles/components/OperatorPicker';
import {
  PAYMENT_OPERATORS,
  PaymentConfirmSheet,
  operatorName,
  payButtonTitle,
  useUssdPayment,
} from '../../src/features/circles/components/PaymentFlow';

const PAGE_SIZE = 15;
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];
const COVER_HEIGHT = 220;

/** Libellé court de l'opérateur d'une contribution (l'énum de l'API garde encore MTN). */
const METHOD_LABEL: Partial<Record<PaymentMethod, string>> = {
  [PaymentMethod.ORANGE_MONEY]: 'Orange Money',
  [PaymentMethod.MOOV_MONEY]: 'Moov Money',
  [PaymentMethod.WAVE]: 'Wave',
};

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';
const formatShort = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

export default function AidAppealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();

  const circle = getCircle(params.id);
  const appeal = getAidAppeal(params.id) ?? mockAidAppeal;
  // Les contributions de démonstration n'existent que pour la cagnotte mockée.
  const contributions = appeal.id === mockAidAppeal.id ? mockAidContributions : [];

  const shareLink = () => {
    if (!circle) return;
    Share.share({
      message: `${circle.name}
Aidez en contribuant à cette cagnotte, avec votre nom ou anonymement :
${getAidShareLink(circle)}`,
    }).catch(() => {});
  };

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showContribute, setShowContribute] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [contributed, setContributed] = useState(false);
  const [contributionCount, setContributionCount] = useState(0);
  const [localCollected, setLocalCollected] = useState(0);

  // Formulaire de contribution (sans compte)
  const [anonymous, setAnonymous] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [contributorPhone, setContributorPhone] = useState('');
  const [quickAmount, setQuickAmount] = useState(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [operator, setOperator] = useState<string | null>(null);

  const amount = customAmount ? parseInt(customAmount, 10) || 0 : quickAmount;
  const phoneDigits = contributorPhone.replace(/\D/g, '');
  const canPay = amount > 0 && !!operator && phoneDigits.length >= 8;

  const { dial } = useUssdPayment(() => {
    setLocalCollected((prev) => prev + amount);
    setContributionCount((n) => n + 1);
    setContributed(true);
  });

  const goal = appeal.goalAmount;
  const collected = appeal.collectedAmount + localCollected;
  const progress = goal > 0 ? Math.min(collected / goal, 1) : 0;
  const percent = Math.round(progress * 100);
  const remaining = Math.max(goal - collected, 0);
  const isActive = appeal.status === 'ACTIVE';

  const visibleContributions = contributions.slice(0, visibleCount);
  const hasMore = visibleCount < contributions.length;
  const totalContributors = appeal.contributorCount + contributionCount;

  const daysLeft = appeal.deadline
    ? Math.max(Math.ceil((new Date(appeal.deadline).getTime() - Date.now()) / 86_400_000), 0)
    : null;

  const stats = [
    { value: String(totalContributors), label: totalContributors > 1 ? 'contributeurs' : 'contributeur' },
    { value: daysLeft === null ? '—' : String(daysLeft), label: daysLeft === 1 ? 'jour restant' : 'jours restants' },
    { value: formatShort(remaining), label: 'reste à collecter' },
  ];

  const openContribute = () => {
    setShowContribute(true);
  };

  const goToConfirm = () => {
    setShowContribute(false);
    setShowConfirm(true);
  };

  const confirmPayment = () => {
    if (!operator) return;
    setShowConfirm(false);
    dial(operator, amount);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={appeal.beneficiaryPhoto ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Couverture */}
          <View style={styles.cover}>
            {appeal.beneficiaryPhoto ? (
              <Image source={{ uri: appeal.beneficiaryPhoto }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <View style={styles.coverFallback}>
                <HeartHandshake size={64} color={colors.primary.DEFAULT} strokeWidth={1.5} />
              </View>
            )}
            <View style={[styles.coverActions, { top: insets.top + 8 }]}>
              <IconButton icon={ArrowLeft} accessibilityLabel="Retour" onPress={() => router.back()} style={styles.coverButton} />
              {circle ? (
                <IconButton icon={Share2} accessibilityLabel="Partager le lien" onPress={shareLink} style={styles.coverButton} />
              ) : null}
            </View>
          </View>

          <View style={styles.content}>
            {/* Titre */}
            <View style={[styles.statusPill, !isActive && styles.statusPillDone]}>
              <View style={[styles.statusDot, !isActive && styles.statusDotDone]} />
              <Text style={[styles.statusText, !isActive && styles.statusTextDone]}>
                {isActive ? 'En cours' : 'Terminée'}
              </Text>
            </View>
            <Text style={styles.title}>{circle?.name ?? 'Cagnotte d’aide'}</Text>
            <View style={styles.forRow}>
              <Avatar name={appeal.beneficiaryName} uri={appeal.beneficiaryPhoto} size={32} />
              <Text style={styles.forText}>
                Pour <Text style={styles.forName}>{appeal.beneficiaryName}</Text>
              </Text>
            </View>

            {/* Collecte */}
            <View style={styles.collectBlock}>
              <Text style={styles.collected}>{formatXOF(collected)}</Text>
              <Text style={styles.goal}>collectés sur {formatXOF(goal)}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.percent}>{percent} %</Text>
              </View>
              <View style={styles.statsRow}>
                {stats.map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <View style={styles.statDivider} />}
                    <View style={styles.statCol}>
                      <Text style={styles.statValue}>{s.value}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Paiement accepté */}
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Paiement accepté</Text>
              <View style={styles.logos}>
                {PAYMENT_OPERATORS.map((op) => (
                  <Image
                    key={op.id}
                    source={operatorLogos[op.id]}
                    style={styles.logo}
                    contentFit="contain"
                    accessibilityLabel={op.name}
                  />
                ))}
              </View>
            </View>

            <View style={styles.separator} />

            {/* Histoire */}
            <Text style={styles.sectionTitle}>L’histoire</Text>
            <Text style={styles.story}>{appeal.reason}</Text>

            <View style={styles.trust}>
              <ShieldCheck size={18} color={colors.primary.DEFAULT} strokeWidth={2} />
              <Text style={styles.trustText}>
                Les fonds sont conservés sur le compte sécurisé Venega et reversés à {appeal.beneficiaryName} uniquement
                après validation des approbateurs du cercle.
              </Text>
            </View>

            <View style={styles.separator} />

            {/* Contributeurs */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleInline}>Contributeurs</Text>
              <Text style={styles.sectionCount}>{totalContributors}</Text>
            </View>

            {contributions.length === 0 && (
              <Text style={styles.emptyContrib}>
                Aucune contribution pour l’instant. Partagez le lien pour lancer la collecte.
              </Text>
            )}
            {visibleContributions.map((c, idx) => {
              const isAnon = c.visibility === ContributorVisibility.ANONYMOUS;
              const name = isAnon ? 'Anonyme' : c.contributorName ?? 'Contributeur';
              return (
                <View key={c.id} style={[styles.contribRow, idx > 0 && styles.rowBorder]}>
                  {isAnon ? (
                    <View style={styles.anonAvatar}>
                      <EyeOff size={18} color={colors.muted} strokeWidth={1.8} />
                    </View>
                  ) : (
                    <Avatar name={name} size={40} />
                  )}
                  <View style={styles.flex}>
                    <Text style={styles.contribName} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.contribMeta}>
                      {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} ·{' '}
                      {METHOD_LABEL[c.paymentMethod] ?? 'Mobile Money'}
                    </Text>
                  </View>
                  <Text style={styles.contribAmount}>{formatShort(c.amount)}</Text>
                </View>
              );
            })}

            {hasMore && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.loadMore}
                accessibilityRole="button"
                onPress={() => setVisibleCount((v) => v + PAGE_SIZE)}
              >
                <Text style={styles.loadMoreText}>Voir plus</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Action principale */}
        <View style={styles.footer}>
          <Button title="Contribuer" icon={HeartHandshake} onPress={openContribute} disabled={!isActive} />
        </View>
      </SafeAreaView>

      {/* Contribution (sans compte) */}
      <Sheet visible={showContribute} onClose={() => setShowContribute(false)} title="Contribuer">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.sheetSub}>Pour {appeal.beneficiaryName}</Text>

          <Text style={styles.fieldLabel}>Montant</Text>
          <View style={styles.wrapRow}>
            {QUICK_AMOUNTS.map((a) => (
              <Chip
                key={a}
                label={formatShort(a)}
                selected={!customAmount && quickAmount === a}
                onPress={() => {
                  setCustomAmount('');
                  setQuickAmount(a);
                }}
              />
            ))}
          </View>
          <TextField
            placeholder="Autre montant"
            suffix="F CFA"
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={(t) => setCustomAmount(t.replace(/\D/g, ''))}
            containerStyle={styles.fieldTight}
          />

          <View style={styles.settingBox}>
            <SettingRow title="Rester anonyme" description="Votre nom n’apparaîtra pas dans la liste" last>
              <Toggle value={anonymous} onValueChange={setAnonymous} />
            </SettingRow>
          </View>

          {!anonymous && (
            <TextField
              label="Nom complet"
              placeholder="Votre nom complet"
              value={contributorName}
              onChangeText={setContributorName}
              containerStyle={styles.field}
            />
          )}
          <TextField
            label="Numéro Mobile Money"
            prefix="+226"
            placeholder="70 00 00 00"
            keyboardType="phone-pad"
            value={contributorPhone}
            onChangeText={setContributorPhone}
            containerStyle={styles.field}
          />

          <Text style={styles.fieldLabel}>Moyen de paiement</Text>
          <OperatorPicker operators={PAYMENT_OPERATORS} value={operator} onChange={setOperator} />

          <Button title={payButtonTitle(amount)} onPress={goToConfirm} disabled={!canPay} style={styles.sheetCta} />
        </ScrollView>
      </Sheet>

      <PaymentConfirmSheet
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmPayment}
        amount={amount}
        operatorId={operator}
        phone={`+226 ${contributorPhone.trim()}`}
        detail={`Contribution pour ${appeal.beneficiaryName}`}
      />

      {/* Remerciement */}
      <Sheet visible={contributed} onClose={() => setContributed(false)}>
        <View style={styles.successIcon}>
          <Check size={28} color={colors.primary.DEFAULT} strokeWidth={2.5} />
        </View>
        <Text style={styles.successTitle}>Merci pour votre générosité</Text>
        <Text style={styles.successSub}>
          Votre contribution de {formatXOF(amount)} pour {appeal.beneficiaryName} a été prise en compte. Vous recevrez
          un SMS de confirmation de {operatorName(operator)}.
        </Text>
        <Button title="Fermer" variant="secondary" onPress={() => setContributed(false)} style={styles.successCta} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },

  /* Couverture */
  cover: {
    height: COVER_HEIGHT,
    backgroundColor: colors.primary.tint,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  coverFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverActions: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverButton: { backgroundColor: colors.bg },

  content: { paddingHorizontal: 20, paddingTop: 20 },

  /* Titre */
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.tint,
  },
  statusPillDone: { backgroundColor: colors.fill },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary.DEFAULT },
  statusDotDone: { backgroundColor: colors.muted },
  statusText: { ...typography.caption, fontWeight: '600', color: colors.primary.dark },
  statusTextDone: { color: colors.muted },
  title: { ...typography.title, color: colors.ink, marginTop: 10 },
  forRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  forText: { flexShrink: 1, ...typography.body, color: colors.muted },
  forName: { fontWeight: '600', color: colors.ink },

  /* Collecte */
  collectBlock: {
    marginTop: 24,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  collected: { ...typography.display, color: colors.ink },
  goal: { ...typography.callout, color: colors.muted, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.fill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary.DEFAULT },
  percent: { ...typography.callout, fontWeight: '700', color: colors.primary.DEFAULT },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  statCol: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.line },
  statValue: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  statLabel: { ...typography.caption, fontWeight: '400', color: colors.muted, textAlign: 'center', marginTop: 2 },

  /* Paiement accepté */
  payRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 20 },
  payLabel: { flexShrink: 1, ...typography.callout, fontWeight: '600', color: colors.inkSoft },
  logos: { flexDirection: 'row', gap: 8 },
  logo: { width: 32, height: 32, borderRadius: 8 },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: 24 },

  /* Histoire */
  sectionTitle: { ...typography.headline, color: colors.ink, marginBottom: 8 },
  story: { ...typography.body, color: colors.inkSoft },
  trust: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary.tint,
  },
  trustText: { flex: 1, ...typography.footnote, color: colors.primary.dark },

  /* Contributeurs */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitleInline: { ...typography.headline, color: colors.ink },
  sectionCount: { ...typography.footnote, fontWeight: '600', color: colors.muted },
  emptyContrib: { ...typography.callout, color: colors.muted, paddingVertical: 16 },
  contribRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  anonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contribName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  contribMeta: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  contribAmount: { ...typography.callout, fontWeight: '700', color: colors.ink },
  loadMore: {
    minHeight: 48,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  loadMoreText: { ...typography.callout, fontWeight: '600', color: colors.primary.DEFAULT },

  /* Pied */
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  /* Feuille de contribution */
  sheetSub: { ...typography.footnote, color: colors.muted, marginTop: -6 },
  settingBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  field: { marginTop: 16 },
  fieldTight: { marginTop: 10 },
  fieldLabel: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft, marginTop: 20, marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetCta: { marginTop: 24 },

  /* Remerciement */
  successIcon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  successTitle: { ...typography.headline, color: colors.ink, textAlign: 'center', marginTop: 14 },
  successSub: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 6 },
  successCta: { marginTop: 24 },
});
