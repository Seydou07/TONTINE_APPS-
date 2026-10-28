import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeft, FileText, Camera, Lock } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button, IconButton, ListGroup, ListRow } from '../../../components/ui';

export default function KYCIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Vérification d'identité</Text>
          <View style={styles.headerSide} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.badge}>
            <ShieldCheck size={28} color={colors.primary.DEFAULT} strokeWidth={1.8} />
          </View>

          <Text style={styles.title}>Vérifiez votre identité</Text>
          <Text style={styles.subtitle}>
            Pour sécuriser les cotisations et la confiance de votre cercle, votre identité doit être vérifiée.
            Cela prend environ 2 minutes.
          </Text>

          <ListGroup title="Ce dont vous aurez besoin">
            <ListRow
              icon={FileText}
              tone="primary"
              title="Pièce d'identité"
              subtitle="CNIB ou passeport, recto et verso"
            />
            <ListRow icon={Camera} tone="primary" title="Un selfie" subtitle="Visage bien éclairé, sans lunettes" last />
          </ListGroup>

          <View style={styles.note}>
            <Lock size={16} color={colors.muted} strokeWidth={2} />
            <Text style={styles.noteText}>
              Vos documents sont chiffrés et servent uniquement à vérifier votre identité.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Commencer la vérification" onPress={() => router.replace('/kyc-upload')} />
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
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
  },
  headerTitle: {
    flex: 1,
    ...typography.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  headerSide: { width: 40 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.title,
    color: colors.ink,
  },
  subtitle: {
    ...typography.callout,
    color: colors.muted,
    marginTop: 8,
    marginBottom: 28,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    ...typography.footnote,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.muted,
  },
});
