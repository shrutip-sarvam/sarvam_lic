import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

interface ResponseActionsProps {
  content: string;
  onReadAloud?: () => void;
}

export function ResponseActions({ content, onReadAloud }: ResponseActionsProps) {
  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleThumb = async (dir: 'up' | 'down') => {
    setThumbState((prev) => (prev === dir ? null : dir));
    await Haptics.selectionAsync();
  };

  const handleSources = () => Alert.alert('Sources', 'Sources for this response will appear here.');

  return (
    <View style={styles.container}>
      {/* Sources pill */}
      <TouchableOpacity style={styles.sourcesPill} onPress={handleSources} accessibilityRole="button" accessibilityLabel="View sources">
        <Text style={styles.sourcesText}>Sources</Text>
      </TouchableOpacity>

      {/* Icon actions */}
      <View style={styles.iconRow}>
        {/* Copy */}
        <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} accessibilityRole="button" accessibilityLabel="Copy response">
          <Text style={styles.icon}>⧉</Text>
        </TouchableOpacity>

        {/* Read aloud */}
        <TouchableOpacity style={styles.iconBtn} onPress={onReadAloud} accessibilityRole="button" accessibilityLabel="Read response aloud">
          <Text style={styles.icon}>▷</Text>
        </TouchableOpacity>

        {/* Thumbs up */}
        <TouchableOpacity
          style={[styles.iconBtn, thumbState === 'up' && styles.iconBtnActive]}
          onPress={() => handleThumb('up')}
          accessibilityRole="button"
          accessibilityLabel="Thumbs up"
        >
          <Text style={[styles.icon, thumbState === 'up' && styles.iconActive]}>👍</Text>
        </TouchableOpacity>

        {/* Thumbs down */}
        <TouchableOpacity
          style={[styles.iconBtn, thumbState === 'down' && styles.iconBtnActive]}
          onPress={() => handleThumb('down')}
          accessibilityRole="button"
          accessibilityLabel="Thumbs down"
        >
          <Text style={[styles.icon, thumbState === 'down' && styles.iconActive]}>👎</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Share response">
          <Text style={styles.icon}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexWrap: 'wrap',
  },
  sourcesPill: {
    backgroundColor: '#f7f7f7',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sourcesText: {
    fontSize: 14,
    color: '#131313',
    fontWeight: '400',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 9999,
  },
  iconBtnActive: {
    backgroundColor: '#f0f0f0',
  },
  icon: {
    fontSize: 16,
    color: '#a5a5a5',
  },
  iconActive: {
    color: '#131313',
  },
});
