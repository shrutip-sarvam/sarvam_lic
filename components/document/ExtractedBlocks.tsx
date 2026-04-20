import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ExtractedBlock, BlockType } from '../../types/block.types';
import { BlockCard } from './BlockCard';
import { COLORS } from '../../constants/theme';

type FilterType = 'all' | BlockType;

const FILTERS: Array<{ label: string; value: FilterType }> = [
  { label: 'All', value: 'all' },
  { label: 'Headers', value: BlockType.HEADER },
  { label: 'Paragraphs', value: BlockType.PARAGRAPH },
  { label: 'Tables', value: BlockType.TABLE },
  { label: 'Images', value: BlockType.IMAGE },
];

interface ExtractedBlocksProps {
  blocks: ExtractedBlock[];
  selectedBlockId: string | null;
  onBlockSelect: (block: ExtractedBlock) => void;
  onBlockLongPress: (block: ExtractedBlock) => void;
  onExport: () => void;
}

export function ExtractedBlocks({
  blocks,
  selectedBlockId,
  onBlockSelect,
  onBlockLongPress,
  onExport,
}: ExtractedBlocksProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = blocks.filter((b) => {
    const matchesType = filter === 'all' || b.type === filter;
    const matchesSearch =
      search.trim().length === 0 ||
      b.content.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const langDistribution = blocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.language] = (acc[b.language] ?? 0) + 1;
    return acc;
  }, {});

  const renderBlock = useCallback(
    ({ item, index }: { item: ExtractedBlock; index: number }) => (
      <BlockCard
        block={item}
        index={index}
        isSelected={item.id === selectedBlockId}
        onPress={() => onBlockSelect(item)}
        onLongPress={() => onBlockLongPress(item)}
      />
    ),
    [selectedBlockId, onBlockSelect, onBlockLongPress]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.count}>{blocks.length} blocks detected</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={onExport} accessibilityRole="button" accessibilityLabel="Export document">
          <Text style={styles.exportText}>Export ↑</Text>
        </TouchableOpacity>
      </View>

      {/* Language chips */}
      <View style={styles.langRow}>
        {Object.entries(langDistribution).map(([code, cnt]) => (
          <View key={code} style={styles.langPill}>
            <Text style={styles.langText}>{code} ·{cnt}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search blocks..."
        placeholderTextColor={COLORS.grey[400]}
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search blocks"
      />

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${f.label}`}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlashList
        data={filtered}
        renderItem={renderBlock}
        keyExtractor={(b) => b.id}
        estimatedItemSize={120}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No blocks match your search.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  count: { fontSize: 13, color: COLORS.grey[600], fontWeight: '600' },
  exportBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  exportText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  langPill: { backgroundColor: COLORS.grey[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  langText: { fontSize: 11, color: COLORS.grey[600] },
  search: {
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    fontSize: 14,
    color: COLORS.grey[800],
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 6 },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: COLORS.grey[100] },
  filterActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 12, color: COLORS.grey[600], fontWeight: '500' },
  filterTextActive: { color: COLORS.white, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: COLORS.grey[400], fontSize: 14 },
});
