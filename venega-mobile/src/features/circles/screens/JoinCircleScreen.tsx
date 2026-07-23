import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, FileText, Upload, Check, AlertTriangle, Info, ChevronDown } from 'lucide-react-native';

const mockCircleSearchResults = [
  { id: 'c2', name: 'Épargne Commerçants Rood Wooko', type: 'Tontine rotative', amount: '25 000 F', members: 10, conditions: 'Cotisation hebdomadaire de 25 000 F le samedi matin.' },
  { id: 'c3', name: 'Mutuelle Santé Dassasgho', type: 'Fonds de solidarité', amount: '5 000 F', members: 15, conditions: 'Cotisation mensuelle de 5 000 F pour le fonds de solidarité.' },
];

export default function JoinCircleScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'conditions' | 'form' | 'done'>('search');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<typeof mockCircleSearchResults[0] | null>(null);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', depositNumber: '' });

  const handleSearch = () => {
    const found = mockCircleSearchResults.find((c) => c.id === inviteCode || c.name.toLowerCase().includes(inviteCode.toLowerCase()));
    if (found) { setSelectedCircle(found); setStep('conditions'); }
  };

  const handleJoin = () => {
    setStep('done');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rejoindre un cercle</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 'search' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Code d'invitation</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ex: OUED2026"
                  placeholderTextColor={colors.textMuted}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[styles.searchBtn, !inviteCode && styles.searchBtnDisabled]}
                  disabled={!inviteCode}
                  onPress={handleSearch}
                >
                  <Search size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Cercles disponibles</Text>
            {mockCircleSearchResults.map((circle) => (
              <TouchableOpacity
                key={circle.id}
                style={styles.circleCard}
                onPress={() => { setSelectedCircle(circle); setStep('conditions'); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  <Text style={styles.circleMeta}>{circle.type} — {circle.members} membres</Text>
                </View>
                <Text style={styles.circleAmount}>{circle.amount}/tour</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 'conditions' && selectedCircle && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conditions du cercle</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{selectedCircle.name}</Text>
                <Text style={styles.cardBody}>{selectedCircle.conditions}</Text>
              </View>

              <View style={styles.warningBox}>
                <AlertTriangle size={18} color={colors.warning.DEFAULT} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.warningText}>
                  Vous rejoignez ce cercle à <Text style={{ fontWeight: '700' }}>tour 3</Text>. Vous devrez payer les cotisations des tours 1 et 2 (frais de rachat) : <Text style={{ fontWeight: '700' }}>25 000 F x 2 = 50 000 F</Text>.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setConditionsAccepted(!conditionsAccepted)}
              >
                <View style={[styles.checkbox, conditionsAccepted && styles.checkboxActive]}>
                  {conditionsAccepted && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>J'ai lu et j'accepte les conditions du cercle, y compris les frais de rachat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep('search')}>
                <Text style={styles.btnSecondaryText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, !conditionsAccepted && styles.btnDisabled]}
                disabled={!conditionsAccepted}
                onPress={() => setStep('form')}
              >
                <Text style={styles.btnPrimaryText}>Continuer</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'form' && selectedCircle && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vos informations</Text>

              <Text style={styles.label}>Nom complet</Text>
              <TextInput style={styles.input} placeholder="Ex: Aminata Ouédraogo" placeholderTextColor={colors.textMuted} value={form.fullName} onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))} />

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
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Récapitulatif de paiement</Text>
              <View style={styles.row}><Text style={styles.rowLabel}>Frais de rachat</Text><Text style={styles.rowValue}>50 000 F</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Dépôt de garantie</Text><Text style={styles.rowValue}>{selectedCircle.amount}</Text></View>
              <View style={[styles.row, styles.rowTotal]}><Text style={styles.totalLabel}>Total à payer</Text><Text style={styles.totalValue}>75 000 F</Text></View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep('conditions')}>
                <Text style={styles.btnSecondaryText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, (!form.fullName || !form.phoneNumber || !form.depositNumber) && styles.btnDisabled]}
                disabled={!form.fullName || !form.phoneNumber || !form.depositNumber}
                onPress={handleJoin}
              >
                <Text style={styles.btnPrimaryText}>Envoyer la demande</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'done' && (
          <View style={styles.doneContainer}>
            <View style={styles.doneIcon}>
              <Check size={32} color={colors.success} />
            </View>
            <Text style={styles.doneTitle}>Demande envoyée !</Text>
            <Text style={styles.doneText}>
              Votre demande d'adhésion à <Text style={{ fontWeight: '600' }}>{selectedCircle?.name}</Text> est en attente de validation par le président.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
              <Text style={styles.btnPrimaryText}>Retour aux cercles</Text>
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
  section: { marginBottom: spacing[6] },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[4] },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[3] },
  searchRow: { flexDirection: 'row', gap: spacing[2] },
  searchInput: { flex: 1, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.text, fontFamily: 'WorkSans', textTransform: 'uppercase', letterSpacing: 2 },
  searchBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.primary.DEFAULT, justifyContent: 'center', alignItems: 'center' },
  searchBtnDisabled: { opacity: 0.4 },
  circleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[3] },
  circleName: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: 2 },
  circleMeta: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  circleAmount: { fontSize: 14, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  cardBody: { fontSize: 14, color: colors.textMuted, fontFamily: 'WorkSans', lineHeight: 20 },
  warningBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', borderRadius: 12, padding: spacing[4], marginBottom: spacing[4] },
  warningText: { flex: 1, fontSize: 13, color: '#92400E', fontFamily: 'WorkSans', lineHeight: 18 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  checkboxLabel: { flex: 1, fontSize: 14, color: colors.text, fontFamily: 'WorkSans', lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[4] },
  btnPrimary: { flex: 1, backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },
  btnSecondary: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnSecondaryText: { color: colors.text, fontSize: 15, fontWeight: '600', fontFamily: 'WorkSans' },
  btnDisabled: { opacity: 0.4 },
  uploadBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#E9ECEF', borderStyle: 'dashed', borderRadius: 14, paddingVertical: 18, marginBottom: spacing[3] },
  uploadText: { fontSize: 14, color: colors.textMuted, fontFamily: 'WorkSans' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2] },
  rowLabel: { fontSize: 14, color: colors.textMuted, fontFamily: 'WorkSans' },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  rowTotal: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing[2], paddingTop: spacing[3] },
  totalLabel: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
  doneContainer: { alignItems: 'center', paddingVertical: 40 },
  doneIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[5] },
  doneTitle: { fontSize: 20, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[3] },
  doneText: { fontSize: 15, color: colors.textMuted, fontFamily: 'WorkSans', textAlign: 'center', lineHeight: 22, marginBottom: spacing[6], paddingHorizontal: spacing[6] },
});
