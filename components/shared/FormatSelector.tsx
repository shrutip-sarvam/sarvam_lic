import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OutputFormat } from '../../types/block.types';
import { COLORS } from '../../constants/theme';

interface FormatSelectorProps {
  value: OutputFormat;
  onChange: (format: OutputFormat) => void;
}

const FORMATS: Array<{ value: OutputFormat; label: string; icon: string }> = [
  { value: 'html', label: 'HTML', icon: '</>' },
  { value: 'json', label: 'JSON', icon: '{}' },
  { value: 'markdown', label: 'Markdown', icon: '#' },
];

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <View style={styles.container}>
      {FORMATS.map((f) => {
        const active = f.value === value;
        return (
          <TouchableOpacity
            key={f.value}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => onChange(f.value)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${f.label} format`}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.icon, active && styles.iconActive]}>{f.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{f.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: COLORS.grey[100], borderRadius: 10, padding: 3 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8 },
  btnActive: { backgroundColor: COLORS.white },
  icon: { fontSize: 12, color: COLORS.grey[500], fontFamily: 'monospace' },
  iconActive: { color: COLORS.primary },
  label: { fontSize: 13, color: COLORS.grey[500], fontWeight: '500' },
  labelActive: { color: COLORS.primary, fontWeight: '700' },
});
