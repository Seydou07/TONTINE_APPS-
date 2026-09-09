import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Users,
  Smile,
  Paperclip,
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { mockCircles, mockChatMessages, mockUsers, mockCurrentUser } from '@venega/types';

type ChatMsg = {
  id: string;
  circleId: string;
  userId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
};

export default function CircleChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id;
  const flatListRef = useRef<FlatList<any>>(null);

  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];
  const circleMessages = mockChatMessages.filter((m) => m.circleId === circle?.id);

  const [messages, setMessages] = useState<ChatMsg[]>(circleMessages);
  const [inputText, setInputText] = useState('');

  const currentUser = mockCurrentUser;

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMsg = {
      id: `m_${Date.now()}`,
      circleId: circle?.id ?? '',
      userId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderAvatar: currentUser.avatarUrl,
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 300);
  }, []);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Group messages by date
  const groupedData: (ChatMsg | { type: 'date'; date: string })[] = [];
  let lastDate = '';
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== lastDate) {
      groupedData.push({ type: 'date', date: msg.createdAt });
      lastDate = msgDate;
    }
    groupedData.push(msg);
  });

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{formatDateHeader(item.date)}</Text>
          </View>
        </View>
      );
    }

    const msg = item as ChatMsg;
    const isMe = msg.userId === currentUser.id;
    const showAvatar = !isMe;

    // Check if previous message is from same sender (to group)
    const prevItem = index > 0 ? groupedData[index - 1] : null;
    const prevMsg = prevItem && !('type' in prevItem) ? (prevItem as ChatMsg) : null;
    const isGrouped = prevMsg?.userId === msg.userId;

    return (
      <Animated.View
        entering={FadeInUp.delay(50).duration(300)}
        style={[
          styles.msgRow,
          isMe ? styles.msgRowMe : styles.msgRowOther,
          isGrouped && { marginTop: 2 },
        ]}
      >
        {showAvatar && !isGrouped ? (
          <Image
            source={{ uri: msg.senderAvatar }}
            style={styles.msgAvatar}
            contentFit="cover"
          />
        ) : showAvatar ? (
          <View style={styles.msgAvatarPlaceholder} />
        ) : null}

        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          {!isMe && !isGrouped && (
            <Text style={styles.senderName}>{msg.senderName}</Text>
          )}
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>
            {msg.content}
          </Text>
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
            {formatTime(msg.createdAt)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {circle?.name ?? 'Discussion'}
            </Text>
            <Text style={styles.headerSub}>
              {circle?.memberCount ?? 0} membres
            </Text>
          </View>

          <View style={styles.headerAvatarGroup}>
            {mockUsers.slice(0, 3).map((u, i) => (
              <Image
                key={u.id}
                source={{ uri: u.avatarUrl }}
                style={[
                  styles.headerMiniAvatar,
                  { marginLeft: i === 0 ? 0 : -8 },
                  { zIndex: 3 - i },
                ]}
                contentFit="cover"
              />
            ))}
          </View>
        </View>

        {/* Chat body */}
        <KeyboardAvoidingView
          style={styles.chatBody}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={groupedData}
            renderItem={renderItem}
            keyExtractor={(item, idx) =>
              'type' in item ? `date-${idx}` : (item as ChatMsg).id
            }
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />

          {/* Input bar */}
          <View style={styles.inputBar}>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.inputIconBtn}>
                <Smile size={22} color="#94A3B8" />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Écrire un message..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={1000}
              />

              <TouchableOpacity style={styles.inputIconBtn}>
                <Paperclip size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                inputText.trim() ? styles.sendBtnActive : styles.sendBtnInactive,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Send size={18} color={inputText.trim() ? '#FFFFFF' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#074B36',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  headerSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 1,
  },
  headerAvatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMiniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#074B36',
  },
  chatBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  messagesContainer: {
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 12,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 14,
  },
  datePill: {
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dateText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#64748B',
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 6,
    maxWidth: '85%',
  },
  msgRowMe: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgRowOther: {
    alignSelf: 'flex-start',
  },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginTop: 4,
  },
  msgAvatarPlaceholder: {
    width: 30,
    marginRight: 8,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    maxWidth: '100%',
  },
  bubbleMe: {
    backgroundColor: '#074B36',
    borderBottomRightRadius: 6,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E8E4DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  senderName: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#0B6E4F',
    marginBottom: 3,
  },
  msgText: {
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#1E293B',
    lineHeight: 20,
  },
  msgTextMe: {
    color: '#FFFFFF',
  },
  msgTime: {
    fontFamily: 'WorkSans',
    fontSize: 10.5,
    color: '#94A3B8',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  msgTimeMe: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E4DC',
    gap: 8,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F6F2',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#E2E0DA',
  },
  inputIconBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 15,
    color: '#0F172A',
    maxHeight: 100,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#074B36',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnInactive: {
    backgroundColor: '#E8E4DC',
  },
});
