import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Crown, Wallet } from 'lucide-react-native';
import { Role } from '@venega/types';
import {
  getCircle,
  getCircleMembers,
  setTreasurer,
  getSolidarityValidators,
  toggleSolidarityValidator,
} from '../circleStore';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gouvernance</Text>
            <View style={styles.backBtn} />
          </View>
          <Text style={styles.headerSub} numberOfLines={1}>{circle.name}</Text>
        </View>

        <View style={styles.bodySheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {members.length <= 1 ? (
              <View style={styles.emptyNotice}>
                <Text style={styles.emptyNoticeText}>
                  Ce cercle vient d'être créé et n'a pas encore de membres à désigner. Vous pourrez nommer un
                  Trésorier et choisir les validateurs dès que des membres l'auront rejoint.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>Bureau du cercle</Text>
                <View style={styles.card}>
                  {president && (
                    <View style={styles.memberRow}>
                      <View style={[styles.avatar, styles.avatarPresident]}>
                        <Text style={styles.avatarText}>{getInitials(president.user.firstName, president.user.lastName)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>{president.user.firstName} {president.user.lastName}</Text>
                        <Text style={styles.memberRole}>Président · Fondateur</Text>
                      </View>
                      <Crown size={16} color="#B9852A" />
                    </View>
                  )}

                  {eligibleForTreasurer.length > 0 && <View style={styles.divider} />}

                  {eligibleForTreasurer.map((m) => {
                    const isTreasurer = m.role === Role.TREASURER;
                    return (
                      <TouchableOpacity
                        key={m.userId}
                        style={styles.memberRow}
                        activeOpacity={0.7}
                        onPress={() => !isTreasurer && handleSetTreasurer(m.userId, `${m.user.firstName} ${m.user.lastName}`)}
                      >
                        <View style={[styles.avatar, isTreasurer && styles.avatarTreasurer]}>
                          <Text style={styles.avatarText}>{getInitials(m.user.firstName, m.user.lastName)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.memberName}>{m.user.firstName} {m.user.lastName}</Text>
                          <Text style={styles.memberRole}>{isTreasurer ? 'Trésorier' : 'Membre — toucher pour nommer Trésorier'}</Text>
                        </View>
                        {isTreasurer ? (
                          <Wallet size={16} color="#0B6E4F" />
                        ) : (
                          <Text style={styles.nominateLink}>Nommer</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {hasSolidarity && (
                  <>
                    <Text style={styles.sectionLabel}>Validateurs de décaissement — Solidarité</Text>
                    <Text style={styles.sectionHint}>
                      Ces membres doivent tous approuver avant qu'un décaissement de la caisse de solidarité puisse
                      être exécuté.
                    </Text>
                    <View style={styles.card}>
                      {members.map((m, idx) => {
                        const checked = validators.includes(m.userId);
                        return (
                          <React.Fragment key={m.userId}>
                            {idx > 0 && <View style={styles.divider} />}
                            <TouchableOpacity
                              style={styles.memberRow}
                              activeOpacity={0.7}
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
                              <Text style={[styles.memberName, { flex: 1 }]}>{m.user.firstName} {m.user.lastName}</Text>
                              <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                                {checked && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                              </View>
                            </TouchableOpacity>
                          </React.Fragment>
                        );
                      })}
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  topSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingBottom: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#FFFFFF' },
  headerSub: { fontFamily: 'WorkSans', fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  bodySheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -14, paddingTop: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50, gap: 10 },
  sectionLabel: { fontFamily: 'SoraBold', fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 10 },
  sectionHint: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B', lineHeight: 17, marginTop: -4, marginBottom: 2 },
  card: { borderWidth: 1.5, borderColor: '#E7EAEE', borderRadius: 18, overflow: 'hidden' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  divider: { height: 1, backgroundColor: '#F1F3F6' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F3F6', justifyContent: 'center', alignItems: 'center' },
  avatarPresident: { backgroundColor: '#FBF1DD' },
  avatarTreasurer: { backgroundColor: '#E4F0EB' },
  avatarText: { fontFamily: 'SoraBold', fontSize: 12.5, color: '#475569' },
  memberName: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#1A202C' },
  memberRole: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8', marginTop: 1 },
  nominateLink: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#0B6E4F' },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#0B6E4F', borderColor: '#0B6E4F' },
  emptyNotice: { backgroundColor: '#EBF8FF', borderRadius: 14, padding: 14, marginTop: 8 },
  emptyNoticeText: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#2C6690', lineHeight: 19 },
});
