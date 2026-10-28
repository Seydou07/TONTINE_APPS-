import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  HeartHandshake,
  CalendarDays,
  Users,
  ShieldCheck,
  Check,
  Wallet,
  EyeOff,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import {
  mockAidAppeal,
  mockAidContributions,
  PaymentMethod,
  ContributorVisibility,
} from '@venega/types';
import { Button, Chip, IconButton, Sheet, SettingRow, TextField, Toggle } from '../../src/components/ui';

const PAGE_SIZE = 15;
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

const OPERATORS = [
  { id: PaymentMethod.ORANGE_MONEY, name: 'Orange Money', color: '#FF7900', short: 'OM' },
  { id: PaymentMethod.MOOV_MONEY, name: 'Moov Money', color: '#005CA9', short: 'Moov' },
  { id: PaymentMethod.WAVE, name: 'Wave', color: '#1DC3F6', short: 'Wave' },
  { id: PaymentMethod.MTN_MOBILE_MONEY, name: 'MTN MoMo', color: '#FFCC00', short: 'MTN' },
];

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

export default function AidAppealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const appeal = mockAidAppeal;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showContribute, setShowContribute] = useState(false);
  const [contributed, setContributed] = useState(false);
  const [localCollected, setLocalCollected] = useState(0);

  // Formulaire de contribution (sans compte)
  const [anonymous, setAnonymous] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [contributorPhone, setContributorPhone] = useState('');
  const [amount, setAmount] = useState(2000);
  const [operator, setOperator] = useState<PaymentMethod>(PaymentMethod.ORANGE_MONEY);

  const goal = appeal.goalAmount;
  const collected = appeal.collectedAmount + localCollected;
  const progress = Math.min(collected / goal, 1);
  const remaining = Math.max(goal - collected, 0);

  const visibleContributions = mockAidContributions.slice(0, visibleCount);
  const hasMore = visibleCount < mockAidContributions.length;
  const totalContributors = appeal.contributorCount + (contributed ? 1 : 0);

  const deadlineLabel = appeal.deadline
    ? new Date(appeal.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  const handleContribute = () => {
    setShowContribute(false);
    setContributed(true);
    setLocalCollected((prev) => prev + amount);
  };

  const amountDisplay = (n: number) =>
    new Intl.NumberFormat('fr-FR').format(n) + ' F';

  const stats = [
    { icon: Users, value: String(totalContributors), label: 'Contributeurs' },
    { icon: Wallet, value: amountDisplay(appeal.collectedAmount), label: 'Déjà collecté' },
    { icon: CalendarDays, value: deadlineLabel || '—', label: 'Date limite' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* En-tête */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Appel à l'aide
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Bénéficiaire */}
          <View style={styles.beneficiaryRow}>
            <Image source={{ uri: appeal.beneficiaryPhoto }} style={styles.avatar} contentFit="cover" />
            <View style={styles.beneficiaryInfo}>
              <Text style={styles.beneficiaryName}>{appeal.beneficiaryName}</Text>
              <Text style={styles.beneficiaryMeta}>Bénéficiaire · {appeal.beneficiaryNumber}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>En cours</Text>
            </View>
          </View>

          <Text style={styles.reasonText}>{appeal.reason}</Text>

          {/* Cagnotte */}
          <View style={styles.potCard}>
            <Text style={styles.potLabel}>Collecté</Text>
            <Text style={styles.potAmount}>{formatXOF(collected)}</Text>
            <Text style={styles.potGoal}>sur un objectif de {formatXOF(goal)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.potFootText}>{Math.round(progress * 100)}% atteint</Text>
              <Text style={styles.potFootText}>
                {remaining > 0 ? `Reste ${formatXOF(remaining)}` : 'Objectif atteint'}
              </Text>
            </View>
          </View>

          {/* Chiffres */}
          <View style={styles.statsCard}>
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <React.Fragment key={s.label}>
                  {i > 0 && <View style={styles.statDivider} />}
                  <View style={styles.statCol}>
                    <Icon size={18} color={colors.muted} strokeWidth={1.8} />
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                </React.Fragment>
              );
            })}
          </View>

          {/* Confiance */}
          <View style={styles.trustCard}>
            <ShieldCheck size={18} color={colors.primary.DEFAULT} />
            <Text style={styles.trustText}>
              Collecte vérifiée : les fonds sont bloqués sur le compte sécurisé Venega et reversés uniquement au
              bénéficiaire après vérification.
            </Text>
          </View>

          {/* Contributeurs */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contributeurs récents</Text>
            <Text style={styles.sectionCount}>{appeal.contributorCount}+</Text>
          </View>

          <View style={styles.card}>
            {visibleContributions.map((c, idx) => {
              const op = OPERATORS.find((o) => o.id === c.paymentMethod);
              const isAnon = c.visibility === ContributorVisibility.ANONYMOUS;
              return (
                <View key={c.id} style={styles.contribRow}>
                  <View style={styles.contribAvatar}>
                    {isAnon ? (
                      <EyeOff size={16} color={colors.muted} />
                    ) : (
                      <Text style={styles.contribInitial}>{(c.contributorName ?? '?').charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={[styles.contribBody, idx < visibleContributions.length - 1 && styles.rowBorder]}>
                    <View style={styles.flex}>
                      <Text style={styles.contribName} numberOfLines={1}>
                        {isAnon ? 'Anonyme' : c.contributorName}
                      </Text>
                      <Text style={styles.contribMeta} numberOfLines={1}>
                        {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} ·{' '}
                        {op?.short ?? 'Mobile Money'}
                      </Text>
                    </View>
                    <Text style={styles.contribAmount}>+{amountDisplay(c.amount)}</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.listFooter}>
              {hasMore ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.loadMore}
                  accessibilityRole="button"
                  onPress={() => setVisibleCount((v) => v + PAGE_SIZE)}
                >
                  <Text style={styles.loadMoreText}>
                    Charger plus ({mockAidContributions.length - visibleCount} autres)
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.listEndText}>Toutes les contributions sont affichées</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerTitle} numberOfLines={1}>
              Soutenez {appeal.beneficiaryName.split(' ')[0]}
            </Text>
            <Text style={styles.footerSub}>À partir de {amountDisplay(500)}</Text>
          </View>
          <Button title="Contribuer" icon={HeartHandshake} onPress={() => setShowContribute(true)} />
        </View>
      </SafeAreaView>

      {/* Contribution (sans compte) */}
      <Sheet visible={showContribute} onClose={() => setShowContribute(false)} title="Contribuer à la collecte">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.sheetSub}>
            Pour {appeal.beneficiaryName} · {appeal.beneficiaryNumber}
          </Text>

          <View style={styles.settingBox}>
            <SettingRow title="Rester anonyme" description="Votre nom n'apparaîtra pas dans la liste" last>
              <Toggle value={anonymous} onValueChange={setAnonymous} />
            </SettingRow>
          </View>

          {!anonymous && (
            <>
              <TextField
                label="Nom complet"
                placeholder="Votre nom complet"
                value={contributorName}
                onChangeText={setContributorName}
                containerStyle={styles.field}
              />
              <TextField
                label="Numéro de téléphone"
                prefix="+226"
                placeholder="Facultatif"
                keyboardType="phone-pad"
                value={contributorPhone}
                onChangeText={setContributorPhone}
                containerStyle={styles.field}
              />
            </>
          )}

          <Text style={styles.fieldLabel}>Montant de votre contribution</Text>
          <View style={styles.wrapRow}>
            {QUICK_AMOUNTS.map((a) => (
              <Chip key={a} label={amountDisplay(a)} selected={amount === a} onPress={() => setAmount(a)} />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Moyen de paiement</Text>
          <View style={styles.operatorGrid}>
            {OPERATORS.map((op) => {
              const selected = operator === op.id;
              return (
                <TouchableOpacity
                  key={op.id}
                  style={[styles.operator, selected && styles.operatorSelected]}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setOperator(op.id)}
                >
                  <View style={[styles.operatorDot, { backgroundColor: op.color }]} />
                  <Text style={[styles.operatorText, selected && styles.operatorTextSelected]} numberOfLines={1}>
                    {op.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title={`Donner ${amountDisplay(amount)}`}
            icon={HeartHandshake}
            onPress={handleContribute}
            style={styles.sheetCta}
          />
        </ScrollView>
      </Sheet>

      {/* Confirmation */}
      <Sheet visible={contributed} onClose={() => setContributed(false)}>
        <View style={styles.successIcon}>
          <Check size={28} color={colors.primary.DEFAULT} strokeWidth={2.5} />
        </View>
        <Text style={styles.successTitle}>Merci pour votre générosité</Text>
        <Text style={styles.successSub}>
          Votre contribution de {amountDisplay(amount)} est en attente de validation. Un message sera envoyé au numéro
          indiqué pour confirmer le paiement.
        </Text>
        <View style={styles.recap}>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Bénéficiaire</Text>
            <Text style={styles.recapValue}>{appeal.beneficiaryName}</Text>
          </View>
          <View style={[styles.recapRow, styles.recapBorder]}>
            <Text style={styles.recapLabel}>Moyen de paiement</Text>
            <Text style={styles.recapValue}>{OPERATORS.find((o) => o.id === operator)?.name}</Text>
          </View>
          <View style={[styles.recapRow, styles.recapBorder]}>
            <Text style={styles.recapLabel}>Référence</Text>
            <Text style={styles.recapValue}>TX-{Math.floor(100000 + Math.random() * 900000)}</Text>
          </View>
        </View>
        <Button title="Fermer" variant="secondary" onPress={() => setContributed(false)} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSpacer: { width: 40 },

  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },

  beneficiaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.fill },
  beneficiaryInfo: { flex: 1 },
  beneficiaryName: { ...typography.headline, color: colors.ink },
  beneficiaryMeta: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent.tint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent.DEFAULT },
  liveBadgeText: { ...typography.caption, fontWeight: '600', color: colors.accent.deep },
  reasonText: { ...typography.body, color: colors.inkSoft, marginTop: 16 },

  potCard: {
    marginTop: 20,
    backgroundColor: colors.primary.dark,
    borderRadius: 24,
    padding: 20,
  },
  potLabel: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8 },
  potAmount: { ...typography.title, color: '#FFFFFF', marginTop: 4 },
  potGoal: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8, marginTop: 2 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent.DEFAULT },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  potFootText: { ...typography.caption, color: '#FFFFFF', opacity: 0.85, flexShrink: 1 },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
  },
  statCol: { flex: 1, alignItems: 'center', paddingHorizontal: 6, gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.line },
  statValue: { ...typography.callout, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  statLabel: { ...typography.caption, fontWeight: '400', color: colors.muted, textAlign: 'center' },

  trustCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    backgroundColor: colors.primary.tint,
    borderRadius: radius.md,
    padding: 14,
  },
  trustText: { flex: 1, ...typography.footnote, color: colors.primary.dark },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 10,
  },
  sectionTitle: { ...typography.headline, color: colors.ink },
  sectionCount: { ...typography.footnote, fontWeight: '600', color: colors.muted },

  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  contribRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 12 },
  contribAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contribInitial: { ...typography.callout, fontWeight: '700', color: colors.inkSoft },
  contribBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingRight: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  contribName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  contribMeta: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  contribAmount: { ...typography.callout, fontWeight: '700', color: colors.primary.DEFAULT },
  listFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    alignItems: 'center',
  },
  loadMore: { minHeight: 48, justifyContent: 'center', alignSelf: 'stretch', alignItems: 'center' },
  loadMoreText: { ...typography.callout, fontWeight: '600', color: colors.primary.DEFAULT },
  listEndText: { ...typography.footnote, color: colors.subtle, paddingVertical: 14 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  footerInfo: { flex: 1 },
  footerTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  footerSub: { ...typography.footnote, color: colors.muted, marginTop: 2 },

  /* Feuille de contribution */
  sheetSub: { ...typography.footnote, color: colors.muted, marginTop: -6, marginBottom: 16 },
  settingBox: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  field: { marginTop: 20 },
  fieldLabel: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft, marginTop: 20, marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  operatorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  operator: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
  },
  operatorSelected: { borderColor: colors.primary.DEFAULT, borderWidth: 1.5, backgroundColor: colors.primary.tint },
  operatorDot: { width: 10, height: 10, borderRadius: 5 },
  operatorText: { flex: 1, ...typography.callout, color: colors.inkSoft },
  operatorTextSelected: { fontWeight: '600', color: colors.primary.dark },
  sheetCta: { marginTop: 24 },

  /* Confirmation */
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
  recap: {
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 12 },
  recapBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  recapLabel: { ...typography.footnote, color: colors.muted },
  recapValue: { ...typography.callout, fontWeight: '600', color: colors.ink, flexShrink: 1, textAlign: 'right' },
});
