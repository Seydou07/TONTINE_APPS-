import React from 'react';
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
  Wallet,
  Users,
  CalendarClock,
  ArrowRight,
  Clock,
  TrendingUp,
  Landmark,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { mockCurrentUser } from '@venega/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const logoImg = require('../../../../assets/venega-logo.png');

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
          <NextPaymentCard />
          <TontineCirclesListCard />
        </View>
      </ScrollView>
    </View>
  );
}

function HeroHeaderSection() {
  const router = useRouter();

  const reputationScore = mockCurrentUser.reputationScore;
  const nextCircleName = 'Tontine Famille Ouédraogo';
  const nextAmount = 10000;
  const nextDueDate = '1er sept. 2026';
  const daysLeft = 21;

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#36E395';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Fiable';
    if (score >= 60) return 'Correct';
    return 'À améliorer';
  };

  const scoreColor = getScoreColor(reputationScore);

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(600)} style={styles.heroWrapper}>
      <SafeAreaView edges={['top']} style={styles.heroContainer}>

        <View style={styles.headerRow}>
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

          <View style={styles.headerRightGroup}>
            <View style={styles.headerLogoPill}>
              <Image source={logoImg} style={styles.headerLogoImage} contentFit="contain" />
            </View>
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

        <View style={styles.reliabilitySection}>
          <View style={styles.reliabilityLabelRow}>
            <TrendingUp size={14} color={scoreColor} strokeWidth={2.2} />
            <Text style={styles.reliabilityLabel}>Score de fiabilité</Text>
            <Text style={[styles.reliabilityLevelBadge, { color: scoreColor }]}>{getScoreLabel(reputationScore)}</Text>
          </View>
          <View style={styles.reliabilityTrack}>
            <View
              style={[
                styles.reliabilityFill,
                { width: `${reputationScore}%` as any, backgroundColor: scoreColor },
              ]}
            />
          </View>
          <View style={styles.reliabilityScoreRow}>
            <Text style={styles.reliabilityScoreValue}>
              <Text style={{ color: scoreColor, fontFamily: 'SoraBold', fontSize: 20 }}>{reputationScore}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}> / 100</Text>
            </Text>
            <Text style={styles.reliabilityScoreHint}>Basé sur votre historique de paiements</Text>
          </View>
        </View>

      </SafeAreaView>
    </Animated.View>
  );
}

function NextPaymentCard() {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.nextPayCardClean}>
      <View style={styles.nextPayHeaderRow}>
        <View style={styles.nextPayIconWrap}>
          <CalendarClock size={20} color="#074B36" strokeWidth={2.2} />
        </View>
        <View style={styles.nextPayTextGroup}>
          <Text style={styles.nextPaySubtitle}>PROCHAINE COTISATION</Text>
          <Text style={styles.nextPayCircleTitle} numberOfLines={1}>Tontine de la famille</Text>
        </View>
        <View style={styles.nextPayDateTag}>
          <Clock size={11} color="#074B36" />
          <Text style={styles.nextPayDateValue} numberOfLines={1}>15 Août 2026</Text>
        </View>
      </View>

      <View style={styles.nextPayBottomRow}>
        <Text style={styles.nextPayAmountDisplay}>{formatXOF(10000)}</Text>
        <TouchableOpacity
          style={styles.payNowCleanBtn}
          activeOpacity={0.88}
          onPress={() => router.push('/(tabs)/circles')}
        >
          <Wallet size={15} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.payNowCleanBtnText}>Payer</Text>
        </TouchableOpacity>
      </View>
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
      borderColor: '#06B6D4',
      iconColor: '#06B6D4',
      route: '/circles/create',
    },
    {
      id: 'join',
      label: 'Rejoindre',
      icon: UserPlus,
      borderColor: '#EF4444',
      iconColor: '#EF4444',
      route: '/circles/join',
    },
    {
      id: 'pay',
      label: 'Cotiser',
      icon: Wallet,
      borderColor: '#6366F1',
      iconColor: '#6366F1',
      route: '/(tabs)/circles',
    },
    {
      id: 'circles',
      label: 'Cercles',
      icon: Users,
      borderColor: '#0B6E4F',
      iconColor: '#0B6E4F',
      route: '/(tabs)/circles',
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

  const circlesData = [
    {
      id: '1',
      title: 'Tontine de la Famille',
      subtitle: 'Cotisation mensuelle • 8/10 membres',
      amount: '10 000 F CFA',
      status: 'À jour',
      statusColor: '#10B981',
      icon: Users,
      iconBg: '#0B6E4F',
    },
    {
      id: '2',
      title: 'Cercle Commerce Abidjan',
      subtitle: 'Cotisation hebdomadaire • Tour n°4',
      amount: '25 000 F CFA',
      status: '15 Août',
      statusColor: '#F59E0B',
      icon: TrendingUp,
      iconBg: '#2B7FB0',
    },
    {
      id: '3',
      title: 'Tontine des Amis d\'Enfance',
      subtitle: 'Caisse d\'entraide & de secours',
      amount: '5 000 F CFA',
      status: 'À jour',
      statusColor: '#10B981',
      icon: Landmark,
      iconBg: '#7A4E9C',
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.tontineListCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardHeaderTitle} numberOfLines={1}>Mes Cercles</Text>
        <TouchableOpacity
          style={styles.seeAllBtnWrap}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/circles')}
        >
          <Text style={styles.seeAllText}>Voir tout</Text>
          <ArrowRight size={15} color="#0B6E4F" />
        </TouchableOpacity>
      </View>

      <View style={styles.tontineItemsList}>
        {circlesData.map((circle) => {
          const IconComp = circle.icon;
          return (
            <TouchableOpacity
              key={circle.id}
              style={styles.tontineRowItem}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/circles')}
            >
              <View style={[styles.circleBadgeIcon, { backgroundColor: circle.iconBg }]}>
                <IconComp size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={styles.tontineDetailsCol}>
                <Text style={styles.tontineItemTitle} numberOfLines={1}>{circle.title}</Text>
                <Text style={styles.tontineItemSub} numberOfLines={1}>
                  {circle.subtitle}
                </Text>
              </View>
              <View style={styles.tontineRightCol}>
                <Text style={styles.tontineItemAmount}>{circle.amount}</Text>
                <View style={styles.statusBadgeWrap}>
                  <Text style={[styles.statusBadgeText, { color: circle.statusColor }]}>
                    {circle.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    backgroundColor: '#FAF7F1',
  },
  scrollContent: {
    paddingBottom: 110,
    backgroundColor: '#FAF7F1',
  },
  heroWrapper: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 42,
  },
  heroContainer: {
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#36E395',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greetingText: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: 1,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogoPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLogoImage: {
    width: 72,
    height: 24,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#36E395',
  },
  balanceSection: {
    alignItems: 'center',
    marginVertical: 4,
  },
  balanceLabel: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13.5,
    color: '#36E395',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  balanceAmount: {
    fontFamily: 'SoraBold',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  eyeToggle: {
    padding: 4,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  fundButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#36E395',
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#36E395',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  fundButtonText: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#074B36',
  },
  sendButton: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(54, 227, 149, 0.45)',
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  sendButtonText: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#36E395',
  },
  yourWalletCard: {
    backgroundColor: '#043425',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
  },
  yourWalletTitle: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  walletPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletPillActive: {
    backgroundColor: '#36E395',
  },
  walletPillText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  walletPillTextActive: {
    color: '#074B36',
  },
  addWalletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  addWalletText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  reliabilitySection: {
    marginBottom: 6,
  },
  reliabilityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reliabilityLabel: {
    fontFamily: 'WorkSansMedium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    flex: 1,
  },
  reliabilityLevelBadge: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
  },
  reliabilityTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  reliabilityFill: {
    height: 6,
    borderRadius: 3,
  },
  reliabilityScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reliabilityScoreValue: {
    fontFamily: 'WorkSans',
  },
  reliabilityScoreHint: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
  contentBody: {
    paddingHorizontal: 18,
    marginTop: -28,
    backgroundColor: '#FAF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
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
  nextPayCardClean: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  nextPayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  nextPayIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextPayTextGroup: {
    flex: 1,
  },
  nextPaySubtitle: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 10.5,
    letterSpacing: 0.6,
    color: '#074B36',
  },
  nextPayCircleTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
    marginTop: 2,
  },
  nextPayBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nextPayAmountDisplay: {
    fontFamily: 'SoraBold',
    fontSize: 24,
    color: '#0F172A',
  },
  nextPayFrequency: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  nextPayDateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexShrink: 1,
  },
  nextPayDateValue: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#074B36',
  },
  nextPayBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  payNowCleanBtn: {
    backgroundColor: '#074B36',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  payNowCleanBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  tontineListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16.5,
    color: '#22271F',
    flexShrink: 1,
  },
  seeAllBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  seeAllText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#0B6E4F',
  },
  tontineItemsList: {
    gap: 16,
  },
  tontineRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 14,
    color: '#22271F',
    marginBottom: 2,
  },
  tontineItemSub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#6E7568',
  },
  tontineRightCol: {
    alignItems: 'flex-end',
  },
  tontineItemAmount: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#22271F',
    marginBottom: 3,
  },
  statusBadgeWrap: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
  },
});
