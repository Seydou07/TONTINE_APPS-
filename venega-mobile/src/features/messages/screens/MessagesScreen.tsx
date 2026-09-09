import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageSquare, Search, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockChatMessages, mockUsers, mockCircles } from '@venega/types';

const CONVERSATIONS = [
  {
    id: 'c1',
    name: 'Tontine Famille Ouédraogo',
    lastSender: 'Ibrahim S.',
    lastMessage: 'Cotisation reçue pour le tour 3. Merci à tous !',
    avatar: mockUsers[0]!.avatarUrl,
    time: '14:32',
    unread: 2,
  },
  {
    id: 'c2',
    name: 'Épargne Commerçants Rood Wooko',
    lastSender: 'Moussa K.',
    lastMessage: 'Rappel : Versement hebdomadaire ce samedi avant 12h.',
    avatar: mockUsers[1]!.avatarUrl,
    time: '11:05',
    unread: 0,
  },
  {
    id: 'c3',
    name: 'Mutuelle Santé Dassasgho',
    lastSender: 'Fatimata C.',
    lastMessage: 'Demande de solidarité validée par le bureau.',
    avatar: mockUsers[4]!.avatarUrl,
    time: 'Hier',
    unread: 1,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert */}
        <View style={styles.topSection}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Discussion de Groupe</Text>
            <Text style={styles.headerSubtitle}>
              Messagerie instantanée de vos cercles d'épargne
            </Text>
          </View>

          {/* Recherche */}
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une discussion..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Corps emboîté crème ("Calebasse") */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filtered.map((conv, index) => (
              <Animated.View key={conv.id} entering={FadeInDown.delay(index * 70).duration(500)}>
                <TouchableOpacity
                  style={styles.convCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/circle/${conv.id}/chat` as any)}
                >
                  <View style={styles.avatarWrap}>
                    <Image source={{ uri: conv.avatar }} style={styles.avatarImg} contentFit="cover" />
                    <View style={styles.activeDot} />
                  </View>

                  <View style={styles.convInfoCol}>
                    <View style={styles.convHeaderRow}>
                      <Text style={styles.convNameText} numberOfLines={1}>
                        {conv.name}
                      </Text>
                      <Text style={styles.convTimeText}>{conv.time}</Text>
                    </View>

                    <View style={styles.convBodyRow}>
                      <Text style={[styles.convMessageText, conv.unread > 0 && styles.convMessageUnread]} numberOfLines={1}>
                        <Text style={{ fontFamily: 'WorkSansSemiBold', color: '#074B36' }}>{conv.lastSender} : </Text>
                        {conv.lastMessage}
                      </Text>
                      {conv.unread > 0 && (
                        <View style={styles.unreadPill}>
                          <Text style={styles.unreadPillText}>{conv.unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <MessageSquare size={44} color="#CBD5E1" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>Aucune discussion</Text>
                <Text style={styles.emptySub}>
                  Rejoignez ou créez un cercle pour commencer à échanger avec les membres.
                </Text>
              </View>
            )}
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
  headerTitleRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
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
    paddingBottom: 110,
    gap: 12,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convInfoCol: {
    flex: 1,
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convNameText: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  convTimeText: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#94A3B8',
  },
  convBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convMessageText: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  convMessageUnread: {
    color: '#0F172A',
  },
  unreadPill: {
    backgroundColor: '#074B36',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadPillText: {
    fontFamily: 'SoraBold',
    fontSize: 11,
    color: '#FFFFFF',
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
  emptySub: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
});
