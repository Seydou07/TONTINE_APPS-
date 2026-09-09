import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Bell,
  Plus,
  UserPlus,
  Users,
  Activity as ActivityIcon,
  Gift,
  HeartHandshake,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { mockCurrentUser, mockCircles, CircleType } from '@venega/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
};
export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroHeaderSection />
        <View style={styles.contentBody}>
          <QuickActionsCard />
          <TontineCirclesListCard />
        </View>
      </ScrollView>
    </View>
  );
}

function HeroHeaderSection() {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(600)} style={styles.heroWrapper}>
      <SafeAreaView edges={['top']} style={styles.heroContainer}>

        <View style={styles.headerRow}>
          {/* ── GAUCHE : Info profil */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarBorder}>
              <Image
                source={{ uri: mockCurrentUser.avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
                transition={300}
              />
            </View>
            <View>
              <Text style={styles.greetingText}>Bonjour,</Text>
              <Text style={styles.userName}>
                {mockCurrentUser.firstName.charAt(0)}. {mockCurrentUser.lastName.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* ── DROITE : Cloche notifications */}
          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              style={styles.bellButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <Bell size={20} color="#FFFFFF" />
              <View style={styles.bellBadge} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}


function QuickActionsCard() {
  const router = useRouter();

  const actions = [
    {
      id: 'create',
      label: 'Créer',
      icon: Plus,
      borderColor: '#0B6E4F',
      iconColor: '#0B6E4F',
      route: '/circles/create',
    },
    {
      id: 'join',
      label: 'Rejoindre',
      icon: UserPlus,
      borderColor: '#B9852A',
      iconColor: '#B9852A',
      route: '/circles/join',
    },
    {
      id: 'circles',
      label: 'Cercles',
      icon: Users,
      borderColor: '#7A4E9C',
      iconColor: '#7A4E9C',
      route: '/(tabs)/circles',
    },
    {
      id: 'activity',
      label: 'Activité',
      icon: ActivityIcon,
      borderColor: '#3182CE',
      iconColor: '#3182CE',
      route: '/activity',
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.quickActionsCard}>
      <View style={styles.quickActionsRow}>
        {actions.map((item) => {
          const IconComp = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.quickActionItem}
              activeOpacity={0.75}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.circularOutlineBtn, { borderColor: item.borderColor }]}>
                <IconComp size={24} color={item.iconColor} strokeWidth={2} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

function TontineCirclesListCard() {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(5);

  const getIconMeta = (circle: (typeof mockCircles)[number]) => {
    if (circle.type === CircleType.NATURE) return { icon: Gift, iconBg: '#E4F0EB', iconColor: '#0B6E4F' };
    if (circle.type === CircleType.SOLIDARITY_ONLY || circle.type === CircleType.HYBRID || circle.type === CircleType.AID_APPEAL) {
      return { icon: HeartHandshake, iconBg: '#E4F0EB', iconColor: '#0B6E4F' };
    }
    return { icon: Users, iconBg: '#E4F0EB', iconColor: '#0B6E4F' };
  };

  const circlesData = mockCircles.map((c) => {
    const meta = getIconMeta(c);
    return {
      id: c.id,
      title: c.name,
      subtitle:
        c.type === CircleType.AID_APPEAL
          ? `Collecte publique · ${formatXOF(c.rules.goalAmount ?? 0)}`
          : c.type === CircleType.NATURE
          ? `${c.memberCount} membres · ${c.rules.goalItem ?? 'En nature'}`
          : c.type === CircleType.HYBRID
          ? `${c.memberCount} membres · Hybride`
          : c.type === CircleType.SOLIDARITY_ONLY
          ? `${c.memberCount} membres · Solidarité`
          : `${c.memberCount} membres · Tour ${c.activeCycle?.currentTurn ?? 1} sur ${c.memberCount}`,
      isActive: !!c.activatedAt,
      icon: meta.icon,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      type: c.type,
    };
  });

  const openCircle = (circle: (typeof circlesData)[number]) => {
    if (circle.type === CircleType.AID_APPEAL) {
      router.push(`/aid/${circle.id}` as any);
    } else if (circle.type === CircleType.SOLIDARITY_ONLY) {
      router.push(`/circle/${circle.id}/solidarity` as any);
    } else if (circle.type === CircleType.TONTINE_ONLY) {
      router.push(`/circle/${circle.id}/tontine` as any);
    } else {
      router.push(`/circle/${circle.id}` as any);
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(600)}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardHeaderTitle} numberOfLines={1}>Mes Cercles</Text>
        <TouchableOpacity
          style={styles.seeAllBtnWrap}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/circles')}
        >
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tontineItemsList}>
        {circlesData.slice(0, visibleCount).map((circle) => {
          const IconComp = circle.icon;
          return (
            <TouchableOpacity
              key={circle.id}
              style={styles.circleListCard}
              activeOpacity={0.8}
              onPress={() => openCircle(circle)}
            >
              <View style={[styles.circleBadgeIcon, { backgroundColor: circle.iconBg }]}>
                <IconComp size={19} color={circle.iconColor} strokeWidth={1.8} />
              </View>
              <View style={styles.tontineDetailsCol}>
                <Text style={styles.tontineItemTitle} numberOfLines={1}>{circle.title}</Text>
                <Text style={styles.tontineItemSub} numberOfLines={1}>
                  {circle.subtitle}
                </Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: circle.isActive ? '#10B981' : '#CBD5E1' }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {circlesData.length > visibleCount && (
        <TouchableOpacity
          style={styles.seeMoreBtn}
          activeOpacity={0.75}
          onPress={() => setVisibleCount((n) => n + 5)}
        >
          <Text style={styles.seeMoreBtnText}>Voir plus</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 110,
    backgroundColor: '#FFFFFF',
  },
  heroWrapper: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  heroContainer: {
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1.1,
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#36E395',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  greetingText: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  userName: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#FFFFFF',
    marginTop: 1,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1.1,
    gap: 0,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9A441',
  },
  contentBody: {
    paddingHorizontal: 18,
    marginTop: -22,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 22,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 18,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  circularOutlineBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionLabel: {
    fontFamily: 'WorkSansMedium',
    fontSize: 12.5,
    color: '#22271F',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#1A202C',
    flexShrink: 1,
  },
  seeAllBtnWrap: {
    flexShrink: 0,
  },
  seeAllText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#0B6E4F',
  },
  seeMoreBtn: { alignSelf: 'center', paddingVertical: 12, marginTop: 2 },
  seeMoreBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#0B6E4F' },
  tontineItemsList: {
    gap: 10,
  },
  circleListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
    borderRadius: 16,
    padding: 13,
  },
  circleBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tontineDetailsCol: {
    flex: 1,
    marginRight: 8,
  },
  tontineItemTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#1A202C',
    marginBottom: 2,
  },
  tontineItemSub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#94A3B8',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
