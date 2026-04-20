import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const fadeProgress = useSharedValue(message.isStreaming ? 0 : 1);

  React.useEffect(() => {
    if (message.isStreaming) {
      fadeProgress.value = withTiming(1, { duration: 600 });
    }
  }, [message.isStreaming]);

  if (message.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  // Assistant message with streaming gradient fade-in
  const animStyle = useAnimatedStyle(() => ({
    opacity: fadeProgress.value,
  }));

  return (
    <Animated.View style={[styles.assistantRow, animStyle]}>
      <Text style={styles.assistantText}>{message.content}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // User message — right-aligned warm orange bubble
  userRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#fbf0e7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 300,
  },
  userText: {
    fontSize: 18,
    lineHeight: 18 * 1.5,
    color: '#70340e',
    fontWeight: '400',
  },

  // Assistant message — plain dark text, full width
  assistantRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  assistantText: {
    fontSize: 17,
    lineHeight: 17 * 1.45,
    color: '#131313',
    fontWeight: '400',
  },
});
