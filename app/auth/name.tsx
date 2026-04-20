import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { impact } from '../../utils/haptics';

function ProgressDots({ step }: { step: number }) {
  return (
    <View style={dots.row}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            dots.dot,
            i === step ? dots.active : dots.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const dots = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 100 },
  active: { width: 40, backgroundColor: '#a5bbfc' },
  inactive: { width: 4, height: 4, backgroundColor: 'rgba(165,187,252,0.75)' },
});

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleContinue = async () => {
    if (!name.trim()) return;
    await impact("Medium");
    // TODO: save name to backend/store
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Back + progress */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <ProgressDots step={2} />
          </View>

          {/* Heading */}
          <View style={styles.headingGroup}>
            <Text style={styles.heading}>Your Name</Text>
          </View>

          {/* Name input */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Eg: Rupesh"
              placeholderTextColor="#b5b5b5"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              accessibilityLabel="Name input"
            />
          </View>
        </View>

        {/* Continue button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !name.trim() && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!name.trim()}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <LinearGradient
              colors={['#353535', '#242424', '#131313', '#242424', '#353535']}
              style={[StyleSheet.absoluteFill, styles.continueBtnGradient]}
            />
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, gap: 32 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 28, color: '#131313', lineHeight: 32 },
  headingGroup: {},
  heading: { fontSize: 24, fontWeight: '600', color: '#131313', lineHeight: 24 * 1.4 },
  inputWrap: {},
  nameInput: {
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
    letterSpacing: 0.1,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  continueBtn: {
    borderRadius: 999,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  continueBtnGradient: { borderRadius: 999 },
  continueBtnDisabled: { opacity: 0.35 },
  continueText: { fontSize: 16, color: '#ffffff', fontWeight: '400' },
  continueArrow: { fontSize: 18, color: '#ffffff' },
});
