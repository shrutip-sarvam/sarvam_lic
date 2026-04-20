import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LANGUAGE_MAP } from '../../constants/languages';
import { SCRIPT_FAMILY_COLORS } from '../../constants/theme';

interface LanguageChipProps {
  code: string;
  size?: 'sm' | 'md';
}

export function LanguageChip({ code, size = 'sm' }: LanguageChipProps) {
  const lang = LANGUAGE_MAP[code];
  if (!lang) return null;

  const bgColor = SCRIPT_FAMILY_COLORS[lang.scriptFamily] ?? '#6B7280';
  const isSmall = size === 'sm';

  return (
    <View style={[styles.chip, { backgroundColor: bgColor + '22', borderColor: bgColor }]}>
      <Text style={[styles.native, { color: bgColor, fontSize: isSmall ? 10 : 12 }]}>
        {lang.nativeName}
      </Text>
      <Text style={[styles.code, { fontSize: isSmall ? 9 : 10 }]}> · {lang.code}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  native: { fontWeight: '600' },
  code: { color: '#6B7280' },
});
