import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  Search,
  ChevronRight,
  HeartHandshake,
  Clock,
  CircleDot,
  Layers,
  Gift,
  Crown,
  UserCheck,
  Smartphone,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CircleType } from '@venega/types';
import {
  getCircles,
  getFounderCircleIds,
  CIRCLE_CREATION_FEE,
} from '../circleStore';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
};

type RoleFilter = 'ALL' | 'CREATED' | 'MEMBER';

export default function CirclesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  const openActivation = (id: string, _name: string) => {
    router.push(`/payment?circleId=${id}&type=ACTIVATION` as any);
  };

  const circles = getCircles();
  // c1 est créé par l'utilisateur (Fondateur) + tout cercle créé en session
  const createdCircleIds = getFounderCircleIds();
  const activeCount = circles.filter((c) => !!c.activatedAt).length;
  const pendingCount = circles.length - activeCount;

  const filteredCircles = circles.filter((circle) => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isOwner = createdCircleIds.includes(circle.id);

    if (!matchesSearch) return false;
    if (roleFilter === 'CREATED') return isOwner;
    if (roleFilter === 'MEMBER') return !isOwner;
    return true;
  });

  const getCircleBadge = (type: string) => {
    switch (type) {
      case 'HYBRID':
        return { label: 'Hybride', bg: '#EFE6F4', color: '#7A4E9C', icon: Layers };
      case 'TONTINE_ONLY':
        return { label: 'Tontine', bg: '#E4F0EB', color: '#0B6E4F', icon: Users };
      case 'SOLIDARITY_ONLY':
        return { label: 'Solidarité', bg: '#EBF8FF', color: '#3182CE', icon: HeartHandshake };
      case 'NATURE':
        return { label: 'En nature', bg: '#FBF1DD', color: '#B9852A', icon: Gift };
      case 'AID_APPEAL':
        return { label: "Appel à l'aide", bg: '#FFECEC', color: '#E53E3E', icon: HeartHandshake };
      default:
        return { label: 'Cercle', bg: '#F1F3F6', color: '#64748B', icon: Users };
    }
  };

  const getFrequencyText = (freq: string) => {
    switch (freq) {
      case 'WEEKLY': return 'Hebdomadaire';
      case 'MONTHLY': return 'Mensuel';
      case 'BIWEEKLY': return 'Bi-mensuel';
      default: return 'Régulier';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert émeraude */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.headerTitle}>Mes Cercles</Text>
              <Text style={styles.headerSubtitle}>
                {activeCount} cercle{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
                {pendingCount > 0 ? ` · ${pendingCount} en attente` : ''}
              </Text>
            </View>
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un cercle..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Corps emboîté crème */}
        <View style={styles.contentBody}>
          {/* Filtres par Rôle — Fondateur / Membre */}
          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[styles.filterPill, roleFilter === 'ALL' && styles.filterPillActive]}
              onPress={() => setRoleFilter('ALL')}
            >
              <Text style={[styles.filterPillText, roleFilter === 'ALL' && styles.filterPillTextActive]}>
                Tous ({circles.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, roleFilter === 'CREATED' && styles.filterPillActive]}
              onPress={() => setRoleFilter('CREATED')}
            >
              <Crown size={14} color={roleFilter === 'CREATED' ? '#FFFFFF' : '#074B36'} />
              <Text style={[styles.filterPillText, roleFilter === 'CREATED' && styles.filterPillTextActive]}>
                Fondateur
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, roleFilter === 'MEMBER' && styles.filterPillActive]}
              onPress={() => setRoleFilter('MEMBER')}
            >
              <UserCheck size={14} color={roleFilter === 'MEMBER' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.filterPillText, roleFilter === 'MEMBER' && styles.filterPillTextActive]}>
                Membre
              </Text>
            </TouchableOpacity>
          </View>

          {/* Liste des cercles */}
          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {filteredCircles.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={44} color="#CBD5E1" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>Aucun cercle trouvé</Text>
                <Text style={styles.emptySubtitle}>Essayez un autre mot-clé ou filtre.</Text>
              </View>
            ) : (
              filteredCircles.map((circle, index) => {
                const badge = getCircleBadge(circle.type);
                const BadgeIcon = badge.icon;
                const isAidAppeal = circle.type === CircleType.AID_APPEAL;
                const isSolidarityOnly = circle.type === CircleType.SOLIDARITY_ONLY;
                const isTontineOnly = circle.type === CircleType.TONTINE_ONLY;
                const totalAmount = (circle.tontineAmount || 0) + (circle.solidarityAmount || 0);
                const isFounder = createdCircleIds.includes(circle.id);
                const needsActivation = !circle.activatedAt;

                return (
                  <Animated.View
                    key={circle.id}
                    entering={FadeInDown.delay(index * 70).duration(500)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.circleCard,
                        isFounder && styles.circleCardFounder,
                        needsActivation && styles.circleCardInactive,
                      ]}
                      activeOpacity={0.88}
                      onPress={() => {
                        if (needsActivation) { openActivation(circle.id, circle.name); return; }
                        if (isAidAppeal) { router.push(`/aid/${circle.id}` as any); return; }
                        if (isSolidarityOnly) { router.push(`/circle/${circle.id}/solidarity` as any); return; }
                        if (isTontineOnly) { router.push(`/circle/${circle.id}/tontine` as any); return; }
                        router.push(`/circle/${circle.id}` as any);
                      }}
                    >
                      {/* Ligne haute de la carte avec Tag Rôle */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.cardTitleGroup}>
                          <View style={styles.tagsContainer}>
                            <View style={styles.badgeTag}>
                              <BadgeIcon size={12} color={badge.color} strokeWidth={2.2} />
                              <Text style={[styles.badgeTagText, { color: badge.color }]}>{badge.label}</Text>
                            </View>

                            {/* Badge Rôle du Membre */}
                            <View style={styles.roleBadge}>
                              {isFounder ? <Crown size={11} color="#B9852A" /> : <UserCheck size={11} color="#475569" />}
                              <Text style={[styles.roleBadgeText, isFounder ? styles.roleFounderText : styles.roleMemberText]}>
                                {isFounder ? 'Fondateur' : 'Membre'}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.circleName} numberOfLines={2}>
                            {circle.name}
                          </Text>
                        </View>
                        <ChevronRight size={18} color="#94A3B8" />
                      </View>

                      {/* Ligne centrale : détails et membres */}
                      <View style={styles.cardDetailsRow}>
                        <View style={styles.metricItem}>
                          <Users size={14} color="#64748B" />
                          <Text style={styles.metricText}>
                            {isAidAppeal ? '42+ contributeurs' : `${circle.memberCount} membres`}
                          </Text>
                        </View>

                        <View style={styles.dotDivider} />

                        <View style={styles.metricItem}>
                          <Clock size={14} color="#64748B" />
                          <Text style={styles.metricText}>{getFrequencyText(circle.frequency)}</Text>
                        </View>
                      </View>

                      {/* Ligne basse : Montant et statut */}
                      <View style={styles.cardFooterRow}>
                        <View>
                          <Text style={styles.amountLabel}>
                            {isAidAppeal ? 'Objectif de la collecte' : 'Cotisation par tour'}
                          </Text>
                          <Text style={styles.amountValue}>
                            {isAidAppeal
                              ? formatXOF(circle.rules?.goalAmount ?? 0)
                              : formatXOF(totalAmount)}
                          </Text>
                        </View>

                        {needsActivation ? (
                          <View style={styles.pendingTag}>
                            <Clock size={16} color="#B47818" />
                          </View>
                        ) : (
                          <View style={styles.activeTag}>
                            <CircleDot size={16} color="#10B981" />
                          </View>
                        )}
                      </View>

                      {needsActivation && (
                        <TouchableOpacity
                          style={styles.activateCta}
                          activeOpacity={0.88}
                          onPress={() => openActivation(circle.id, circle.name)}
                        >
                          <Smartphone size={15} color="#FFFFFF" />
                          <Text style={styles.activateCtaText}>
                            Activer ({formatXOF(CIRCLE_CREATION_FEE)})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* MODALE ACTIVATION — frais de création 2 000 F par USSD */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  header: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  headerTitleRow: {
    marginTop: 8,
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 14,
    color: '#FFFFFF',
  },
  contentBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#074B36',
    borderColor: '#074B36',
  },
  filterPillText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 12,
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'WorkSansSemiBold',
  },
  scrollList: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 10,
  },
  circleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  circleCardFounder: {
    backgroundColor: '#FFFFFF',
  },
  circleCardInactive: {
    opacity: 0.82,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  pendingTag: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(217, 164, 65, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateCta: {
    marginTop: 12,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  activateCtaText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitleGroup: {
    flex: 1,
    marginRight: 10,
    gap: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
  },
  roleFounderText: {
    color: '#B9852A',
  },
  roleMemberText: {
    color: '#475569',
  },
  circleName: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#0F172A',
  },
  cardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
  },
  dotDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  amountValue: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#1A202C',
  },
  activeTag: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#475569',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
});
