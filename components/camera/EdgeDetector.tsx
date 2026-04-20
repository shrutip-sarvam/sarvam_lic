import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';

interface EdgeDetectorProps {
  isActive: boolean;
}

type DetectionState = 'scanning' | 'detected' | 'align';

export function EdgeDetector({ isActive }: EdgeDetectorProps) {
  const [state, setState] = useState<DetectionState>('align');
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!isActive) return;

    setState('scanning');
    opacity.value = withRepeat(withTiming(0.4, { duration: 600 }), -1, true);

    // Simulate detection after ~1.5 s for a natural feel
    const timer = setTimeout(() => {
      setState('detected');
      opacity.value = 1;
    }, 1500);

    return () => clearTimeout(timer);
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const statusConfig: Record<DetectionState, { label: string; color: string }> = {
    scanning: { label: '🔍 Scanning...', color: COLORS.warning },
    detected: { label: '✓ Document detected', color: COLORS.success },
    align: { label: 'Align document within frame', color: COLORS.white },
  };

  const { label, color } = statusConfig[state];

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.pill, { borderColor: color }, animStyle]}>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  label: { fontSize: 13, fontWeight: '600' },
});
