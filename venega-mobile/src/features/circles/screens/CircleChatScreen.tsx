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
import { ArrowLeft, Send, Smile, Paperclip } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { mockCircles, mockChatMessages, mockUsers, mockCurrentUser } from '@venega/types';
import { IconButton } from '../../../components/ui';

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

  const canSend = !!inputText.trim();

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>{formatDateHeader(item.date)}</Text>
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
      <View
        style={[
          styles.msgRow,
          isMe ? styles.msgRowMe : styles.msgRowOther,
          isGrouped && styles.msgRowGrouped,
        ]}
      >
        {showAvatar && !isGrouped ? (
          <Image source={{ uri: msg.senderAvatar }} style={styles.msgAvatar} contentFit="cover" />
        ) : showAvatar ? (
          <View style={styles.msgAvatarPlaceholder} />
        ) : null}

        <View style={styles.bubbleCol}>
          {!isMe && !isGrouped && <Text style={styles.senderName}>{msg.senderName}</Text>}
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{msg.content}</Text>
            <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(msg.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* En-tête */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {circle?.name ?? 'Discussion'}
            </Text>
            <Text style={styles.headerSub}>{circle?.memberCount ?? 0} membres</Text>
          </View>

          <View style={styles.headerAvatarGroup}>
            {mockUsers.slice(0, 3).map((u, i) => (
              <Image
                key={u.id}
                source={{ uri: u.avatarUrl }}
                style={[styles.headerMiniAvatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]}
                contentFit="cover"
              />
            ))}
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={groupedData}
            renderItem={renderItem}
            keyExtractor={(item, idx) => ('type' in item ? `date-${idx}` : (item as ChatMsg).id)}
            style={styles.list}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />

          {/* Barre de saisie */}
          <View style={styles.inputBar}>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.inputIconBtn} accessibilityRole="button" accessibilityLabel="Émojis">
                <Smile size={20} color={colors.subtle} />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Écrire un message"
                placeholderTextColor={colors.subtle}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                style={styles.inputIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Joindre un fichier"
              >
                <Paperclip size={20} color={colors.subtle} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, canSend ? styles.sendBtnActive : styles.sendBtnInactive]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Envoyer"
              accessibilityState={{ disabled: !canSend }}
            >
              <Send size={18} color={canSend ? '#FFFFFF' : colors.subtle} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 16,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  headerInfo: { flex: 1 },
  headerTitle: { ...typography.headline, color: colors.ink },
  headerSub: { ...typography.caption, fontWeight: '400', color: colors.muted },
  headerAvatarGroup: { flexDirection: 'row', alignItems: 'center' },
  headerMiniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.bg,
    backgroundColor: colors.fill,
  },

  list: { flex: 1, backgroundColor: colors.bg },
  messagesContainer: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },

  dateSeparator: { alignItems: 'center', marginVertical: 16 },
  dateText: { ...typography.caption, color: colors.muted },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, maxWidth: '82%' },
  msgRowGrouped: { marginTop: 2 },
  msgRowMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowOther: { alignSelf: 'flex-start' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, backgroundColor: colors.fill },
  msgAvatarPlaceholder: { width: 28, marginRight: 8 },

  bubbleCol: { flexShrink: 1 },
  senderName: { ...typography.caption, color: colors.muted, marginBottom: 3, marginLeft: 12 },
  bubble: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6, borderRadius: 18 },
  bubbleMe: { backgroundColor: colors.primary.DEFAULT },
  bubbleOther: { backgroundColor: colors.fill },
  msgText: { ...typography.body, color: colors.ink },
  msgTextMe: { color: '#FFFFFF' },
  msgTime: { fontSize: 11, lineHeight: 14, color: colors.subtle, alignSelf: 'flex-end', marginTop: 2 },
  msgTimeMe: { color: 'rgba(255, 255, 255, 0.7)' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.lg,
    backgroundColor: colors.fill,
  },
  inputIconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.ink,
    maxHeight: 110,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendBtnActive: { backgroundColor: colors.primary.DEFAULT },
  sendBtnInactive: { backgroundColor: colors.fill },
});
