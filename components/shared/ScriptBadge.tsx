import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LANGUAGE_MAP } from '../../constants/languages';
import { SCRIPT_FAMILY_COLORS } from '../../constants/theme';

interface ScriptBadgeProps {
  languageCode: string;
}

export function ScriptBadge({ languageCode }: ScriptBadgeProps) {
  const lang = LANGUAGE_MAP[languageCode];
  if (!lang) return null;

  const color = SCRIPT_FAMILY_COLORS[lang.scriptFamily] ?? '#6B7280';

  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.text, { color }]}>{lang.script}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
