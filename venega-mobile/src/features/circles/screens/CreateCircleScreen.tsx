import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings, Shield, Check, Info, Users } from 'lucide-react-native';

const circleTypes = [
  { key: 'TONTINE_ONLY', label: 'Tontine rotative', desc: 'Cotisation + cagnotte par tour' },
  { key: 'SOLIDARITY_ONLY', label: 'Caisse solidarité', desc: "Fonds d'entraide sans rotation" },
  { key: 'HYBRID', label: 'Hybride', desc: 'Tontine + Caisse de solidarité' },
] as const;

const frequencies = [
  { key: 'DAILY', label: 'Quotidien' },
  { key: 'WEEKLY', label: 'Hebdomadaire' },
  { key: 'BIWEEKLY', label: 'Bimensuel' },
  { key: 'MONTHLY', label: 'Mensuel' },
  { key: 'QUARTERLY', label: 'Trimestriel' },
  { key: 'CUSTOM', label: 'Personnalisé' },
] as const;

const exclusionOptions = ['2', '3', '4', '5'];

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

export default function CreateCircleScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('TONTINE_ONLY');
  const [frequency, setFrequency] = useState<string>('MONTHLY');
  const [customFrequency, setCustomFrequency] = useState('');
  const [tontineAmount, setTontineAmount] = useState('');
  const [solidarityAmount, setSolidarityAmount] = useState('');
  const [managementFee, setManagementFee] = useState('0');
  const [exclusionThreshold, setExclusionThreshold] = useState('3');
  const [depositRequired, setDepositRequired] = useState(false);
  const [recalculateOnLeave, setRecalculateOnLeave] = useState(true);
  const [nextPaymentRequired, setNextPaymentRequired] = useState(false);
  const [conditions, setConditions] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [maxMembers, setMaxMembers] = useState('');

  const tontine = parseFloat(tontineAmount) || 0;
  const solidarity = parseFloat(solidarityAmount) || 0;
  const fee = parseFloat(managementFee) || 0;
  const total = tontine + solidarity + fee;

  const generateInviteCode = () => {
    const prefix = name.replace(/[^a-zA-ZÀ-ÿ]/g, '').substring(0, 6).toUpperCase();
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    setInviteCode(prefix + suffix);
  };

  const handleSubmit = () => {
    Alert.alert('Succès', 'Cercle créé !', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un cercle</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>Informations générales</Text>

            <Text style={styles.label}>Nom du cercle *</Text>
            <TextInput style={styles.input} placeholder="Ex: Tontine Famille Ouédraogo" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />

            <Text style={styles.label}>Type de cercle *</Text>
            <View style={styles.typeGrid}>
              {circleTypes.map((t) => (
                <TouchableOpacity key={t.key} style={[styles.typeCard, type === t.key && styles.typeCardActive]} onPress={() => setType(t.key)}>
                  <Text style={[styles.typeLabel, type === t.key && styles.typeLabelActive]}>{t.label}</Text>
                  <Text style={[styles.typeDesc, type === t.key && styles.typeDescActive]}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Fréquence *</Text>
            <View style={styles.freqGrid}>
              {frequencies.map((f) => (
                <TouchableOpacity key={f.key} style={[styles.freqBtn, frequency === f.key && styles.freqBtnActive]} onPress={() => setFrequency(f.key)}>
                  <Text style={[styles.freqText, frequency === f.key && styles.freqTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {frequency === 'CUSTOM' && (
              <TextInput style={styles.input} placeholder="Ex: Tous les 10 jours, le 1er et 15 du mois..." placeholderTextColor={colors.textMuted} value={customFrequency} onChangeText={setCustomFrequency} />
            )}

            <Text style={styles.label}>Nombre de membres *</Text>
            <TextInput style={styles.input} placeholder="Ex: 6" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={maxMembers} onChangeText={setMaxMembers} />
            <Text style={styles.hint}>Minimum 2 membres. Le président est inclus dans ce nombre.</Text>

            <Text style={styles.label}>Code d'invitation</Text>
            <View style={styles.inviteRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Généré automatiquement" placeholderTextColor={colors.textMuted} value={inviteCode} onChangeText={(v) => setInviteCode(v.toUpperCase())} autoCapitalize="characters" />
              <TouchableOpacity style={styles.generateBtn} onPress={generateInviteCode}>
                <Text style={styles.generateBtnText}>Générer</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Partagez ce code aux membres que vous souhaitez inviter.</Text>

            <TouchableOpacity
              style={[styles.submitBtn, (!name.trim() || !maxMembers || parseInt(maxMembers) < 2) && styles.submitBtnDisabled]}
              disabled={!name.trim() || !maxMembers || parseInt(maxMembers) < 2}
              onPress={() => setStep(2)}
            >
              <Text style={styles.submitText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.sectionTitle}>Montants</Text>

            {(type === 'TONTINE_ONLY' || type === 'HYBRID') && (
              <>
                <Text style={styles.label}>Cotisation tontine (XOF) *</Text>
                <TextInput style={styles.input} placeholder="Ex: 10000" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={tontineAmount} onChangeText={setTontineAmount} />
              </>
            )}

            {(type === 'SOLIDARITY_ONLY' || type === 'HYBRID') && (
              <>
                <Text style={styles.label}>Cotisation solidarité (XOF) *</Text>
                <TextInput style={styles.input} placeholder="Ex: 2000" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={solidarityAmount} onChangeText={setSolidarityAmount} />
              </>
            )}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Cotisation totale par tour (incl. frais de gestion)</Text>
              <Text style={styles.totalValue}>{formatXOF(total)}</Text>
              {fee > 0 && (
                <Text style={styles.totalBreakdown}>
                  Cotisation {formatXOF(tontine + solidarity)} + Frais {formatXOF(fee)} = {formatXOF(total)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!tontine && !solidarity) && styles.submitBtnDisabled]}
              disabled={!tontine && !solidarity}
              onPress={() => setStep(3)}
            >
              <Text style={styles.submitText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.sectionTitle}>Options du cercle</Text>

            <Text style={styles.label}>Frais de gestion (XOF) — votre marge</Text>
            <TextInput style={styles.input} placeholder="Ex: 500" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={managementFee} onChangeText={setManagementFee} />
            <Text style={styles.hint}>Commission perçue par tour. Payée automatiquement par Venega, pas retirée par vous.</Text>

            <Text style={styles.label}>Seuil d'exclusion (retards)</Text>
            <View style={styles.freqGrid}>
              {exclusionOptions.map((opt) => (
                <TouchableOpacity key={opt} style={[styles.freqBtn, exclusionThreshold === opt && styles.freqBtnActive]} onPress={() => setExclusionThreshold(opt)}>
                  <Text style={[styles.freqText, exclusionThreshold === opt && styles.freqTextActive]}>{opt} retards</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Dépôt de garantie</Text>
                <Text style={styles.switchHint}>Nouveau membre dépose 1 cotisation en garantie</Text>
              </View>
              <Switch value={depositRequired} onValueChange={setDepositRequired} trackColor={{ true: colors.primary.DEFAULT }} />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Recalculer si départ</Text>
                <Text style={styles.switchHint}>Recalcule les cotisations si un membre part</Text>
              </View>
              <Switch value={recalculateOnLeave} onValueChange={setRecalculateOnLeave} trackColor={{ true: colors.primary.DEFAULT }} />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Cotisation tour suivant obligatoire</Text>
                <Text style={styles.switchHint}>Bénéficiaire doit payer le tour suivant avant de recevoir</Text>
              </View>
              <Switch value={nextPaymentRequired} onValueChange={setNextPaymentRequired} trackColor={{ true: colors.primary.DEFAULT }} />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={() => setStep(4)}>
              <Text style={styles.submitText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.sectionTitle}>Conditions et finalisation</Text>

            <Text style={styles.label}>Conditions d'adhésion</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Ex: Cotisation obligatoire le 1er de chaque mois avant 18h. Tout retard de plus de 5 jours entraîne une pénalité..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={conditions}
              onChangeText={setConditions}
            />

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>
              <View style={styles.row}><Text style={styles.rowLabel}>Nom</Text><Text style={styles.rowValue}>{name || '—'}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Type</Text><Text style={styles.rowValue}>{circleTypes.find((ct) => ct.key === type)?.label}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Fréquence</Text><Text style={styles.rowValue}>{frequency === 'CUSTOM' ? customFrequency || 'Personnalisé' : frequencies.find((f) => f.key === frequency)?.label}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Nombre de membres</Text><Text style={styles.rowValue}>{maxMembers || '—'}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Code d'invitation</Text><Text style={[styles.rowValue, { fontFamily: 'Sora' }]}>{inviteCode || '—'}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Cotisation totale</Text><Text style={[styles.rowValue, { color: colors.primary.DEFAULT, fontWeight: '700' }]}>{formatXOF(total)}</Text></View>
              {fee > 0 && <View style={styles.row}><Text style={[styles.rowLabel, { marginLeft: 8 }]}>dont frais de gestion</Text><Text style={[styles.rowValue, { color: colors.textMuted }]}>{formatXOF(fee)}/tour</Text></View>}
              <View style={styles.row}><Text style={styles.rowLabel}>Dépôt de garantie</Text><Text style={styles.rowValue}>{depositRequired ? 'Oui' : 'Non'}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Seuil d'exclusion</Text><Text style={styles.rowValue}>{exclusionThreshold} retards</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Recalcul si départ</Text><Text style={styles.rowValue}>{recalculateOnLeave ? 'Oui' : 'Non'}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Bénéficiaire paie avant</Text><Text style={styles.rowValue}>{nextPaymentRequired ? 'Oui' : 'Non'}</Text></View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Check size={18} color="#fff" />
              <Text style={styles.submitText}>Créer le cercle</Text>
            </TouchableOpacity>
          </>
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
  progressRow: { flexDirection: 'row', paddingHorizontal: spacing[5], gap: spacing[2], marginBottom: spacing[4] },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  progressDotActive: { backgroundColor: colors.primary.DEFAULT },
  scroll: { padding: spacing[5], paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[5] },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  hint: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', marginBottom: spacing[4], marginTop: -spacing[1] },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[3] },
  typeGrid: { gap: spacing[2], marginBottom: spacing[4] },
  typeCard: { backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 14, padding: 14 },
  typeCardActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  typeLabel: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: 2 },
  typeLabelActive: { color: '#059669' },
  typeDesc: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },
  typeDescActive: { color: '#059669' },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  freqBtn: { backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  freqBtnActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  freqText: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  freqTextActive: { color: '#059669' },
  inviteRow: { flexDirection: 'row', gap: spacing[2], alignItems: 'center', marginBottom: spacing[2] },
  generateBtn: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13 },
  generateBtnText: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  totalCard: { backgroundColor: colors.primary.tint, borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  totalLabel: { fontSize: 13, color: colors.primary.DEFAULT, fontFamily: 'WorkSans' },
  totalValue: { fontSize: 22, fontWeight: '700', color: colors.primary.DEFAULT, fontFamily: 'Sora' },
  totalBreakdown: { fontSize: 12, color: colors.primary.DEFAULT, opacity: 0.7, fontFamily: 'WorkSans', marginTop: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 14, padding: spacing[4], marginBottom: spacing[3], borderWidth: 1, borderColor: '#E9ECEF' },
  switchLabel: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  switchHint: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: 2 },
  submitBtn: { flexDirection: 'row', backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing[4] },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },
  summaryCard: { backgroundColor: colors.primary.tint, borderRadius: 14, padding: spacing[4], marginBottom: spacing[2] },
  summaryTitle: { fontSize: 14, fontWeight: '600', color: colors.primary.DEFAULT, fontFamily: 'WorkSans', marginBottom: spacing[3] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
});
