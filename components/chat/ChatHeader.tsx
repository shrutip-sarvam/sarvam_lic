import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface ChatHeaderProps {
  model?: string;
  onMenuPress?: () => void;
  onNewChat?: () => void;
  onSharePress?: () => void;
  onModelSwitch?: () => void;
}

const MODELS = ['Indus', 'Sarvam-2B', 'Sarvam-1'];

export function ChatHeader({
  model = 'Indus',
  onMenuPress,
  onNewChat,
  onSharePress,
  onModelSwitch,
}: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Left: hamburger + wordmark + model badge */}
      <View style={styles.left}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onMenuPress}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Text style={styles.hamburger}>☰</Text>
        </TouchableOpacity>

        <View style={styles.brandRow}>
          {/* Sarvam wordmark */}
          <Text style={styles.wordmark}>sarvam</Text>

          {/* Model badge */}
          <TouchableOpacity
            style={styles.modelBadge}
            onPress={onModelSwitch}
            accessibilityRole="button"
            accessibilityLabel={`Current model: ${model}. Tap to switch`}
          >
            <Text style={styles.modelText}>{model}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right: new chat + share */}
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onNewChat}
          accessibilityRole="button"
          accessibilityLabel="New chat"
        >
          <Text style={styles.iconText}>⊕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onSharePress}
          accessibilityRole="button"
          accessibilityLabel="Share conversation"
        >
          <Text style={styles.iconText}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(254,254,255,0.95)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburger: { fontSize: 20, color: '#131313' },
  iconText: { fontSize: 20, color: '#131313' },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131313',
    letterSpacing: -0.3,
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4e2ff',
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 4,
    gap: 2,
  },
  modelText: {
    fontSize: 12,
    color: '#3348b8',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 14,
    color: '#3348b8',
    transform: [{ rotate: '90deg' }],
    lineHeight: 14,
  },
});
