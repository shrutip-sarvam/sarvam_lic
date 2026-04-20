import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';

type FlashMode = 'off' | 'on' | 'auto';

interface CaptureControlsProps {
  onCapture: () => void;
  onGallery: () => void;
  flashMode: FlashMode;
  onFlashToggle: () => void;
  pageCount: number;
  onAddPage?: () => void;
}

const FLASH_ICONS: Record<FlashMode, string> = {
  auto: '⚡A',
  on: '⚡',
  off: '⚡✕',
};

export function CaptureControls({
  onCapture,
  onGallery,
  flashMode,
  onFlashToggle,
  pageCount,
  onAddPage,
}: CaptureControlsProps) {
  const scale = useSharedValue(1);

  const animatedShutter = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleCapture = async () => {
    scale.value = withSequence(withTiming(0.85, { duration: 80 }), withTiming(1, { duration: 120 }));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCapture();
  };

  return (
    <View style={styles.container}>
      {pageCount > 0 && (
        <View style={styles.pageBar}>
          <Text style={styles.pageText}>Page {pageCount} captured</Text>
          {onAddPage && (
            <TouchableOpacity onPress={onAddPage} style={styles.addPageBtn}>
              <Text style={styles.addPageText}>+ Add page</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={onGallery}
          style={styles.sideBtn}
          accessibilityLabel="Open gallery"
          accessibilityRole="button"
        >
          <Text style={styles.sideBtnIcon}>🖼</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.shutterOuter, animatedShutter]}>
          <TouchableOpacity
            onPress={handleCapture}
            style={styles.shutterInner}
            accessibilityRole="button"
            accessibilityLabel="Capture photo"
            accessibilityHint="Double tap to capture document photo"
          />
        </Animated.View>

        <TouchableOpacity
          onPress={onFlashToggle}
          style={styles.sideBtn}
          accessibilityLabel={`Flash mode: ${flashMode}`}
          accessibilityRole="button"
        >
          <Text style={styles.sideBtnText}>{FLASH_ICONS[flashMode]}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32, paddingTop: 12, backgroundColor: 'rgba(0,0,0,0.6)' },
  pageBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12, gap: 12 },
  pageText: { color: COLORS.white, fontSize: 14 },
  addPageBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  addPageText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 24 },
  shutterOuter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.white },
  sideBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  sideBtnIcon: { fontSize: 22 },
  sideBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 11 },
});
