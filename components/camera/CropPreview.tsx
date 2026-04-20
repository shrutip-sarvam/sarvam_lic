import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/theme';

interface CropPreviewProps {
  imageUri: string;
  onConfirm: (uri: string) => void;
  onRetake: () => void;
}

export function CropPreview({ imageUri, onConfirm, onRetake }: CropPreviewProps) {
  const { width, height } = useWindowDimensions();
  const [isProcessing, setIsProcessing] = useState(true);

  React.useEffect(() => {
    // Simulate auto-edge detection delay
    const t = setTimeout(() => setIsProcessing(false), 1200);
    return () => clearTimeout(t);
  }, [imageUri]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={{ width, height: height * 0.75 }}
        resizeMode="contain"
        onLoad={() => setIsProcessing(false)}
      />

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator color={COLORS.white} size="large" />
          <Text style={styles.processingText}>Auto-detecting document edges...</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.retakeBtn]}
          onPress={onRetake}
          accessibilityRole="button"
          accessibilityLabel="Retake photo"
        >
          <Text style={styles.retakeText}>↩ Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.confirmBtn]}
          onPress={() => onConfirm(imageUri)}
          accessibilityRole="button"
          accessibilityLabel="Use this photo"
          disabled={isProcessing}
        >
          <Text style={styles.confirmText}>Use Photo ✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  processingText: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, padding: 24 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  retakeBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  retakeText: { color: COLORS.white, fontWeight: '600', fontSize: 15 },
  confirmBtn: { backgroundColor: COLORS.accent },
  confirmText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
