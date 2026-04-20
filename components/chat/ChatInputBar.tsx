import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  onVoice?: () => void;
  onAttach?: () => void;
  isLoading?: boolean;
}

export function ChatInputBar({ onSend, onVoice, onAttach, isLoading }: ChatInputBarProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Pulse animation on the voice button
  const voiceScale = useSharedValue(1);
  voiceScale.value = withRepeat(
    withSequence(withTiming(1.07, { duration: 900 }), withTiming(1, { duration: 900 })),
    -1,
    true
  );
  const voiceStyle = useAnimatedStyle(() => ({ transform: [{ scale: voiceScale.value }] }));

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText('');
  };

  const handleVoice = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVoice?.();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Frosted glass blur at the bottom */}
      <View style={styles.blurOverlay} />

      <View style={styles.container}>
        <View style={styles.pill}>
          {/* Attach / + button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAttach}
            accessibilityRole="button"
            accessibilityLabel="Attach file"
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>

          {/* Text input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Ask anything . . ."
            placeholderTextColor="#a5a5a5"
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
            accessibilityLabel="Chat input"
          />

          {/* Right side buttons */}
          <View style={styles.rightButtons}>
            {/* Microphone */}
            <TouchableOpacity
              style={styles.micBtn}
              accessibilityRole="button"
              accessibilityLabel="Voice input"
            >
              <Text style={styles.micIcon}>🎤</Text>
            </TouchableOpacity>

            {/* Gradient voice/send button */}
            <Animated.View style={voiceStyle}>
              <TouchableOpacity
                style={styles.voiceBtn}
                onPress={text.trim() ? handleSend : handleVoice}
                accessibilityRole="button"
                accessibilityLabel={text.trim() ? 'Send message' : 'Start voice input'}
              >
                {/* Blurred gradient background */}
                <LinearGradient
                  colors={['#131313', '#071433', '#bed2ff', '#ff8717']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.voiceIcon}>{text.trim() ? '↑' : '🎵'}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  blurOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 118,
    // Semi-transparent overlay to mimic the frosted glass
    backgroundColor: 'rgba(254,254,255,0.85)',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 34,
    paddingTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f8f8',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ededed',
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 16,
    shadowColor: '#131313',
    shadowOpacity: 0.1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    gap: 8,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addIcon: {
    fontSize: 22,
    color: '#131313',
    lineHeight: 24,
    fontWeight: '300',
  },
  input: {
    flex: 1,
    fontSize: 18,
    lineHeight: 18 * 1.5,
    color: '#131313',
    maxHeight: 120,
    paddingTop: 0,
    paddingBottom: 0,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: { fontSize: 18 },
  voiceBtn: {
    width: 52,
    height: 40,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    zIndex: 1,
  },
});
