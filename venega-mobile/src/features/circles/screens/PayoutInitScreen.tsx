import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, Check, Phone, Loader, CheckCircle2, History, Bell } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { getCircle, getCircles, getActiveCycle, getCycles } from '../circleStore';
import { mockMemberships, mockPayoutRecords } from '@venega/types';
import type { PayoutRecord } from '@venega/types';
import { Button, IconButton, Sheet } from '../../../components/ui';
import OperatorPicker, { UssdCodeBox } from '../components/OperatorPicker';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money' },
  { id: 'MOOV', name: 'Moov Money' },
  { id: 'WAVE', name: 'Wave' },
];

export default function PayoutInitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circle.id);
  const orderedMembers = [...memberships].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  // Modèle financier (défini à la création du cercle)
  const baseTontineAmount = circle.tontineAmount || 10000;
  const founderManagementFeePerTurn = circle.managementFee || 500;
  const memberCount = orderedMembers.length;

  const totalGrossCollected = (baseTontineAmount + founderManagementFeePerTurn) * memberCount;
  const beneficiaryPotAmount = baseTontineAmount * memberCount;
  const totalFounderFeesCollected = founderManagementFeePerTurn * memberCount;
  const venegaCommission = Math.round(totalFounderFeesCollected * 0.1);
  const netFounderFees = totalFounderFeesCollected - venegaCommission;

  const scrollRef = useRef<ScrollView>(null);

  const [selectedOperator, setSelectedOperator] = useState('ORANGE');
  const [copied, setCopied] = useState(false);
  const [ussdModal, setUssdModal] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [ussdCode, setUssdCode] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const [history, setHistory] = useState<PayoutRecord[]>(() =>
    mockPayoutRecords
      .filter((p) => p.circleId === circle.id && p.status === 'PAID')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  const buildUssd = (op: string) =>
    `*${op === 'MOOV' ? '802' : op === 'WAVE' ? '888' : '800'}*${beneficiaryPotAmount}*${Math.floor(100 + Math.random() * 900)}#`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(ussdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInitiate = () => {
    setRefNumber(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    setUssdCode(buildUssd(selectedOperator));
    setUssdModal(true);
  };

  const handleExecuteUssd = () => {
    Linking.openURL(`tel:${ussdCode.replace(/#$/, '%23')}`).catch(() => {
      Alert.alert('Code USSD', ussdCode);
    });
    // Système déjà armé : Venega détecte automatiquement le paiement exécuté
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      setUssdModal(false);
      const now = new Date();
      const newRecord: PayoutRecord = {
        id: `p${Date.now()}`,
        circleId: circle.id,
        cycleId: cycle?.id ?? 'cy1',
        beneficiaryName: `${beneficiary?.user?.firstName ?? ''} ${beneficiary?.user?.lastName ?? ''}`.trim(),
        beneficiaryAvatar: beneficiary?.user?.avatarUrl,
        totalAmount: totalGrossCollected,
        beneficiaryAmount: beneficiaryPotAmount,
        founderFees: netFounderFees,
        venegaCommission,
        operator: OPERATORS.find((o) => o.id === selectedOperator)?.name ?? 'Orange Money',
        status: 'PAID',
        createdAt: now.toISOString(),
      };
      setHistory((h) => [newRecord, ...h]);
      setShowNotification(true);
    }, 6000);
  };

  const handleViewHistory = () => {
    setShowNotification(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' à ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const operatorName = OPERATORS.find((o) => o.id === selectedOperator)?.name;
  const beneficiaryName = `${beneficiary?.user?.firstName ?? ''} ${beneficiary?.user?.lastName ?? ''}`.trim();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* En-tête */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>Verser la cagnotte</Text>
            <Text style={styles.headerSub} numberOfLines={1}>Compte hub Venega · CityNet Pay</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Bénéficiaire */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Image source={{ uri: beneficiary?.user?.avatarUrl }} style={styles.heroAvatar} contentFit="cover" />
              <View style={styles.flex}>
                <Text style={styles.heroLabel}>Bénéficiaire · Tour {cycle?.currentTurn ?? 1}</Text>
                <Text style={styles.heroName}>{beneficiaryName}</Text>
                <Text style={styles.heroPhone}>+226 70 12 34 56 · Mobile Money</Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <Text style={styles.heroLabel}>Somme à verser</Text>
            <Text style={styles.heroAmount}>{formatXOF(beneficiaryPotAmount)}</Text>
          </View>

          {/* Détails de la transaction */}
          <View style={styles.card}>
            <Row label="Total collecté" value={formatXOF(totalGrossCollected)} />
            <Row label="Frais fondateur" value={formatXOF(netFounderFees)} />
            <Row label="Commission Venega" value={formatXOF(venegaCommission)} />
            <Row label="Somme à verser" value={formatXOF(beneficiaryPotAmount)} strong last />
          </View>

          {/* Opérateur */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opérateur de versement</Text>
            <Text style={styles.sectionHint}>Choisissez l'opérateur qui exécutera le paiement.</Text>
            <OperatorPicker operators={OPERATORS} value={selectedOperator} onChange={setSelectedOperator} />
          </View>

          {/* Historique des versements (seulement les payés) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique des versements</Text>
            {history.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <History size={24} color={colors.subtle} />
                </View>
                <Text style={styles.emptyTitle}>Aucun versement</Text>
                <Text style={styles.emptyText}>Les versements payés apparaîtront ici.</Text>
              </View>
            ) : (
              <View style={[styles.card, styles.historyCard]}>
                {history.map((p: PayoutRecord, idx: number) => (
                  <View key={p.id} style={[styles.historyRow, idx < history.length - 1 && styles.rowBorder]}>
                    <Image source={{ uri: p.beneficiaryAvatar }} style={styles.historyAvatar} contentFit="cover" />
                    <View style={styles.flex}>
                      <Text style={styles.historyName} numberOfLines={1}>{p.beneficiaryName}</Text>
                      <Text style={styles.historyMeta}>
                        {formatDate(p.createdAt)} · {p.operator}
                      </Text>
                      <Text style={styles.historyRef}>Réf. TX-{p.id.toUpperCase().slice(1)}</Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyAmount}>−{formatXOF(p.beneficiaryAmount)}</Text>
                      <View style={styles.paidTag}>
                        <CheckCircle2 size={12} color={colors.primary.DEFAULT} />
                        <Text style={styles.paidTagText}>Payé</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Initier le paiement" icon={Phone} onPress={handleInitiate} />
        </View>
      </SafeAreaView>

      {/* Code USSD : copier ou exécuter (pas de bouton « J'ai effectué ») */}
      <Sheet visible={ussdModal} onClose={() => setUssdModal(false)} title="Code USSD à exécuter">
        <Text style={styles.sheetSub}>{operatorName} · Compte hub Venega</Text>
        <View style={styles.sheetBlock}>
          <UssdCodeBox code={ussdCode} />
        </View>

        {!detecting ? (
          <View style={styles.sheetActions}>
            <Button
              title={copied ? 'Copié' : 'Copier le code'}
              icon={copied ? Check : Copy}
              variant="secondary"
              onPress={handleCopyCode}
            />
            <Button title="Exécuter le code USSD" icon={Phone} onPress={handleExecuteUssd} />
          </View>
        ) : (
          <View style={styles.detecting}>
            <Loader size={22} color={colors.primary.DEFAULT} />
            <Text style={styles.detectingTitle}>Détection automatique du paiement…</Text>
            <Text style={styles.detectingText}>
              Le système a vu votre paiement de {formatXOF(beneficiaryPotAmount)}. Venega vous enverra la notification
              dès que la transaction est validée.
            </Text>
          </View>
        )}
      </Sheet>

      {/* Notification Venega : versement détecté automatiquement */}
      <Sheet visible={showNotification} onClose={() => setShowNotification(false)}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.notifHead}>
            <View style={styles.bellCircle}>
              <Bell size={24} color={colors.accent.deep} />
            </View>
            <Text style={styles.notifTag}>Notification Venega</Text>
            <Text style={styles.notifTitle}>Versement effectué</Text>
          </View>

          <View style={styles.paidNotice}>
            <CheckLine>
              Vous avez versé {formatXOF(beneficiaryPotAmount)} à {beneficiaryName}.
            </CheckLine>
            <CheckLine>Vous avez reçu {formatXOF(netFounderFees)} (frais fondateur) sur votre compte.</CheckLine>
          </View>

          <View style={[styles.card, styles.sheetBlock]}>
            <Row label="Bénéficiaire" value={beneficiaryName} />
            <Row label="Somme versée" value={formatXOF(beneficiaryPotAmount)} strong />
            <Row label="Reçu (fondateur)" value={formatXOF(netFounderFees)} />
            <Row label="Commission Venega" value={formatXOF(venegaCommission)} />
            <Row label="Opérateur" value={operatorName ?? '—'} />
            <Row label="Référence" value={refNumber} />
            <Row label="Date" value={formatDate(new Date().toISOString())} last />
          </View>

          <View style={styles.sheetActions}>
            <Button title="Voir l'historique complet" icon={History} onPress={handleViewHistory} />
            <Button title="Fermer" variant="secondary" onPress={() => setShowNotification(false)} />
          </View>
        </ScrollView>
      </Sheet>
    </View>
  );
}

function Row({ label, value, strong, last }: { label: string; value: string; strong?: boolean; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={[styles.rowLabel, strong && styles.rowLabelStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

/** Ligne de confirmation précédée d'une coche Lucide. */
function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.checkLine}>
      <View style={styles.checkIcon}>
        <Check size={12} color="#FFFFFF" strokeWidth={3} />
      </View>
      <Text style={styles.checkText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  /* En-tête */
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSub: { ...typography.caption, fontWeight: '400', color: colors.muted, textAlign: 'center' },
  headerSpacer: { width: 40 },

  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  section: { marginTop: 28 },
  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 12 },
  sectionHint: { ...typography.footnote, color: colors.muted, marginTop: -8, marginBottom: 12 },

  /* Carte bénéficiaire (verte unie) */
  heroCard: { borderRadius: 24, backgroundColor: colors.primary.dark, padding: 20, marginBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary.DEFAULT },
  heroLabel: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8 },
  heroName: { ...typography.headline, color: '#FFFFFF', marginTop: 1 },
  heroPhone: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8, marginTop: 1 },
  heroDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#FFFFFF', opacity: 0.25, marginVertical: 16 },
  heroAmount: { ...typography.display, color: '#FFFFFF', marginTop: 2 },

  /* Cartes et lignes */
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLabel: { ...typography.callout, color: colors.muted },
  rowLabelStrong: { fontWeight: '600', color: colors.ink },
  rowValue: { flexShrink: 1, ...typography.callout, fontWeight: '500', color: colors.ink, textAlign: 'right' },
  rowValueStrong: { ...typography.bodyStrong, fontWeight: '700', color: colors.primary.dark },

  /* Historique */
  historyCard: { paddingHorizontal: 0 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  historyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.fill },
  historyName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  historyMeta: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  historyRef: { ...typography.caption, fontWeight: '400', color: colors.subtle, marginTop: 1 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { ...typography.callout, fontWeight: '600', color: colors.ink },
  paidTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  paidTagText: { ...typography.caption, fontWeight: '600', color: colors.primary.dark },
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: { ...typography.headline, color: colors.ink },
  emptyText: { ...typography.callout, color: colors.muted, marginTop: 4, textAlign: 'center' },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  /* Feuilles */
  sheetSub: { ...typography.footnote, color: colors.muted, marginTop: -6 },
  sheetBlock: { marginTop: 16 },
  sheetActions: { gap: 10, marginTop: 20 },
  detecting: { alignItems: 'center', gap: 8, paddingTop: 20, paddingBottom: 8 },
  detectingTitle: { ...typography.bodyStrong, color: colors.ink, textAlign: 'center' },
  detectingText: { ...typography.footnote, color: colors.muted, textAlign: 'center' },

  notifHead: { alignItems: 'center', marginBottom: 16 },
  bellCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  notifTag: { ...typography.caption, color: colors.accent.deep },
  notifTitle: { ...typography.title, color: colors.ink, marginTop: 2, textAlign: 'center' },
  paidNotice: { gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.primary.tint },
  checkLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 1,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { flex: 1, ...typography.footnote, fontWeight: '500', color: colors.ink },
});
