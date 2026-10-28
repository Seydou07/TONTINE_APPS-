import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, typography } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Check, Info, Upload, UserPlus } from 'lucide-react-native';
import { mockCircles, mockMemberships, mockCycles } from '@venega/types';
import { Avatar, Button, TextField } from '../../../components/ui';
import {
  ScreenHeader,
  ScreenFooter,
  SectionTitle,
  Notice,
  KeyValue,
  CenteredState,
  actionStyles,
} from '../components/ActionScreenParts';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

export default function ReplacementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; memberLeft: string }>();
  const circleId = params.id ?? 'c1';
  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];
  const cycle = mockCycles.find((c) => c.circleId === circleId && c.isActive);
  const memberships = mockMemberships.filter((m) => m.circleId === circleId);

  const [step, setStep] = useState<'select' | 'form' | 'done'>('select');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', depositNumber: '' });

  if (!circle) return null;

  const pastTurns = cycle ? cycle.currentTurn - 1 : 0;
  const rachatAmount = pastTurns * circle.tontineAmount;
  const totalMembers = memberships.length;
  const lastTurnOrder = totalMembers;

  const handleSubmit = () => {
    setStep('done');
  };

  const formIncomplete = !form.fullName || !form.phoneNumber || !form.depositNumber;
  const depositAmount = circle.depositRequired ? circle.tontineAmount : 0;

  return (
    <SafeAreaView style={actionStyles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Remplacer un membre"
        subtitle={circle.name}
        onBack={() => (step === 'form' ? setStep('select') : router.back())}
      />

      <KeyboardAvoidingView style={actionStyles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={actionStyles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'select' && (
            <>
              <Notice icon={Info} tone="info" title="Règle de remplacement">
                Le remplaçant paie les cotisations des tours passés (rachat) et est placé en dernier dans l'ordre de
                rotation.
              </Notice>

              <SectionTitle style={styles.sectionGap}>Membre sortant</SectionTitle>
              <View style={styles.group}>
                {memberships
                  .filter((m) => m.userId !== 'u1')
                  .map((m, idx, arr) => {
                    const selected = selectedMember === m.userId;
                    return (
                      <TouchableOpacity
                        key={m.userId}
                        style={[styles.row, idx < arr.length - 1 && styles.rowBorder]}
                        onPress={() => setSelectedMember(m.userId)}
                        activeOpacity={0.6}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                      >
                        <Avatar name={`${m.user.firstName} ${m.user.lastName}`} uri={m.user.avatarUrl} size={40} />
                        <View style={styles.rowText}>
                          <Text style={styles.name} numberOfLines={1}>
                            {m.user.firstName} {m.user.lastName}
                          </Text>
                          <Text style={styles.meta}>
                            Position {m.turnOrder} · Fiabilité {m.reliabilityScore}/100
                          </Text>
                        </View>
                        <View style={[styles.radio, selected && styles.radioOn]}>
                          {selected ? <View style={styles.radioDot} /> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </>
          )}

          {step === 'form' && (
            <>
              <View style={styles.rachatCard}>
                <Text style={styles.rachatLabel}>Frais de rachat</Text>
                <Text style={styles.rachatAmount}>{formatXOF(rachatAmount)}</Text>
                <Text style={styles.rachatDesc}>
                  {pastTurns} tours × {formatXOF(circle.tontineAmount)}
                </Text>
              </View>

              <View style={styles.summary}>
                <KeyValue
                  label="Dépôt de garantie"
                  value={circle.depositRequired ? formatXOF(circle.tontineAmount) : 'Non requis'}
                />
                <KeyValue
                  label="Total à payer"
                  value={formatXOF(rachatAmount + depositAmount)}
                  valueColor={colors.primary.DEFAULT}
                  strong
                  last
                />
              </View>

              <SectionTitle style={styles.sectionGap}>Informations du remplaçant</SectionTitle>
              <View style={styles.form}>
                <TextField
                  label="Nom complet"
                  placeholder="Ex. Moussa Kaboré"
                  value={form.fullName}
                  onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))}
                />
                <TextField
                  label="Numéro de téléphone"
                  prefix="+226"
                  placeholder="70 12 34 56"
                  keyboardType="phone-pad"
                  value={form.phoneNumber}
                  onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
                />
                <TextField
                  label="Numéro Mobile Money de dépôt"
                  prefix="+226"
                  placeholder="70 12 34 56"
                  keyboardType="phone-pad"
                  value={form.depositNumber}
                  onChangeText={(v) => setForm((p) => ({ ...p, depositNumber: v }))}
                />

                <View>
                  <Text style={styles.fieldLabel}>Pièce d'identité (CNIB)</Text>
                  <View style={styles.uploadRow}>
                    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} accessibilityRole="button">
                      <Upload size={18} color={colors.muted} strokeWidth={2} />
                      <Text style={styles.uploadText}>Recto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} accessibilityRole="button">
                      <Upload size={18} color={colors.muted} strokeWidth={2} />
                      <Text style={styles.uploadText}>Verso</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Notice icon={AlertTriangle} tone="warning">
                  Le remplaçant sera placé en dernier dans l'ordre de rotation (position {lastTurnOrder + 1}). Il devra
                  patienter jusqu'à son tour pour recevoir la cagnotte.
                </Notice>
              </View>
            </>
          )}

          {step === 'done' && (
            <CenteredState
              icon={Check}
              tone="primary"
              title="Invitation envoyée"
              text={`Le remplaçant devra payer le rachat de ${formatXOF(rachatAmount)} et sera placé en dernier dans l'ordre de rotation.`}
            />
          )}
        </ScrollView>

        <ScreenFooter>
          {step === 'select' && (
            <Button
              title="Inviter un remplaçant"
              icon={UserPlus}
              onPress={() => setStep('form')}
              disabled={!selectedMember}
            />
          )}
          {step === 'form' && (
            <View style={styles.btnRow}>
              <Button title="Retour" variant="secondary" onPress={() => setStep('select')} style={styles.btnBack} />
              <Button
                title="Envoyer l'invitation"
                onPress={handleSubmit}
                disabled={formIncomplete}
                style={styles.btnMain}
              />
            </View>
          )}
          {step === 'done' && <Button title="Retour au cercle" onPress={() => router.back()} />}
        </ScreenFooter>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionGap: { marginTop: 24 },

  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 64 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowText: { flex: 1 },
  name: { ...typography.callout, fontWeight: '600', color: colors.ink },
  meta: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOn: { borderColor: colors.primary.DEFAULT },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary.DEFAULT },

  rachatCard: {
    backgroundColor: colors.primary.dark,
    borderRadius: 24,
    padding: 20,
  },
  rachatLabel: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8 },
  rachatAmount: { ...typography.display, color: '#FFFFFF', marginTop: 4 },
  rachatDesc: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8, marginTop: 2 },
  summary: {
    marginTop: 12,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },

  form: { gap: 20 },
  fieldLabel: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft, marginBottom: 8 },
  uploadRow: { flexDirection: 'row', gap: 12 },
  uploadBox: {
    flex: 1,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: colors.fill,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: { ...typography.callout, fontWeight: '500', color: colors.inkSoft },

  btnRow: { flexDirection: 'row', gap: 12 },
  btnBack: { flex: 1 },
  btnMain: { flex: 2 },
});
