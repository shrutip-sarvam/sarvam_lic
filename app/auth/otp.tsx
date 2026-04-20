import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar,
  NativeSyntheticEvent, TextInputKeyPressEventData,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { impact } from '../../utils/haptics';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));

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
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...code]; next[index - 1] = ''; setCode(next);
    }
  };

  const handleContinue = async () => {
    if (!isComplete) return;
    await impact('Light');
    router.push('/auth/name');
  };

  const maskedPhone = phone ? `+91 ${phone.slice(0, 5)} xxxx${phone.slice(-1)}` : '+91 82950 xxxx7';

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
            <Icon name="chevron-left" size={22} color={T.text} />
          </TouchableOpacity>
        </View>

        <View style={s.content}>
          <Text style={s.heading}>Enter verification code</Text>
          <Text style={s.sub}>
            We sent a 6-digit code to <Text style={s.phoneHi}>{maskedPhone}</Text>
          </Text>

          <View style={s.otpRow}>
            {code.map((digit, i) => (
              <View key={i} style={[s.otpBox, digit ? s.otpBoxFilled : s.otpBoxEmpty]}>
                <TextInput
                  ref={(r) => { inputRefs.current[i] = r; }}
                  value={digit}
                  onChangeText={(t) => handleChange(t, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={s.otpInput}
                  caretHidden
                  autoFocus={i === 0}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => { if (resendCooldown === 0) { setResendCooldown(30); setCode(Array(CODE_LENGTH).fill('')); inputRefs.current[0]?.focus(); } }} disabled={resendCooldown > 0}>
            <Text style={[s.resend, resendCooldown > 0 && { color: T.textMuted }]}>
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.continueBtn, !isComplete && s.continueDisabled]}
            onPress={handleContinue}
            disabled={!isComplete}
            activeOpacity={0.88}
          >
            <Text style={s.continueText}>Continue</Text>
            <Icon name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  topBar: { paddingHorizontal: SPACE.md, paddingVertical: SPACE.md },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: SPACE.xl, gap: SPACE.xl },
  heading: { ...FONT.h1, color: T.text },
  sub: { ...FONT.body, color: T.textMuted, lineHeight: 20 },
  phoneHi: { color: T.text, fontWeight: '600' },

  otpRow: { flexDirection: 'row', gap: 8, marginTop: SPACE.md },
  otpBox: {
    flex: 1, height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  otpBoxEmpty: { borderColor: T.border },
  otpBoxFilled: { borderColor: T.dark, backgroundColor: T.bgMuted },
  otpInput: { width: '100%', textAlign: 'center', fontSize: 22, fontWeight: '700', color: T.text, height: '100%' },

  resend: { ...FONT.small, color: T.blue, fontWeight: '600', alignSelf: 'flex-start' },

  footer: { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.xl },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.dark, borderRadius: RADIUS.pill, height: 54,
  },
  continueDisabled: { backgroundColor: T.textFaint },
  continueText: { color: '#fff', ...FONT.bodyStrong, fontSize: 16 },
});
