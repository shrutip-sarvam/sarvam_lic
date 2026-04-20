import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { CaptureControls } from './CaptureControls';
import { EdgeDetector } from './EdgeDetector';
import { COLORS } from '../../constants/theme';

type FlashMode = 'off' | 'on' | 'auto';

interface CameraCaptureProps {
  onPhotoTaken: (uri: string) => void;
  onGalleryPick: () => void;
  pageCount: number;
  onAddPage?: () => void;
}

const CORNER_SIZE = 22;

export function CameraCapture({ onPhotoTaken, onGalleryPick, pageCount, onAddPage }: CameraCaptureProps) {
  const cameraRef = useRef<CameraView>(null);
  const [flashMode, setFlashMode] = useState<FlashMode>('auto');
  const { width, height } = useWindowDimensions();

  const overlayW = width * 0.85;
  const overlayH = height * 0.58;

  const cornerOpacity = useSharedValue(1);
  cornerOpacity.value = withRepeat(
    withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
    -1,
    false
  );
  const cornerStyle = useAnimatedStyle(() => ({ opacity: cornerOpacity.value }));

  const cycleFlash = () => {
    setFlashMode((prev) => (prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto'));
  };

  const capture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.92, base64: false });
      if (photo?.uri) onPhotoTaken(photo.uri);
    } catch {
      // Camera errors handled by parent
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flashMode}
      />

      {/* Grid overlay */}
      <View style={[styles.grid, { width, height }]} pointerEvents="none">
        <View style={[styles.gridLine, styles.gridH, { top: height / 3 }]} />
        <View style={[styles.gridLine, styles.gridH, { top: (height * 2) / 3 }]} />
        <View style={[styles.gridLine, styles.gridV, { left: width / 3 }]} />
        <View style={[styles.gridLine, styles.gridV, { left: (width * 2) / 3 }]} />
      </View>

      {/* Document frame overlay */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={[styles.frameOuter, { width: overlayW, height: overlayH }]}>
          {/* Animated corner brackets */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
            <Animated.View
              key={pos}
              style={[
                styles.corner,
                pos === 'tl' && styles.cornerTL,
                pos === 'tr' && styles.cornerTR,
                pos === 'bl' && styles.cornerBL,
                pos === 'br' && styles.cornerBR,
                cornerStyle,
              ]}
            >
              <View style={[styles.cornerH, { backgroundColor: COLORS.accent }]} />
              <View style={[styles.cornerV, { backgroundColor: COLORS.accent }]} />
            </Animated.View>
          ))}
        </View>

        <Text style={styles.hint}>Align document within frame</Text>
      </View>

      <EdgeDetector isActive />

      <View style={styles.controlsWrapper}>
        <CaptureControls
          onCapture={capture}
          onGallery={onGalleryPick}
          flashMode={flashMode}
          onFlashToggle={cycleFlash}
          pageCount={pageCount}
          onAddPage={onAddPage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  grid: { position: 'absolute' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)' },
  gridH: { left: 0, right: 0, height: StyleSheet.hairlineWidth },
  gridV: { top: 0, bottom: 0, width: StyleSheet.hairlineWidth },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frameOuter: { position: 'relative' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 10 },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: { top: 0, left: 0 },
  cornerTR: { top: 0, right: 0, transform: [{ scaleX: -1 }] },
  cornerBL: { bottom: 0, left: 0, transform: [{ scaleY: -1 }] },
  cornerBR: { bottom: 0, right: 0, transform: [{ scaleX: -1 }, { scaleY: -1 }] },
  cornerH: { position: 'absolute', top: 0, left: 0, width: CORNER_SIZE, height: 3, borderRadius: 2 },
  cornerV: { position: 'absolute', top: 0, left: 0, width: 3, height: CORNER_SIZE, borderRadius: 2 },
  controlsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
