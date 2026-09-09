import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  HelpCircle,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockUsers, mockCircles, mockMemberships, mockReliabilityEvents } from '@venega/types';
import { ReliabilityEventType } from '@venega/types';

export default function ReliabilityScreen() {
  const router = useRouter();
  const currentUser = mockUsers.find((u) => u.id === 'u1');
  const userMemberships = mockMemberships.filter((m) => m.userId === 'u1');
  const userEvents = mockReliabilityEvents.filter((e: typeof mockReliabilityEvents[0]) => e.userId === 'u1');
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);

  const lateEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.LATE).length;
  const missedEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.MISSED).length;
  const onTimeEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.ON_TIME).length;
  
  const avgScore = userMemberships.length > 0
    ? Math.round(userMemberships.reduce((sum, m) => sum + (m.reliabilityScore || 0), 0) / userMemberships.length)
    : 98;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Score de Fiabilité</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.heroTextGroup}>
            <Text style={styles.heroTitle}>Niveau d'engagement</Text>
            <Text style={styles.heroSubtitle}>
              Votre réputation de paiement dans vos cercles d'épargne
            </Text>
          </View>
        </View>

        {/* Corps emboîté crème */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Carte de score global */}
            <View style={styles.globalScoreCard}>
              <View style={styles.scoreGaugeCircle}>
                <Text style={styles.scoreGaugeValue}>{avgScore}%</Text>
                <Text style={styles.scoreGaugeTag}>Excellent</Text>
              </View>

              <View style={styles.scoreMetaCol}>
                <Text style={styles.globalScoreTitle}>Fiabilité Globale</Text>
                <Text style={styles.globalScoreSub}>
                  Basée sur l'ensemble de vos cotisations passées
                </Text>

                <View style={styles.statsMiniGrid}>
                  <View style={styles.statMiniItem}>
                    <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.statMiniText}>{onTimeEvents || 12} à temps</Text>
                  </View>
                  <View style={styles.statMiniItem}>
                    <View style={[styles.statDot, { backgroundColor: '#D9A441' }]} />
                    <Text style={styles.statMiniText}>{lateEvents || 1} retard</Text>
                  </View>
                  <View style={styles.statMiniItem}>
                    <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.statMiniText}>{missedEvents || 0} manqué</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Explication du système de calcul */}
            <Text style={styles.sectionHeading}>Comment est calculé votre score ?</Text>
            <View style={styles.explainCard}>
              <View style={styles.explainRow}>
                <View style={[styles.explainIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <CheckCircle2 size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.explainTitle}>Paiement à temps (+1 point)</Text>
                  <Text style={styles.explainSub}>Chaque virement effectué avant l'échéance renforce votre score.</Text>
                </View>
              </View>

              <View style={styles.explainDivider} />

              <View style={styles.explainRow}>
                <View style={[styles.explainIconWrap, { backgroundColor: 'rgba(217, 164, 65, 0.12)' }]}>
                  <Clock size={18} color="#D9A441" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.explainTitle}>Retard de paiement (-1 point)</Text>
                  <Text style={styles.explainSub}>Cotisation effectuée après la date limite du tour.</Text>
                </View>
              </View>

              <View style={styles.explainDivider} />

              <View style={styles.explainRow}>
                <View style={[styles.explainIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <AlertTriangle size={18} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.explainTitle}>Cotisation manquée (-3 points)</Text>
                  <Text style={styles.explainSub}>Non paiement du tour à la clôture du cercle.</Text>
                </View>
              </View>
            </View>

            {/* Score détaillé par cercle */}
            <Text style={styles.sectionHeading}>Détails par cercle</Text>
            {userMemberships.map((membership) => {
              const circle = mockCircles.find((c) => c.id === membership.circleId);
              const circleEvents = userEvents.filter((e: typeof userEvents[0]) => e.circleId === membership.circleId);
              const isExpanded = expandedCircle === membership.circleId;
              if (!circle) return null;

              return (
                <View key={membership.circleId} style={styles.circleScoreCard}>
                  <TouchableOpacity
                    style={styles.circleScoreHeader}
                    activeOpacity={0.8}
                    onPress={() => setExpandedCircle(isExpanded ? null : membership.circleId)}
                  >
                    <View style={styles.circleScoreBadge}>
                      <Text style={styles.circleScoreBadgeText}>{membership.reliabilityScore || 98}%</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.circleNameText}>{circle.name}</Text>
                      <Text style={styles.circleMetaText}>
                        Tour {membership.turnOrder || 1} • {circleEvents.length || 4} transactions
                      </Text>
                    </View>

                    {isExpanded ? <ChevronUp size={18} color="#074B36" /> : <ChevronDown size={18} color="#94A3B8" />}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.eventsListWrap}>
                      {(circleEvents.length > 0 ? circleEvents : [
                        { id: 'ev1', description: 'Paiement du Tour 1 à temps', scoreImpact: 1, createdAt: '2026-08-01' },
                        { id: 'ev2', description: 'Paiement du Tour 2 à temps', scoreImpact: 1, createdAt: '2026-08-10' },
                      ]).map((event: any) => (
                        <View key={event.id} style={styles.eventRowItem}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <Text style={styles.eventDescText}>{event.description}</Text>
                          <Text style={styles.eventImpactText}>+{event.scoreImpact}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  heroTextGroup: {
    marginTop: 4,
  },
  heroTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  globalScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  scoreGaugeCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  scoreGaugeValue: {
    fontFamily: 'SoraBold',
    fontSize: 24,
    color: '#074B36',
  },
  scoreGaugeTag: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 10,
    color: '#10B981',
    marginTop: -2,
  },
  scoreMetaCol: {
    flex: 1,
  },
  globalScoreTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#0F172A',
  },
  globalScoreSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  statsMiniGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statMiniText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 11,
    color: '#334155',
  },
  sectionHeading: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#074B36',
    marginTop: 6,
  },
  explainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  explainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  explainIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explainTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  explainSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  explainDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  circleScoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  circleScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  circleScoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleScoreBadgeText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#074B36',
  },
  circleNameText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  circleMetaText: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  eventsListWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 14,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  eventRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDescText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 12.5,
    color: '#0F172A',
    flex: 1,
  },
  eventImpactText: {
    fontFamily: 'SoraBold',
    fontSize: 12.5,
    color: '#10B981',
  },
});
