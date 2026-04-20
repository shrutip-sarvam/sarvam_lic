import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS } from '../../constants/theme';
import { BlockType } from '../../types/block.types';

type CorrectionScope = 'full' | 'page' | 'type';

interface CorrectionPanelProps {
  onApply: (instruction: string, scope: string) => Promise<void>;
  onClose: () => void;
  isApplying: boolean;
  appliedCount?: number;
  totalCount?: number;
}

const SUGGESTED_CHIPS = [
  'Fix Indic script errors',
  'Standardise table formatting',
  'Remove headers/footers',
  'Correct reading order',
  'Fix line breaks in paragraphs',
  'Caption all images',
];

const BLOCK_TYPE_OPTIONS = Object.values(BlockType);
const MAX_CHARS = 500;

export function CorrectionPanel({
  onApply,
  onClose,
  isApplying,
  appliedCount,
  totalCount,
}: CorrectionPanelProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['60%', '90%'];

  const [instruction, setInstruction] = useState('');
  const [scope, setScope] = useState<CorrectionScope>('full');
  const [selectedType, setSelectedType] = useState<BlockType>(BlockType.PARAGRAPH);

  const buildScope = () => {
    if (scope === 'full') return 'full';
    if (scope === 'page') return 'page:0';
    return `type:${selectedType}`;
  };

  const handleApply = async () => {
    if (!instruction.trim()) return;
    await onApply(instruction.trim(), buildScope());
  };

  const appendChip = (chip: string) => {
    setInstruction((prev) => (prev ? `${prev}. ${chip}` : chip));
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Apply Correction</Text>
        <Text style={styles.subtitle}>
          Describe what to change — the agent will apply it to all matching blocks
        </Text>

        {/* Instruction input */}
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={3}
          maxLength={MAX_CHARS}
          placeholder={`e.g. Fix all Hindi spelling errors · Convert all dates to DD/MM/YYYY · Remove all page numbers`}
          placeholderTextColor={COLORS.grey[400]}
          value={instruction}
          onChangeText={setInstruction}
          accessibilityLabel="Correction instruction"
        />
        <Text style={styles.charCount}>{instruction.length}/{MAX_CHARS}</Text>

        {/* Scope selector */}
        <Text style={styles.sectionLabel}>Apply to</Text>
        <View style={styles.scopeRow}>
          {(['full', 'page', 'type'] as CorrectionScope[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.scopeBtn, scope === s && styles.scopeBtnActive]}
              onPress={() => setScope(s)}
              accessibilityRole="radio"
              accessibilityState={{ checked: scope === s }}
            >
              <Text style={[styles.scopeText, scope === s && styles.scopeTextActive]}>
                {s === 'full' ? 'Entire document' : s === 'page' ? 'Current page' : 'Block type'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {scope === 'type' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {BLOCK_TYPE_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, selectedType === t && styles.typeBtnActive]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={[styles.typeText, selectedType === t && styles.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Suggested chips */}
        <Text style={styles.sectionLabel}>Suggested</Text>
        <View style={styles.chipsRow}>
          {SUGGESTED_CHIPS.map((chip) => (
            <TouchableOpacity key={chip} style={styles.chip} onPress={() => appendChip(chip)}>
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress feedback */}
        {isApplying && appliedCount !== undefined && totalCount !== undefined && (
          <View style={styles.progress}>
            <Text style={styles.progressText}>Updated {appliedCount} of {totalCount} blocks...</Text>
          </View>
        )}

        {/* Apply button */}
        <TouchableOpacity
          style={[styles.applyBtn, (!instruction.trim() || isApplying) && styles.applyBtnDisabled]}
          onPress={handleApply}
          disabled={!instruction.trim() || isApplying}
          accessibilityRole="button"
          accessibilityLabel="Apply correction with agent"
        >
          {isApplying ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.applyText}>Apply with Agent</Text>
          )}
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: COLORS.white },
  handle: { backgroundColor: COLORS.grey[300] },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.grey[500], lineHeight: 18 },
  input: {
    borderWidth: 1, borderColor: COLORS.grey[200], borderRadius: 12,
    padding: 12, fontSize: 14, color: COLORS.grey[800],
    minHeight: 90, textAlignVertical: 'top',
  },
  charCount: { textAlign: 'right', fontSize: 11, color: COLORS.grey[400] },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.grey[500], textTransform: 'uppercase', letterSpacing: 0.8 },
  scopeRow: { flexDirection: 'row', gap: 8 },
  scopeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.grey[200], alignItems: 'center' },
  scopeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '11' },
  scopeText: { fontSize: 12, color: COLORS.grey[500] },
  scopeTextActive: { color: COLORS.primary, fontWeight: '700' },
  typeScroll: { marginTop: 4 },
  typeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: COLORS.grey[200], marginRight: 6 },
  typeBtnActive: { borderColor: COLORS.indigo, backgroundColor: COLORS.indigo + '11' },
  typeText: { fontSize: 11, color: COLORS.grey[500] },
  typeTextActive: { color: COLORS.indigo, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: COLORS.grey[100] },
  chipText: { fontSize: 12, color: COLORS.grey[700] },
  progress: { backgroundColor: COLORS.success + '15', borderRadius: 8, padding: 10 },
  progressText: { color: COLORS.success, fontSize: 13, fontWeight: '600' },
  applyBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  applyBtnDisabled: { opacity: 0.5 },
  applyText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
