import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Check,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCircle, updateCircle } from '../circleStore';
import { KycRequirement, ReplacementRule } from '@venega/types';
import type { Circle } from '@venega/types';

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
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Modifier le cercle</Text>
            <View style={styles.spacer} />
          </View>
          <Text style={styles.headerSub}>Les modifications s'appliquent immédiatement</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.bodySheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. Informations générales */}
            <Text style={styles.sectionLabel}>Informations générales</Text>
            <Text style={styles.fieldLabel}>Nom du cercle *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom du cercle" placeholderTextColor="#94A3B8" />

            <Text style={styles.fieldLabel}>Fréquence des cotisations</Text>
            <View style={styles.pillsRow}>
              {frequencies.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.pill, frequency === f.key && styles.pillActive]}
                  onPress={() => setFrequency(f.key)}
                >
                  <Text style={[styles.pillText, frequency === f.key && styles.pillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Nombre maximum de membres</Text>
            <TextInput
              style={styles.input}
              value={maxMembers}
              onChangeText={setMaxMembers}
              keyboardType="numeric"
              placeholder="Ex: 10"
              placeholderTextColor="#94A3B8"
            />

            {/* 2. Montants */}
            <Text style={styles.sectionLabel}>Montants</Text>
            <Text style={styles.fieldLabel}>Cotisation tontine (FCFA / tour)</Text>
            <TextInput
              style={styles.input}
              value={tontineAmount}
              onChangeText={setTontineAmount}
              keyboardType="numeric"
              placeholder="Ex: 10000"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.fieldLabel}>Cotisation solidarité (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={solidarityAmount}
              onChangeText={setSolidarityAmount}
              keyboardType="numeric"
              placeholder="Ex: 2000"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.fieldLabel}>Frais de gestion du fondateur (FCFA / tour)</Text>
            <TextInput
              style={styles.input}
              value={managementFee}
              onChangeText={setManagementFee}
              keyboardType="numeric"
              placeholder="Ex: 500"
              placeholderTextColor="#94A3B8"
            />

            {/* 3. Adhésion & remplacement */}
            <Text style={styles.sectionLabel}>Adhésion & remplacement</Text>
            <Text style={styles.fieldLabel}>Documents exigés des nouveaux membres</Text>
            <View style={styles.optionCol}>
              {kycOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionCard, kycRequirement === opt.key && styles.optionCardActive]}
                  onPress={() => setKycRequirement(opt.key)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionTitle, kycRequirement === opt.key && styles.optionTitleActive]}>
                      {opt.label}
                    </Text>
                    {kycRequirement === opt.key && <Check size={16} color="#074B36" />}
                  </View>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Si un membre quitte le cercle</Text>
            <View style={styles.optionCol}>
              {leavingOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionCard, leavingRule === opt.key && styles.optionCardActive]}
                  onPress={() => setLeavingRule(opt.key)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionTitle, leavingRule === opt.key && styles.optionTitleActive]}>
                      {opt.label}
                    </Text>
                    {leavingRule === opt.key && <Check size={16} color="#074B36" />}
                  </View>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Seuil d'exclusion (retards autorisés)</Text>
            <View style={styles.pillsRow}>
              {exclusionOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pill, exclusionThreshold === opt && styles.pillActive]}
                  onPress={() => setExclusionThreshold(opt)}
                >
                  <Text style={[styles.pillText, exclusionThreshold === opt && styles.pillTextActive]}>
                    {opt} retards
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Dépôt de garantie obligatoire</Text>
                <Text style={styles.switchSub}>1 tour de cotisation déposé d'avance (cercle en cours)</Text>
              </View>
              <Switch
                value={depositRequired}
                onValueChange={setDepositRequired}
                trackColor={{ true: '#074B36' }}
              />
            </View>

            {/* 4. Règlement */}
            <Text style={styles.sectionLabel}>Règlement du cercle</Text>
            <Text style={styles.fieldLabel}>Conditions (lues et approuvées par les nouveaux membres)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={conditions}
              onChangeText={setConditions}
              placeholder="Ex: Cotisation le 1er de chaque mois avant 18h…"
              placeholderTextColor="#94A3B8"
              multiline
            />

            {/* 5. Code d'invitation */}
            <Text style={styles.sectionLabel}>Code d'invitation</Text>
            <View style={styles.inviteRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inviteCode}>{inviteCode}</Text>
                <Text style={styles.inviteHint}>Les nouveaux membres l'utilisent pour vous rejoindre</Text>
              </View>
              <TouchableOpacity style={styles.regenerateBtn} onPress={regenerateCode}>
                <RefreshCw size={15} color="#074B36" />
                <Text style={styles.regenerateText}>Générer</Text>
              </TouchableOpacity>
            </View>

            {/* Info sécurité */}
            <View style={styles.safeBox}>
              <ShieldCheck size={18} color="#059669" />
              <Text style={styles.safeText}>
                Le fondateur ne touche jamais les fonds : toutes les sommes versées (cotisations, rachat, dépôt)
                vont directement dans le compte du cercle.
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.9} onPress={handleSave}>
              <Check size={19} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>
            </TouchableOpacity>

            {leavingRule !== ReplacementRule.PAY_PAST_TURNS && (
              <View style={styles.warnBox}>
                <AlertTriangle size={16} color="#B47818" />
                <Text style={styles.warnText}>
                  Sans rachat des tours passés, les nouveaux membres n'auront pas de frais à payer pour adhérer.
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  topSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingBottom: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: { width: 38 },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bodySheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 20,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, gap: 12 },
  sectionLabel: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#074B36',
    marginTop: 14,
  },
  fieldLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#334155',
    marginTop: 6,
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    fontFamily: 'WorkSans',
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: { height: 110, paddingTop: 14, textAlignVertical: 'top' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  pillActive: { backgroundColor: '#074B36', borderColor: '#074B36' },
  pillText: { fontFamily: 'WorkSansMedium', fontSize: 12.5, color: '#64748B' },
  pillTextActive: { color: '#FFFFFF', fontFamily: 'WorkSansSemiBold' },
  optionCol: { gap: 8 },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionCardActive: { borderColor: '#074B36', backgroundColor: 'rgba(7, 75, 54, 0.04)' },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  optionTitle: { fontFamily: 'SoraBold', fontSize: 13.5, color: '#0F172A' },
  optionTitleActive: { color: '#074B36' },
  optionDesc: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B' },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    marginTop: 8,
  },
  switchTitle: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#0F172A' },
  switchSub: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#64748B', marginTop: 2 },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  inviteCode: { fontFamily: 'SoraBold', fontSize: 16, color: '#074B36', letterSpacing: 2 },
  inviteHint: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#64748B', marginTop: 2 },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 13,
  },
  regenerateText: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#074B36' },
  safeBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 13,
    marginTop: 8,
  },
  safeText: { flex: 1, fontFamily: 'WorkSans', fontSize: 12, lineHeight: 17, color: '#065F46' },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnText: { fontFamily: 'SoraBold', fontSize: 15, color: '#FFFFFF' },
  warnBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(217, 164, 65, 0.12)',
    borderRadius: 14,
    padding: 12,
  },
  warnText: { flex: 1, fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#92400E' },
});
