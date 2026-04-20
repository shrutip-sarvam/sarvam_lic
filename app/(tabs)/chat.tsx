import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Share,
  ListRenderItemInfo,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChatMessage, Message } from '../../components/chat/ChatMessage';
import { ChatInputBar } from '../../components/chat/ChatInputBar';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { ResponseActions } from '../../components/chat/ResponseActions';
function uuidv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

// Sarvam API endpoint — replace with your actual key in .env
const SARVAM_API_BASE = process.env.EXPO_PUBLIC_SARVAM_API_BASE_URL ?? 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY ?? '';

async function fetchSarvamResponse(messages: Message[], model: string): Promise<string> {
  // TODO: Replace with actual Sarvam chat completion endpoint.
  // Verify endpoint at https://docs.sarvam.ai
  const response = await fetch(`${SARVAM_API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': SARVAM_API_KEY,
    },
    body: JSON.stringify({
      model: model === 'Indus' ? 'sarvam-indus' : 'sarvam-2b',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  // Standard OpenAI-compatible response shape
  return data.choices?.[0]?.message?.content ?? 'No response received.';
}

type ListItem = Message | { type: 'actions'; messageId: string; content: string };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('Indus');
  const listRef = useRef<FlatList>(null);

  const MODELS = ['Indus', 'Sarvam-2B', 'Sarvam-1'];

  const handleModelSwitch = () => {
    Alert.alert(
      'Switch Model',
      'Choose your Sarvam model',
      MODELS.map((m) => ({
        text: m,
        onPress: () => setModel(m),
        style: m === model ? 'default' : 'default',
      }))
    );
  };

  const handleNewChat = () => {
    Alert.alert('Start new chat?', 'This will clear the current conversation.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New Chat', style: 'destructive', onPress: () => setMessages([]) },
    ]);
  };

  const handleShare = async () => {
    const text = messages.map((m) => `${m.role === 'user' ? 'You' : 'Sarvam'}: ${m.content}`).join('\n\n');
    await Share.share({ message: text });
  };

  const handleSend = useCallback(
    async (text: string) => {
      const userMsg: Message = { id: uuidv4(), role: 'user', content: text };
      const assistantId = uuidv4();

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Scroll to bottom
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const updatedMessages = [...messages, userMsg];
        const reply = await fetchSarvamResponse(updatedMessages, model);

        const assistantMsg: Message = {
          id: assistantId,
          role: 'assistant',
          content: reply,
          isStreaming: true,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
      } catch (err: unknown) {
        const errMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `Sorry, I couldn't process that. ${(err as Error).message}`,
        };
        setMessages((prev) => [...prev, errMsg]);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, model]
  );

  // Build flat list data — insert action bar after each completed assistant message
  const listData: ListItem[] = messages.flatMap((msg, i) => {
    const items: ListItem[] = [msg];
    if (msg.role === 'assistant' && i === messages.length - 1 && !isLoading) {
      items.push({ type: 'actions', messageId: msg.id, content: msg.content });
    }
    return items;
  });

  const renderItem = ({ item }: ListRenderItemInfo<ListItem>) => {
    if ('type' in item && item.type === 'actions') {
      return <ResponseActions content={item.content} />;
    }
    return <ChatMessage message={item as Message} />;
  };

  const keyExtractor = (item: ListItem) =>
    'type' in item ? `actions-${item.messageId}` : item.id;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <ChatHeader
        model={model}
        onMenuPress={() => {}}
        onNewChat={handleNewChat}
        onSharePress={handleShare}
        onModelSwitch={handleModelSwitch}
      />

      {/* Message list */}
      <FlatList
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<View style={styles.emptySpace} />}
      />

      {/* Input bar */}
      <ChatInputBar onSend={handleSend} isLoading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptySpace: {
    flex: 1,
    minHeight: 200,
  },
});
