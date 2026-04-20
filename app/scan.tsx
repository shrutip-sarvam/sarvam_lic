/**
 * Camera Scanner Screen — full-screen camera with capture controls
 * Accessible via router.push('/scan')
 * On capture → encodes to base64 → returns to previous screen via router params
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const SCAN_FRAME = width * 0.85;

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturing, setCapturing] = useState(false);

  // Flash animation on capture
  const flashOpacity = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

  const handleCapture = useCallback(async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Flash effect
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 200 }),
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, base64: false });
      if (!photo) { setCapturing(false); return; }

      // Compress + resize for API
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );

      // Return base64 to parent via global event emitter pattern
      // Using router params (string) since expo-router doesn't pass binary
      if (manipulated.base64) {
        // Store in global for retrieval (avoids URL-length limits)
        (global as any).__scannedImageBase64 = manipulated.base64;
        (global as any).__scannedImageUri = manipulated.uri;
        router.back();
      }
    } catch (err) {
      console.error('Capture failed:', err);
    }
    setCapturing(false);
  }, [capturing, router, flashOpacity]);

  const toggleFacing = useCallback(() => {
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#131313" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionBody}>
          Allow camera access to scan documents and images.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelPermBtn} onPress={() => router.back()}>
          <Text style={styles.cancelPermText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      {/* Flash overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} pointerEvents="none" />

      {/* Semi-transparent mask with scan frame cutout */}
      <View style={styles.overlay} pointerEvents="none">
        {/* Top mask */}
        <View style={[styles.maskRow, { height: (height - SCAN_FRAME) / 2 - 40 }]} />
        <View style={styles.middleRow}>
          <View style={styles.maskSide} />
          {/* Scan frame */}
          <View style={styles.scanFrame}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.maskSide} />
        </View>
        {/* Bottom mask */}
        <View style={[styles.maskRow, { flex: 1 }]} />
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.topBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.scanHint}>Align document within frame</Text>
        <TouchableOpacity style={styles.topBtn} onPress={toggleFacing} accessibilityRole="button" accessibilityLabel="Flip camera">
          <Text style={styles.topBtnText}>⇄</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Capture button */}
      <View style={styles.captureRow}>
        <TouchableOpacity
          style={[styles.captureBtn, capturing && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={capturing}
          accessibilityRole="button"
          accessibilityLabel="Capture"
        >
          {capturing ? (
            <ActivityIndicator color="#131313" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject },
  maskRow: { backgroundColor: 'rgba(0,0,0,0.55)', width: '100%' },
  middleRow: { flexDirection: 'row', width: '100%' },
  maskSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  scanFrame: {
    width: SCAN_FRAME,
    height: SCAN_FRAME * 1.1,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#ffffff',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  flash: { backgroundColor: '#ffffff' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  scanHint: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  captureRow: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureBtnDisabled: { opacity: 0.5 },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#131313',
  },
  // Permission screen
  permissionScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: { fontSize: 22, fontWeight: '700', color: '#131313', textAlign: 'center' },
  permissionBody: { fontSize: 15, color: '#a5a5a5', textAlign: 'center', lineHeight: 22 },
  grantBtn: {
    backgroundColor: '#131313',
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  grantText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  cancelPermBtn: { paddingVertical: 10 },
  cancelPermText: { color: '#a5a5a5', fontSize: 15 },
});
