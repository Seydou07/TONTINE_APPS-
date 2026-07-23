import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, UserPlus, Upload, Check, AlertTriangle, ChevronDown } from 'lucide-react-native';
import { mockCircles, mockMemberships, mockCycles } from '@venega/types';

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Remplacer un membre</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 'select' && (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Règle de remplacement</Text>
              <Text style={styles.infoText}>
                Le remplaçant paie les cotisations des tours passés (rachat) et est placé en dernier dans l'ordre de rotation.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Membre sortant</Text>
            {memberships.filter((m) => m.userId !== 'u1').map((m) => (
              <TouchableOpacity
                key={m.userId}
                style={[styles.memberCard, selectedMember === m.userId && styles.memberCardActive]}
                onPress={() => setSelectedMember(m.userId)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.user.firstName} {m.user.lastName}</Text>
                  <Text style={styles.memberMeta}>Position #{m.turnOrder} — Score {m.reliabilityScore}/100</Text>
                </View>
                {selectedMember === m.userId && <Check size={18} color={colors.primary.DEFAULT} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.submitBtn, !selectedMember && styles.submitBtnDisabled]}
              disabled={!selectedMember}
              onPress={() => setStep('form')}
            >
              <UserPlus size={18} color="#fff" />
              <Text style={styles.submitText}>Inviter un remplaçant</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'form' && (
          <>
            <View style={styles.rachatCard}>
              <Text style={styles.rachatTitle}>Frais de rachat</Text>
              <Text style={styles.rachatDesc}>{pastTurns} tours × {formatXOF(circle.tontineAmount)}</Text>
              <Text style={styles.rachatAmount}>{formatXOF(rachatAmount)}</Text>
              <View style={styles.rachatDivider} />
              <View style={styles.rachatRow}>
                <Text style={styles.rachatLabel}>Dépôt de garantie</Text>
                <Text style={styles.rachatValue}>{circle.depositRequired ? formatXOF(circle.tontineAmount) : 'Non requis'}</Text>
              </View>
              <View style={styles.rachatRow}>
                <Text style={[styles.rachatLabel, { fontWeight: '700', color: colors.text }]}>Total à payer</Text>
                <Text style={[styles.rachatValue, { color: colors.primary.DEFAULT, fontSize: 18 }]}>{formatXOF(rachatAmount + (circle.depositRequired ? circle.tontineAmount : 0))}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Informations du remplaçant</Text>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput style={styles.input} placeholder="Ex: Moussa Kaboré" placeholderTextColor={colors.textMuted} value={form.fullName} onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))} />

            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput style={styles.input} placeholder="+226 70 12 34 56" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" value={form.phoneNumber} onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))} />

            <Text style={styles.label}>Numéro de dépôt Mobile Money</Text>
            <TextInput style={styles.input} placeholder="+226 70 12 34 56" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" value={form.depositNumber} onChangeText={(v) => setForm((p) => ({ ...p, depositNumber: v }))} />

            <Text style={styles.label}>CNIB recto</Text>
            <TouchableOpacity style={styles.uploadBox}>
              <Upload size={20} color={colors.textMuted} />
              <Text style={styles.uploadText}>Choisir un fichier</Text>
            </TouchableOpacity>

            <Text style={styles.label}>CNIB verso</Text>
            <TouchableOpacity style={styles.uploadBox}>
              <Upload size={20} color={colors.textMuted} />
              <Text style={styles.uploadText}>Choisir un fichier</Text>
            </TouchableOpacity>

            <View style={styles.warningBox}>
              <AlertTriangle size={16} color="#92400E" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.warningText}>
                Le remplaçant sera placé en dernier dans l'ordre de rotation (position #{lastTurnOrder + 1}). Il devra patienter son tour pour recevoir la cagnotte.
              </Text>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep('select')}>
                <Text style={styles.btnSecondaryText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1 }, (!form.fullName || !form.phoneNumber || !form.depositNumber) && styles.submitBtnDisabled]}
                disabled={!form.fullName || !form.phoneNumber || !form.depositNumber}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Envoyer l'invitation</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'done' && (
          <View style={styles.doneContainer}>
            <View style={styles.doneIcon}>
              <Check size={32} color={colors.success} />
            </View>
            <Text style={styles.doneTitle}>Invitation envoyée !</Text>
            <Text style={styles.doneText}>
              L'invitation a été envoyée au remplaçant. Il devra payer le rachat de {formatXOF(rachatAmount)} et sera placé en dernier dans l'ordre de rotation.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
              <Text style={styles.btnPrimaryText}>Retour au cercle</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  scroll: { padding: spacing[5], paddingBottom: 40 },

  infoCard: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 14, padding: spacing[4], marginBottom: spacing[5] },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#0369A1', fontFamily: 'WorkSans', marginBottom: spacing[2] },
  infoText: { fontSize: 13, color: '#0C4A6E', fontFamily: 'WorkSans', lineHeight: 18 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[4] },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[3] },

  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 14, padding: spacing[4], marginBottom: spacing[3] },
  memberCardActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  memberName: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: 2 },
  memberMeta: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },

  rachatCard: { backgroundColor: colors.primary.tint, borderRadius: 14, padding: spacing[4], marginBottom: spacing[5] },
  rachatTitle: { fontSize: 15, fontWeight: '600', color: colors.primary.DEFAULT, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  rachatDesc: { fontSize: 13, color: colors.primary.DEFAULT, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  rachatAmount: { fontSize: 24, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora', marginBottom: spacing[3] },
  rachatDivider: { height: 1, backgroundColor: '#A7F3D0', marginVertical: spacing[2] },
  rachatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2] },
  rachatLabel: { fontSize: 13, color: colors.primary.DEFAULT, fontFamily: 'WorkSans' },
  rachatValue: { fontSize: 13, fontWeight: '600', color: colors.primary.DEFAULT, fontFamily: 'WorkSans' },

  uploadBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#E9ECEF', borderStyle: 'dashed', borderRadius: 14, paddingVertical: 18, marginBottom: spacing[3] },
  uploadText: { fontSize: 14, color: colors.textMuted, fontFamily: 'WorkSans' },

  warningBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 12, padding: spacing[4], marginTop: spacing[3], marginBottom: spacing[4] },
  warningText: { flex: 1, fontSize: 13, color: '#92400E', fontFamily: 'WorkSans', lineHeight: 18 },

  submitBtn: { flexDirection: 'row', backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing[4] },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },

  btnRow: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[4] },
  btnPrimary: { backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 14, paddingHorizontal: spacing[5], alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },
  btnSecondary: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnSecondaryText: { color: colors.text, fontSize: 15, fontWeight: '600', fontFamily: 'WorkSans' },

  doneContainer: { alignItems: 'center', paddingVertical: 40 },
  doneIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[5] },
  doneTitle: { fontSize: 20, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[3] },
  doneText: { fontSize: 15, color: colors.textMuted, fontFamily: 'WorkSans', textAlign: 'center', lineHeight: 22, marginBottom: spacing[6], paddingHorizontal: spacing[6] },
});
