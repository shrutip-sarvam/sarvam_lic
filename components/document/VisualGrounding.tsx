import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { ExtractedBlock } from '../../types/block.types';
import { BLOCK_TYPE_COLORS } from '../../constants/theme';
import { useVisualGrounding } from '../../hooks/useVisualGrounding';

interface VisualGroundingProps {
  blocks: ExtractedBlock[];
  selectedBlockId: string | null;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  onBlockTap: (block: ExtractedBlock) => void;
}

function BlockOverlay({
  block,
  isSelected,
  hasSelection,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  onTap,
}: {
  block: ExtractedBlock;
  isSelected: boolean;
  hasSelection: boolean;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  onTap: () => void;
}) {
  const { transformBbox } = useVisualGrounding({ imageWidth, imageHeight, containerWidth, containerHeight });
  const sb = transformBbox(block.bbox);
  const color = BLOCK_TYPE_COLORS[block.type] ?? '#6B7280';

  const targetOpacity = isSelected ? 0.7 : hasSelection ? 0.05 : 0.1;

  const animStyle = useAnimatedStyle(() => ({
    opacity: withTiming(targetOpacity, { duration: 300 }),
    borderWidth: isSelected ? 2 : 1,
  }));

  return (
    <Animated.View
      style={[
        styles.block,
        {
          left: sb.x,
          top: sb.y,
          width: sb.width,
          height: sb.height,
          borderColor: color,
          backgroundColor: color + '40',
        },
        animStyle,
      ]}
    >
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onTap} accessibilityRole="button" accessibilityLabel={`Select ${block.type} block`} />
    </Animated.View>
  );
}

export function VisualGrounding({
  blocks,
  selectedBlockId,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  onBlockTap,
}: VisualGroundingProps) {
  const hasSelection = selectedBlockId !== null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {blocks.map((block) => (
        <BlockOverlay
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          hasSelection={hasSelection}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          onTap={() => onBlockTap(block)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { position: 'absolute', borderRadius: 2 },
});
