import React, { useState, useRef, useEffect } from 'react';
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
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const isComplete = code.every((d) => d !== '');

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
    }
  };

  const handleContinue = async () => {
    if (!isComplete) return;
    await impact("Light");
    // TODO: validate OTP with API
    router.push('/auth/name');
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setCode(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    // TODO: resend OTP API call
  };

  const maskedPhone = phone
    ? `${phone.slice(0, 5)} xxxx${phone.slice(-1)}`
    : '82950 xxxx7';

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
            <ProgressDots step={1} />
          </View>

          {/* Heading */}
          <View style={styles.headingGroup}>
            <Text style={styles.heading}>6 Digit code</Text>
            <Text style={styles.subheading}>
              {'Please share code we sent\nto '}
              <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
            </Text>
          </View>

          {/* OTP boxes */}
          <View style={styles.otpSection}>
            <View style={styles.otpRow}>
              {code.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
                  ]}
                >
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    value={digit}
                    onChangeText={(t) => handleChange(t, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={styles.otpInput}
                    caretHidden
                    autoFocus={index === 0}
                    accessibilityLabel={`OTP digit ${index + 1}`}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0} accessibilityRole="button">
              <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !isComplete && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!isComplete}
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
  headingGroup: { gap: 16 },
  heading: { fontSize: 24, fontWeight: '600', color: '#131313', lineHeight: 24 * 1.4 },
  subheading: { fontSize: 16, color: '#a5a5a5', lineHeight: 16 * 1.45 },
  phoneHighlight: { color: '#131313', fontWeight: '500' },
  otpSection: { gap: 24 },
  otpRow: { flexDirection: 'row', gap: 6 },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxEmpty: { borderColor: '#ededed' },
  otpBoxFilled: { borderColor: '#a5bbfc' },
  otpInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
    height: '100%',
  },
  resendText: { fontSize: 14, color: '#8196f8', lineHeight: 14 * 1.5 },
  resendDisabled: { color: '#a5a5a5' },
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
