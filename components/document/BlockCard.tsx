import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { ExtractedBlock, BlockType } from '../../types/block.types';
import { BLOCK_TYPE_COLORS, COLORS } from '../../constants/theme';
import { LanguageChip } from '../shared/LanguageChip';
import { ScriptBadge } from '../shared/ScriptBadge';
import { RTL_LANGUAGE_CODES } from '../../constants/languages';

interface BlockCardProps {
  block: ExtractedBlock;
  index: number;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const BlockCard = React.memo(function BlockCard({
  block,
  index,
  isSelected,
  onPress,
  onLongPress,
}: BlockCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = BLOCK_TYPE_COLORS[block.type] ?? COLORS.grey[400];
  const isRtl = RTL_LANGUAGE_CODES.includes(block.language);

  const confidencePct = Math.round(block.confidence * 100);
  const confidenceColor =
    confidencePct >= 80 ? COLORS.success : confidencePct >= 50 ? COLORS.warning : COLORS.error;

  const accessLabel = `Block ${index + 1}, ${block.type}, ${block.content.substring(0, 50)}`;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && { borderColor: color, borderWidth: 2 }]}
      onPress={() => { onPress(); setExpanded((e) => !e); }}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      accessibilityLabel={accessLabel}
      accessibilityRole="button"
    >
      <View style={styles.row}>
        {/* Index badge */}
        <View style={[styles.indexBadge, { backgroundColor: isSelected ? color : COLORS.grey[200] }]}>
          <Text style={[styles.indexText, { color: isSelected ? COLORS.white : COLORS.grey[600] }]}>
            {index + 1}
          </Text>
        </View>

        <View style={styles.main}>
          {/* Type badge + language */}
          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: color + '22', borderColor: color }]}>
              <Text style={[styles.typeText, { color }]}>{block.type.replace('_', ' ')}</Text>
            </View>
            <LanguageChip code={block.language} />
          </View>

          {/* Content */}
          <Text
            style={[styles.content, isRtl && styles.rtl]}
            numberOfLines={expanded ? undefined : 3}
          >
            {block.content}
          </Text>

          {/* Image caption */}
          {block.type === BlockType.IMAGE && block.imageCaption && (
            <Text style={styles.caption}>🤖 Caption: {block.imageCaption}</Text>
          )}

          {/* Confidence bar */}
          <View style={styles.confRow}>
            <View style={styles.confTrack}>
              <View style={[styles.confFill, { width: `${confidencePct}%` as `${number}%`, backgroundColor: confidenceColor }]} />
            </View>
            <Text style={[styles.confText, { color: confidenceColor }]}>{confidencePct}%</Text>
          </View>
        </View>

        <ScriptBadge languageCode={block.language} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 5,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  indexBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  indexText: { fontSize: 12, fontWeight: '700' },
  main: { flex: 1, gap: 6 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  typeBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1,
  },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  content: { fontSize: 13, color: COLORS.grey[800], lineHeight: 18 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  caption: { fontSize: 12, color: COLORS.grey[500], fontStyle: 'italic' },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confTrack: { flex: 1, height: 3, backgroundColor: COLORS.grey[200], borderRadius: 2, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 2 },
  confText: { fontSize: 10, fontWeight: '600', width: 30 },
});
