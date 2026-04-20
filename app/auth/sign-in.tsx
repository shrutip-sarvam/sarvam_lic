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

// Progress dots — step 1 of 3
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

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleContinue = async () => {
    if (!isValid) return;
    await impact("Light");
    router.push({ pathname: '/auth/otp', params: { phone } });
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
            <ProgressDots step={0} />
          </View>

          {/* Heading */}
          <View style={styles.headingGroup}>
            <Text style={styles.heading}>Get started</Text>
            <Text style={styles.subheading}>
              Please share your mobile number to create your account
            </Text>
          </View>

          {/* Phone input row */}
          <View style={styles.inputRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Mobile number"
              placeholderTextColor="#b5b5b5"
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
              accessibilityLabel="Mobile number input"
            />
          </View>
        </View>

        {/* Continue button — dark radial pill */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!isValid}
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
  headingGroup: { gap: 12 },
  heading: { fontSize: 24, fontWeight: '600', color: '#131313', lineHeight: 24 * 1.4 },
  subheading: { fontSize: 16, color: '#a5a5a5', lineHeight: 16 * 1.45, width: 268 },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  countryCode: {
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryText: { fontSize: 20, fontWeight: '600', color: '#131313', letterSpacing: 0.1 },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 999,
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
