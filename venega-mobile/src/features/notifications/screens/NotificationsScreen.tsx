import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Wallet,
  UserPlus,
  ShieldAlert,
  Clock,
  ChevronRight,
  CheckCheck,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const mockNotifications = [
  {
    id: 'n1',
    type: 'PAYMENT_RECEIVED',
    title: 'Cotisation reçue !',
    message: 'Moussa Kaboré a payé sa cotisation de 10 500 F CFA dans "Tontine Commerçants".',
    circleName: 'Tontine Commerçants',
    time: 'Il y a 10 min',
    read: false,
    amount: 10500,
    userName: 'Moussa Kaboré',
  },
  {
    id: 'n2',
    type: 'PAYMENT_RECEIVED',
    title: 'Nouveau versement effectué',
    message: 'Fatou Sanogo a réglé son tour pour la Tontine Famille.',
    circleName: 'Tontine Famille Ouédraogo',
    time: 'Il y a 45 min',
    read: false,
    amount: 25000,
    userName: 'Fatou Sanogo',
  },
  {
    id: 'n3',
    type: 'REMINDER',
    title: 'Rappel de cotisation',
    message: 'Le Tour 3 de "Tontine Commerçants" s\'achève demain. Pensez à cotiser.',
    circleName: 'Tontine Commerçants',
    time: 'Il y a 3 heures',
    read: true,
  },
  {
    id: 'n4',
    type: 'MEMBER_JOINED',
    title: 'Nouveau membre',
    message: 'Ibrahim Traoré a rejoint votre cercle "Caisse Solidarité".',
    circleName: 'Caisse Solidarité Dassasgho',
    time: 'Hier, 18:30',
    read: true,
    userName: 'Ibrahim Traoré',
  },
  {
    id: 'n5',
    type: 'PAYMENT_RECEIVED',
    title: 'Cotisation reçue !',
    message: 'Awa Diallo a effectué son versement de 5 000 F CFA.',
    circleName: 'Tontine Femmes Unies',
    time: 'Hier, 14:15',
    read: true,
    amount: 5000,
    userName: 'Awa Diallo',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'ALL' | 'PAYMENTS' | 'REMINDERS'>('ALL');

  const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif: (typeof mockNotifications)[number]) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    if (notif.type === 'PAYMENT_RECEIVED') {
      Alert.alert(
        'Détail du paiement',
        `Membre : ${notif.userName}\nCercle : ${notif.circleName}\nMontant : ${notif.amount ? formatXOF(notif.amount) : 'Paiement effectué'}\nStatut : Validé et encaissé sur votre compte Citney.`,
        [{ text: 'Fermer', style: 'cancel' }]
      );
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'PAYMENTS') return n.type === 'PAYMENT_RECEIVED';
    if (filter === 'REMINDERS') return n.type === 'REMINDER';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity style={styles.markReadBtn} onPress={markAllAsRead}>
              <CheckCheck size={18} color="#36E395" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroTextGroup}>
            <Text style={styles.heroTitle}>Activité & Paiements</Text>
            <Text style={styles.heroSubtitle}>
              {unreadCount > 0
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont à jour'}
            </Text>
          </View>
        </View>

        {/* Corps emboîté crème */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          {/* Filtres d'onglets */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
              onPress={() => setFilter('ALL')}
            >
              <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
                Toutes ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filter === 'PAYMENTS' && styles.filterChipActive]}
              onPress={() => setFilter('PAYMENTS')}
            >
              <Text style={[styles.filterChipText, filter === 'PAYMENTS' && styles.filterChipTextActive]}>
                Paiements
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filter === 'REMINDERS' && styles.filterChipActive]}
              onPress={() => setFilter('REMINDERS')}
            >
              <Text style={[styles.filterChipText, filter === 'REMINDERS' && styles.filterChipTextActive]}>
                Rappels
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filteredNotifs.map((notif) => {
              const isPayment = notif.type === 'PAYMENT_RECEIVED';
              const isReminder = notif.type === 'REMINDER';

              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                  activeOpacity={0.8}
                  onPress={() => handleNotifClick(notif)}
                >
                  <View style={[styles.notifIconWrap, isPayment ? styles.iconPayment : isReminder ? styles.iconReminder : styles.iconMember]}>
                    {isPayment ? (
                      <CheckCircle2 size={20} color="#10B981" />
                    ) : isReminder ? (
                      <Clock size={20} color="#D9A441" />
                    ) : (
                      <UserPlus size={20} color="#074B36" />
                    )}
                  </View>

                  <View style={styles.notifContentCol}>
                    <View style={styles.notifHeaderLine}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {!notif.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                    <View style={styles.notifFooterLine}>
                      <Text style={styles.notifTime}>{notif.time}</Text>
                      <ChevronRight size={16} color="#94A3B8" />
                    </View>
                  </View>
                </TouchableOpacity>
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
    paddingBottom: 30,
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
  markReadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(54, 227, 149, 0.15)',
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#074B36',
    borderColor: '#074B36',
  },
  filterChipText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 12.5,
    color: '#64748B',
  },
  filterChipTextActive: {
    fontFamily: 'WorkSansSemiBold',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  notifCardUnread: {
    borderColor: '#36E395',
    backgroundColor: 'rgba(54, 227, 149, 0.04)',
  },
  notifIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPayment: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  iconReminder: {
    backgroundColor: 'rgba(217, 164, 65, 0.12)',
  },
  iconMember: {
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
  },
  notifContentCol: {
    flex: 1,
    gap: 3,
  },
  notifHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  notifMessage: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  notifFooterLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  notifTime: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#94A3B8',
  },
});
