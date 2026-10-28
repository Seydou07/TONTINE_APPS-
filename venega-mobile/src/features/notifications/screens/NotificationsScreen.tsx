import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, CheckCircle2, UserPlus, Clock, CheckCheck } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Chip, IconButton } from '../../../components/ui';

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
        `Membre : ${notif.userName}\nCercle : ${notif.circleName}\nMontant : ${notif.amount ? formatXOF(notif.amount) : 'Paiement effectué'}\nStatut : Validé et encaissé sur votre compte Venega.`,
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

  // Regroupement par jour (d'après les libellés relatifs des notifications)
  const dayOf = (time: string) => (time.startsWith('Hier') ? 'Hier' : "Aujourd'hui");
  const groups: { day: string; items: typeof filteredNotifs }[] = [];
  filteredNotifs.forEach((n) => {
    const day = dayOf(n.time);
    const g = groups.find((x) => x.day === day);
    if (g) g.items.push(n);
    else groups.push({ day, items: [n] });
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <View style={styles.flex} />
          <IconButton
            icon={CheckCheck}
            variant="plain"
            color={unreadCount > 0 ? colors.primary.DEFAULT : colors.subtle}
            accessibilityLabel="Tout marquer comme lu"
            onPress={markAllAsRead}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes vos notifications sont lues'}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chips}
          >
            <Chip
              label={`Toutes (${notifications.length})`}
              selected={filter === 'ALL'}
              onPress={() => setFilter('ALL')}
            />
            <Chip label="Paiements" selected={filter === 'PAYMENTS'} onPress={() => setFilter('PAYMENTS')} />
            <Chip label="Rappels" selected={filter === 'REMINDERS'} onPress={() => setFilter('REMINDERS')} />
          </ScrollView>

          {groups.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Bell size={24} color={colors.subtle} strokeWidth={1.6} />
              </View>
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptyText}>Les paiements et rappels de vos cercles apparaîtront ici.</Text>
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.day} style={styles.group}>
                <Text style={styles.groupLabel}>{group.day}</Text>
                <View style={styles.card}>
                  {group.items.map((notif, i) => {
                    const isPayment = notif.type === 'PAYMENT_RECEIVED';
                    const isReminder = notif.type === 'REMINDER';
                    const tone = isPayment
                      ? { Icon: CheckCircle2, fg: colors.primary.DEFAULT, bg: colors.primary.tint }
                      : isReminder
                      ? { Icon: Clock, fg: colors.accent.dark, bg: colors.accent.tint }
                      : { Icon: UserPlus, fg: colors.info.DEFAULT, bg: colors.info.tint };
                    const Icon = tone.Icon;

                    return (
                      <TouchableOpacity
                        key={notif.id}
                        style={styles.row}
                        activeOpacity={0.6}
                        accessibilityRole="button"
                        onPress={() => handleNotifClick(notif)}
                      >
                        <View style={[styles.rowIcon, { backgroundColor: tone.bg }]}>
                          <Icon size={18} color={tone.fg} strokeWidth={2} />
                        </View>
                        <View style={[styles.rowBody, i < group.items.length - 1 && styles.rowBorder]}>
                          <View style={styles.flex}>
                            <View style={styles.rowTop}>
                              <Text
                                style={[styles.rowTitle, !notif.read && styles.rowTitleUnread]}
                                numberOfLines={1}
                              >
                                {notif.title}
                              </Text>
                              <Text style={styles.rowTime}>{notif.time}</Text>
                            </View>
                            <Text style={styles.rowMessage}>{notif.message}</Text>
                          </View>
                          {!notif.read && <View style={styles.unreadDot} accessibilityLabel="Non lue" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  flex: { flex: 1 },

  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  title: { ...typography.title, color: colors.ink, paddingHorizontal: 4 },
  subtitle: { ...typography.callout, color: colors.muted, paddingHorizontal: 4, marginTop: 2 },

  chipsScroll: { marginTop: 16, marginHorizontal: -16 },
  chips: { gap: 8, paddingHorizontal: 16 },

  group: { marginTop: 24 },
  groupLabel: { ...typography.footnote, fontWeight: '600', color: colors.muted, marginBottom: 8, marginLeft: 4 },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 14, gap: 12 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingRight: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  rowTitle: { flex: 1, ...typography.callout, fontWeight: '500', color: colors.ink },
  rowTitleUnread: { fontWeight: '700' },
  rowTime: { ...typography.caption, fontWeight: '400', color: colors.subtle },
  rowMessage: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary.DEFAULT },

  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: { ...typography.headline, color: colors.ink },
  emptyText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
