import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { getCircle, updateCircle } from '../circleStore';
import { KycRequirement, ReplacementRule } from '@venega/types';
import type { Circle } from '@venega/types';
import { Button, Chip, IconButton, OptionCard, SettingRow, TextField, Toggle } from '../../../components/ui';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const frequencies = [
  { key: 'DAILY', label: 'Journalier' },
  { key: 'WEEKLY', label: 'Hebdomadaire' },
  { key: 'BIWEEKLY', label: 'Bi-mensuel' },
  { key: 'MONTHLY', label: 'Mensuel' },
] as const;

const kycOptions = [
  { key: 'REQUIRE_NONE', label: 'Aucun document', desc: 'Aucun justificatif demandé' },
  { key: 'REQUIRE_CNIB', label: 'CNIB obligatoire', desc: 'Pièce d\'identité recto/verso' },
  { key: 'REQUIRE_CNIB_SELFIE', label: 'CNIB + Selfie', desc: 'Vérification faciale complète' },
] as const;

const leavingOptions = [
  {
    key: ReplacementRule.PAY_PAST_TURNS,
    label: 'Rachat des tours passés',
    desc: 'Le nouvel entrant paie les cotisations des tours déjà effectués',
  },
  {
    key: ReplacementRule.REDUCED_POT,
    label: 'Réajuster la cagnotte',
    desc: 'Sans remplaçant : la cagnotte s\'ajuste au nombre de membres restants',
  },
  {
    key: ReplacementRule.NONE,
    label: 'Sans remplacement',
    desc: 'La cagnotte est simplement réajustée',
  },
] as const;

const exclusionOptions = ['2', '3', '4', '5'];

export default function EditCircleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const [circle] = useState<Circle | undefined>(() => getCircle(circleId));

  const [name, setName] = useState(circle?.name ?? '');
  const [frequency, setFrequency] = useState<string>(circle?.frequency ?? 'MONTHLY');
  const [maxMembers, setMaxMembers] = useState(String(circle?.maxMembers ?? 10));
  const [tontineAmount, setTontineAmount] = useState(String(circle?.tontineAmount ?? 0));
  const [solidarityAmount, setSolidarityAmount] = useState(String(circle?.solidarityAmount ?? 0));
  const [managementFee, setManagementFee] = useState(String(circle?.managementFee ?? 0));
  const [depositRequired, setDepositRequired] = useState(circle?.depositRequired ?? false);
  const [kycRequirement, setKycRequirement] = useState<string>(
    circle?.rules?.kycRequirement ?? KycRequirement.NONE
  );
  const [leavingRule, setLeavingRule] = useState<ReplacementRule>(
    circle?.rules?.replacementRule ?? ReplacementRule.PAY_PAST_TURNS
  );
  const [exclusionThreshold, setExclusionThreshold] = useState(String(circle?.exclusionThreshold ?? 3));
  const [conditions, setConditions] = useState(circle?.conditions ?? '');
  const [inviteCode, setInviteCode] = useState(circle?.inviteCode ?? '');

  if (!circle) {
    router.back();
    return null;
  }

  const regenerateCode = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    setInviteCode(prefix + suffix);
  };

  const handleSave = () => {
    updateCircle(circle.id, {
      name: name.trim(),
      frequency: frequency as Circle['frequency'],
      maxMembers: parseInt(maxMembers, 10) || 10,
      tontineAmount: parseFloat(tontineAmount) || 0,
      solidarityAmount: parseFloat(solidarityAmount) || 0,
      managementFee: parseFloat(managementFee) || 0,
      depositRequired,
      rules: {
        ...circle.rules,
        kycRequirement: kycRequirement as KycRequirement,
        replacementRule: leavingRule,
      },
      exclusionThreshold: parseInt(exclusionThreshold, 10) || 3,
      conditions: conditions.trim(),
      inviteCode: inviteCode || circle.inviteCode,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Modifier le cercle
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.intro}>Les modifications s'appliquent immédiatement.</Text>

            {/* 1. Informations générales */}
            <Text style={styles.sectionTitle}>Informations générales</Text>
            <View style={styles.fields}>
              <TextField label="Nom du cercle" value={name} onChangeText={setName} placeholder="Nom du cercle" />
              <View>
                <Text style={styles.fieldLabel}>Fréquence des cotisations</Text>
                <View style={styles.chips}>
                  {frequencies.map((f) => (
                    <Chip key={f.key} label={f.label} selected={frequency === f.key} onPress={() => setFrequency(f.key)} />
                  ))}
                </View>
              </View>
              <TextField
                label="Nombre maximum de membres"
                value={maxMembers}
                onChangeText={setMaxMembers}
                keyboardType="numeric"
                placeholder="Ex. 10"
              />
            </View>

            {/* 2. Montants */}
            <Text style={[styles.sectionTitle, styles.section]}>Montants</Text>
            <View style={styles.fields}>
              <TextField
                label="Cotisation tontine (par tour)"
                value={tontineAmount}
                onChangeText={setTontineAmount}
                keyboardType="numeric"
                suffix="F CFA"
                placeholder="Ex. 10000"
              />
              <TextField
                label="Cotisation solidarité"
                value={solidarityAmount}
                onChangeText={setSolidarityAmount}
                keyboardType="numeric"
                suffix="F CFA"
                placeholder="Ex. 2000"
              />
              <TextField
                label="Frais de gestion du fondateur (par tour)"
                value={managementFee}
                onChangeText={setManagementFee}
                keyboardType="numeric"
                suffix="F CFA"
                placeholder="Ex. 500"
              />
            </View>

            {/* 3. Adhésion et remplacement */}
            <Text style={[styles.sectionTitle, styles.section]}>Adhésion et remplacement</Text>
            <Text style={styles.fieldLabel}>Documents exigés des nouveaux membres</Text>
            <View style={styles.stack}>
              {kycOptions.map((opt) => (
                <OptionCard
                  key={opt.key}
                  title={opt.label}
                  description={opt.desc}
                  selected={kycRequirement === opt.key}
                  onPress={() => setKycRequirement(opt.key)}
                />
              ))}
            </View>

            <Text style={[styles.fieldLabel, styles.subSection]}>Si un membre quitte le cercle</Text>
            <View style={styles.stack}>
              {leavingOptions.map((opt) => (
                <OptionCard
                  key={opt.key}
                  title={opt.label}
                  description={opt.desc}
                  selected={leavingRule === opt.key}
                  onPress={() => setLeavingRule(opt.key)}
                />
              ))}
            </View>
            {leavingRule !== ReplacementRule.PAY_PAST_TURNS && (
              <View style={[styles.notice, styles.noticeWarn]}>
                <AlertTriangle size={18} color={colors.accent.deep} />
                <Text style={styles.noticeText}>
                  Sans rachat des tours passés, les nouveaux membres n'auront pas de frais à payer pour adhérer.
                </Text>
              </View>
            )}

            <Text style={[styles.fieldLabel, styles.subSection]}>Retards tolérés avant exclusion</Text>
            <View style={styles.chips}>
              {exclusionOptions.map((opt) => (
                <Chip
                  key={opt}
                  label={`${opt} retards`}
                  selected={exclusionThreshold === opt}
                  onPress={() => setExclusionThreshold(opt)}
                />
              ))}
            </View>

            <View style={[styles.group, styles.subSection]}>
              <SettingRow
                title="Dépôt de garantie obligatoire"
                description="Un tour de cotisation déposé d'avance (cercle en cours)"
                last
              >
                <Toggle value={depositRequired} onValueChange={setDepositRequired} />
              </SettingRow>
            </View>

            {/* 4. Règlement */}
            <Text style={[styles.sectionTitle, styles.section]}>Règlement du cercle</Text>
            <TextField
              label="Conditions d'adhésion"
              value={conditions}
              onChangeText={setConditions}
              placeholder="Ex. Cotisation le 1er de chaque mois avant 18 h…"
              multiline
              hint="Lues et acceptées par chaque nouveau membre."
            />

            {/* 5. Code d'invitation */}
            <Text style={[styles.sectionTitle, styles.section]}>Code d'invitation</Text>
            <View style={styles.inviteCard}>
              <View style={styles.inviteText}>
                <Text style={styles.inviteCode}>{inviteCode}</Text>
                <Text style={styles.inviteHint}>Les nouveaux membres l'utilisent pour vous rejoindre</Text>
              </View>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={regenerateCode}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Générer un nouveau code"
              >
                <RefreshCw size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.regenerateText}>Générer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notice}>
              <ShieldCheck size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.noticeText}>
                Le fondateur ne touche jamais les fonds : toutes les sommes versées (cotisations, rachat, dépôt) vont
                directement dans le compte du cercle.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Enregistrer les modifications" onPress={handleSave} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSpacer: { width: 40 },

  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  intro: { ...typography.callout, color: colors.muted, marginBottom: 20 },

  section: { marginTop: 32 },
  subSection: { marginTop: 24 },
  sectionTitle: { ...typography.headline, color: colors.ink, marginBottom: 16 },
  fieldLabel: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft, marginBottom: 10 },
  fields: { gap: 20 },
  stack: { gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
  },

  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  inviteText: { flex: 1 },
  inviteCode: { ...typography.headline, fontWeight: '700', color: colors.ink, letterSpacing: 2 },
  inviteHint: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.tint,
  },
  regenerateText: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT },

  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    marginTop: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primary.tint,
  },
  noticeWarn: { backgroundColor: colors.accent.tint },
  noticeText: { flex: 1, ...typography.footnote, color: colors.inkSoft },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
});
