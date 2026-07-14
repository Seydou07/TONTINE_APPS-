import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../packages/design-tokens/src';
import { useRouter } from 'expo-router';

const circleTypes = [
  { key: 'TONTINE_ONLY', label: 'Tontine rotative', desc: 'Cotisation + cagnotte par tour' },
  { key: 'SOLIDARITY_ONLY', label: 'Caisse solidarité', desc: 'Fonds d\'entraide sans rotation' },
  { key: 'HYBRID', label: 'Hybride', desc: 'Tontine + Caisse de solidarité' },
] as const;

const frequencies = [
  { key: 'MONTHLY', label: 'Mensuel' },
  { key: 'WEEKLY', label: 'Hebdomadaire' },
] as const;

export default function CreateCircleScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('TONTINE_ONLY');
  const [frequency, setFrequency] = useState<string>('MONTHLY');
  const [tontineAmount, setTontineAmount] = useState('');
  const [solidarityAmount, setSolidarityAmount] = useState('');

  const canSubmit = name.trim().length >= 3;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer un Cercle</Text>
          <Text style={styles.subtitle}>Définissez les paramètres de votre cercle</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nom du cercle *</Text>
          <TextInput style={styles.input} placeholder="Ex: Tontine Famille, Solidarité Voisins..." placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type de cercle *</Text>
          <View style={styles.typeGrid}>
            {circleTypes.map((t) => (
              <TouchableOpacity key={t.key} style={[styles.typeCard, type === t.key && styles.typeCardActive]} onPress={() => setType(t.key)}>
                <Text style={[styles.typeLabel, type === t.key && styles.typeLabelActive]}>{t.label}</Text>
                <Text style={[styles.typeDesc, type === t.key && styles.typeDescActive]}>{t.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Fréquence *</Text>
          <View style={styles.freqRow}>
            {frequencies.map((f) => (
              <TouchableOpacity key={f.key} style={[styles.freqBtn, frequency === f.key && styles.freqBtnActive]} onPress={() => setFrequency(f.key)}>
                <Text style={[styles.freqText, frequency === f.key && styles.freqTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {(type === 'TONTINE_ONLY' || type === 'HYBRID') && (
          <View style={styles.section}>
            <Text style={styles.label}>Cotisation tontine (XOF) *</Text>
            <TextInput style={styles.input} placeholder="Ex: 10000" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={tontineAmount} onChangeText={setTontineAmount} />
          </View>
        )}

        {(type === 'SOLIDARITY_ONLY' || type === 'HYBRID') && (
          <View style={styles.section}>
            <Text style={styles.label}>Cotisation solidarité (XOF) *</Text>
            <TextInput style={styles.input} placeholder="Ex: 2000" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={solidarityAmount} onChangeText={setSolidarityAmount} />
          </View>
        )}

        <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]} disabled={!canSubmit} onPress={() => Alert.alert('Succès', 'Cercle créé !')}>
          <Text style={styles.submitText}>Créer le cercle</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 28 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: 4 },
  subtitle: { fontSize: 15, color: colors.textMuted, fontFamily: 'WorkSans' },
  section: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.text, fontFamily: 'WorkSans' },
  typeGrid: { gap: 8 },
  typeCard: { backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 14, padding: 14 },
  typeCardActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  typeLabel: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: 2 },
  typeLabelActive: { color: '#059669' },
  typeDesc: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },
  typeDescActive: { color: '#059669' },
  freqRow: { flexDirection: 'row', gap: 8 },
  freqBtn: { flex: 1, backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  freqBtnActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  freqText: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  freqTextActive: { color: '#059669' },
  submitBtn: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },
});
