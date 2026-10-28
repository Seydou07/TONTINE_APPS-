import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, Crown, Info, Wallet } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Role } from '@venega/types';
import {
  getCircle,
  getCircleMembers,
  setTreasurer,
  getSolidarityValidators,
  toggleSolidarityValidator,
} from '../circleStore';
import { ScreenHeader, SectionTitle, Notice, actionStyles } from '../components/ActionScreenParts';

function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

export default function GovernanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId);

  const [, forceRender] = useState(0);
  const refresh = () => forceRender((n) => n + 1);

  if (!circle) return null;

  const members = getCircleMembers(circleId);
  const treasurer = members.find((m) => m.role === Role.TREASURER);
  const president = members.find((m) => m.role === Role.PRESIDENT);
  const eligibleForTreasurer = members.filter((m) => m.role !== Role.PRESIDENT);
  const validators = getSolidarityValidators(circleId);
  const hasSolidarity = circle.solidarityAmount > 0;

  const handleSetTreasurer = (userId: string, name: string) => {
    Alert.alert(
      'Nommer ce membre Trésorier ?',
      `${name} pourra exécuter les décaissements de la caisse de solidarité une fois approuvés par les validateurs.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Nommer',
          onPress: () => {
            setTreasurer(circleId, userId);
            refresh();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={actionStyles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Gouvernance" subtitle={circle.name} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={actionStyles.scroll} showsVerticalScrollIndicator={false}>
        {members.length <= 1 ? (
          <Notice icon={Info} tone="info">
            Ce cercle vient d'être créé et n'a pas encore de membres à désigner. Vous pourrez nommer un Trésorier et
            choisir les validateurs dès que des membres l'auront rejoint.
          </Notice>
        ) : (
          <>
            <SectionTitle>Bureau du cercle</SectionTitle>
            <View style={styles.group}>
              {president && (
                <View style={[styles.row, eligibleForTreasurer.length > 0 && styles.rowBorder]}>
                  <View style={[styles.avatar, styles.avatarPresident]}>
                    <Text style={[styles.avatarText, styles.avatarTextPresident]}>
                      {getInitials(president.user.firstName, president.user.lastName)}
                    </Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.name} numberOfLines={1}>
                      {president.user.firstName} {president.user.lastName}
                    </Text>
                    <Text style={styles.role}>Président · Fondateur</Text>
                  </View>
                  <Crown size={18} color={colors.accent.dark} strokeWidth={1.8} />
                </View>
              )}

              {eligibleForTreasurer.map((m, idx) => {
                const isTreasurer = m.role === Role.TREASURER;
                const isLast = idx === eligibleForTreasurer.length - 1;
                return (
                  <TouchableOpacity
                    key={m.userId}
                    style={[styles.row, !isLast && styles.rowBorder]}
                    activeOpacity={0.6}
                    disabled={isTreasurer}
                    accessibilityRole="button"
                    onPress={() => !isTreasurer && handleSetTreasurer(m.userId, `${m.user.firstName} ${m.user.lastName}`)}
                  >
                    <View style={[styles.avatar, isTreasurer && styles.avatarTreasurer]}>
                      <Text style={[styles.avatarText, isTreasurer && styles.avatarTextTreasurer]}>
                        {getInitials(m.user.firstName, m.user.lastName)}
                      </Text>
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.name} numberOfLines={1}>
                        {m.user.firstName} {m.user.lastName}
                      </Text>
                      <Text style={styles.role}>{isTreasurer ? 'Trésorier' : 'Membre'}</Text>
                    </View>
                    {isTreasurer ? (
                      <Wallet size={18} color={colors.primary.DEFAULT} strokeWidth={1.8} />
                    ) : (
                      <Text style={styles.link}>Nommer Trésorier</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {!treasurer ? (
              <Text style={styles.hint}>Aucun Trésorier nommé pour le moment.</Text>
            ) : null}

            {hasSolidarity && (
              <>
                <SectionTitle style={styles.sectionGap}>Validateurs de la caisse de solidarité</SectionTitle>
                <Text style={styles.sectionHint}>
                  Ces membres doivent tous approuver avant qu'un décaissement de la caisse de solidarité puisse être
                  exécuté.
                </Text>
                <View style={styles.group}>
                  {members.map((m, idx) => {
                    const checked = validators.includes(m.userId);
                    const isLast = idx === members.length - 1;
                    return (
                      <TouchableOpacity
                        key={m.userId}
                        style={[styles.row, !isLast && styles.rowBorder]}
                        activeOpacity={0.6}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                        onPress={() => {
                          const result = toggleSolidarityValidator(circleId, m.userId);
                          if (!result.success) {
                            Alert.alert('Impossible pour le moment', result.reason);
                            return;
                          }
                          refresh();
                        }}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{getInitials(m.user.firstName, m.user.lastName)}</Text>
                        </View>
                        <Text style={[styles.name, styles.rowText]} numberOfLines={1}>
                          {m.user.firstName} {m.user.lastName}
                        </Text>
                        <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                          {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionGap: { marginTop: 28 },
  sectionHint: { ...typography.footnote, color: colors.muted, marginBottom: 10, marginLeft: 4 },
  hint: { ...typography.footnote, color: colors.muted, marginTop: 8, marginLeft: 4 },

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

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPresident: { backgroundColor: colors.accent.tint },
  avatarTreasurer: { backgroundColor: colors.primary.tint },
  avatarText: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft },
  avatarTextPresident: { color: colors.accent.deep },
  avatarTextTreasurer: { color: colors.primary.dark },

  name: { ...typography.callout, fontWeight: '600', color: colors.ink },
  role: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  link: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
});
