import React, { useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import { ExtractedBlock } from '../../types/block.types';
import { COLORS, BLOCK_TYPE_COLORS } from '../../constants/theme';
import { useVisualGrounding } from '../../hooks/useVisualGrounding';
import { DocumentPage } from '../../types/block.types';

interface SourceViewerProps {
  pages: DocumentPage[];
  currentPageIndex: number;
  blocks: ExtractedBlock[];
  selectedBlockId: string | null;
  onBlockTap: (block: ExtractedBlock) => void;
  onPageChange: (index: number) => void;
}

const VIEWER_HEIGHT = 340;

export function SourceViewer({
  pages,
  currentPageIndex,
  blocks,
  selectedBlockId,
  onBlockTap,
  onPageChange,
}: SourceViewerProps) {
  const { width } = useWindowDimensions();
  const page = pages[currentPageIndex];

  const { transformBbox, hitTest } = useVisualGrounding({
    imageWidth: page?.width ?? 1,
    imageHeight: page?.height ?? 1,
    containerWidth: width,
    containerHeight: VIEWER_HEIGHT,
  });

  const pageBlocks = blocks.filter((b) => b.pageIndex === currentPageIndex);

  const handleTap = (evt: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX, locationY } = evt.nativeEvent;
    const hits = hitTest(locationX, locationY, pageBlocks.map((b) => ({ id: b.id, bbox: b.bbox })));
    if (hits.length > 0) {
      const block = pageBlocks.find((b) => b.id === hits[0].id);
      if (block) onBlockTap(block);
    }
  };

  return (
    <View>
      <View style={[styles.imageContainer, { width, height: VIEWER_HEIGHT }]}>
        {page && (
          <Image
            source={{ uri: page.imageUri }}
            style={{ width, height: VIEWER_HEIGHT }}
            resizeMode="contain"
          />
        )}

        {/* Bounding box overlays */}
        <View
          style={StyleSheet.absoluteFill}
          onTouchEnd={handleTap}
        >
          {pageBlocks.map((block) => {
            const sb = transformBbox(block.bbox);
            const color = BLOCK_TYPE_COLORS[block.type] ?? COLORS.grey[400];
            const isSelected = block.id === selectedBlockId;

            return (
              <TouchableOpacity
                key={block.id}
                style={[
                  styles.bbox,
                  {
                    left: sb.x,
                    top: sb.y,
                    width: sb.width,
                    height: sb.height,
                    borderColor: color,
                    backgroundColor: isSelected ? color + '40' : color + '15',
                    borderWidth: isSelected ? 2 : 1,
                    opacity: selectedBlockId && !isSelected ? 0.3 : 1,
                  },
                ]}
                onPress={() => onBlockTap(block)}
                accessibilityLabel={`Block: ${block.type}`}
              />
            );
          })}
        </View>
      </View>

      {/* Page selector dots */}
      {pages.length > 1 && (
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onPageChange(i)}
              style={[styles.dot, i === currentPageIndex && styles.dotActive]}
              accessibilityRole="button"
              accessibilityLabel={`Page ${i + 1}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: { backgroundColor: COLORS.grey[900], position: 'relative' },
  bbox: { position: 'absolute', borderRadius: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.grey[300] },
  dotActive: { backgroundColor: COLORS.primary, width: 20 },
});
