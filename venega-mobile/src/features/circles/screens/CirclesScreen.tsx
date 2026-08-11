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
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockCircles } from '@venega/types';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
};

type RoleFilter = 'ALL' | 'CREATED' | 'MEMBER';

export default function CirclesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  // c1 est créé par l'utilisateur (Fondateur)
  const createdCircleIds = ['c1'];

  const filteredCircles = mockCircles.filter((circle) => {
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
        return { label: 'Hybride', bg: 'rgba(7, 75, 54, 0.08)', color: '#074B36', icon: Layers };
      case 'TONTINE_ONLY':
        return { label: 'Tontine', bg: 'rgba(99, 102, 241, 0.08)', color: '#6366F1', icon: Users };
      case 'SOLIDARITY_ONLY':
        return { label: 'Solidarité', bg: 'rgba(217, 164, 65, 0.12)', color: '#B47818', icon: HeartHandshake };
      case 'NATURE':
        return { label: 'Nature / Box 🎁', bg: 'rgba(236, 72, 153, 0.12)', color: '#DB2777', icon: Gift };
      default:
        return { label: 'Cercle', bg: 'rgba(0,0,0,0.05)', color: '#64748B', icon: Users };
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
                Consultez vos tontines créées et vos participations
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
                Tous ({mockCircles.length})
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
                const totalAmount = (circle.tontineAmount || 0) + (circle.solidarityAmount || 0);
                const isFounder = createdCircleIds.includes(circle.id);

                return (
                  <Animated.View
                    key={circle.id}
                    entering={FadeInDown.delay(index * 70).duration(500)}
                  >
                    <TouchableOpacity
                      style={[styles.circleCard, isFounder && styles.circleCardFounder]}
                      activeOpacity={0.88}
                      onPress={() => router.push(`/circle/${circle.id}`)}
                    >
                      {/* Ligne haute de la carte avec Tag Rôle */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.cardTitleGroup}>
                          <View style={styles.tagsContainer}>
                            <View style={[styles.badgeTag, { backgroundColor: badge.bg }]}>
                              <BadgeIcon size={12} color={badge.color} strokeWidth={2.2} />
                              <Text style={[styles.badgeTagText, { color: badge.color }]}>{badge.label}</Text>
                            </View>

                            {/* Badge Rôle du Membre */}
                            <View style={[styles.roleBadge, isFounder ? styles.roleFounder : styles.roleMember]}>
                              {isFounder ? <Crown size={11} color="#074B36" /> : <UserCheck size={11} color="#475569" />}
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
                          <Text style={styles.metricText}>{circle.memberCount} membres</Text>
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
                          <Text style={styles.amountLabel}>Cotisation par tour</Text>
                          <Text style={styles.amountValue}>{formatXOF(totalAmount)}</Text>
                        </View>

                        <View style={styles.activeTag}>
                          <CircleDot size={10} color="#10B981" />
                          <Text style={styles.activeTagText}>Actif</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            )}
          </ScrollView>
        </View>
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
    backgroundColor: '#FAF7F1',
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
    gap: 14,
  },
  circleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  circleCardFounder: {
    borderColor: 'rgba(7, 75, 54, 0.3)',
    backgroundColor: '#FFFFFF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleGroup: {
    flex: 1,
    marginRight: 10,
    gap: 6,
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
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleFounder: {
    backgroundColor: 'rgba(7, 75, 54, 0.1)',
  },
  roleMember: {
    backgroundColor: '#F1F5F9',
  },
  roleBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
  },
  roleFounderText: {
    color: '#074B36',
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
    marginBottom: 14,
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
    paddingTop: 12,
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
    fontSize: 17,
    color: '#074B36',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#059669',
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
