import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ProcessingStep } from '../../hooks/useDocumentProcessor';
import { COLORS } from '../../constants/theme';

interface UploadProgressProps {
  step: ProcessingStep;
  stepLabel: string;
  progress: number;
  onCancel: () => void;
}

const STEPS: Array<{ step: ProcessingStep; label: string }> = [
  { step: 1, label: 'Extracting text and layout' },
  { step: 2, label: 'Detecting structure' },
  { step: 3, label: 'Applying corrections' },
  { step: 4, label: 'Preparing output' },
];

export function UploadProgress({ step, stepLabel, progress, onCancel }: UploadProgressProps) {
  const confirmCancel = () => {
    Alert.alert('Cancel Processing?', 'The document will not be processed.', [
      { text: 'Continue', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: onCancel },
    ]);
  };

  const eta = Math.max(5, Math.round(((100 - progress) / 100) * 45));

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Processing Document</Text>
        <Text style={styles.eta}>~{eta} seconds remaining</Text>

        <View style={styles.steps}>
          {STEPS.map((s) => {
            const done = s.step < step;
            const active = s.step === step;
            return (
              <View key={s.step} style={styles.stepRow}>
                <View style={[styles.stepDot, done && styles.stepDone, active && styles.stepActive]}>
                  {done ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : active ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.stepNum}>{s.step}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, done && styles.stepLabelDone, active && styles.stepLabelActive]}>
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Progress bar */}
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${progress}%` as `${number}%` }]} />
        </View>
        <Text style={styles.pct}>{progress}%</Text>

        <TouchableOpacity style={styles.cancelBtn} onPress={confirmCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: '86%', gap: 14 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  eta: { fontSize: 12, color: COLORS.grey[500], textAlign: 'center' },
  steps: { gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.grey[200],
    alignItems: 'center', justifyContent: 'center',
  },
  stepDone: { backgroundColor: COLORS.success },
  stepActive: { backgroundColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  stepNum: { color: COLORS.grey[500], fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 13, color: COLORS.grey[400] },
  stepLabelDone: { color: COLORS.grey[500], textDecorationLine: 'line-through' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: COLORS.grey[200], borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  pct: { textAlign: 'right', fontSize: 11, color: COLORS.grey[500] },
  cancelBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: COLORS.grey[300] },
  cancelText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },
});
