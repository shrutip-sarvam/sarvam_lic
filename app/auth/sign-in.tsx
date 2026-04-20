import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { impact } from '../../utils/haptics';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleContinue = async () => {
    if (!isValid) return;
    await impact('Light');
    router.push({ pathname: '/auth/otp', params: { phone } });
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.content}>
          <View style={s.brandRow}>
            <Text style={s.brand}>sarvam</Text>
            <View style={s.badge}><Text style={s.badgeText}>for LIC</Text></View>
          </View>

          <View style={{ gap: SPACE.sm }}>
            <Text style={s.heading}>Sign in</Text>
            <Text style={s.sub}>Enter your mobile number to continue</Text>
          </View>

          <View style={s.inputRow}>
            <View style={s.countryCode}><Text style={s.countryText}>+91</Text></View>
            <TextInput
              style={s.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Mobile number"
              placeholderTextColor={T.textFaint}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>
        </View>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.continueBtn, !isValid && s.continueDisabled]}
            onPress={handleContinue}
            disabled={!isValid}
            activeOpacity={0.88}
          >
            <Text style={s.continueText}>Continue</Text>
            <Icon name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={s.terms}>
            By continuing, you agree to Sarvam's Terms & Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  content: { flex: 1, paddingHorizontal: SPACE.xl, paddingTop: SPACE.xl, gap: SPACE.xxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  brand: { fontSize: 28, fontWeight: '800', color: T.text, letterSpacing: -0.8 },
  badge: { backgroundColor: T.orangeSoft, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { ...FONT.tiny, color: T.orangeText, fontWeight: '700' },

  heading: { ...FONT.h1, color: T.text },
  sub: { ...FONT.body, color: T.textMuted },

  inputRow: { flexDirection: 'row', gap: SPACE.sm, alignItems: 'center' },
  countryCode: {
    borderWidth: 1, borderColor: T.border, borderRadius: RADIUS.pill,
    paddingHorizontal: 20, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  countryText: { fontSize: 17, fontWeight: '600', color: T.text },
  phoneInput: {
    flex: 1, borderWidth: 1, borderColor: T.border, borderRadius: RADIUS.pill,
    paddingHorizontal: 20, height: 52,
    fontSize: 17, fontWeight: '500', color: T.text,
  },

  footer: { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.xl, gap: SPACE.md },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.dark, borderRadius: RADIUS.pill, height: 54,
  },
  continueDisabled: { backgroundColor: T.textFaint },
  continueText: { color: '#fff', ...FONT.bodyStrong, fontSize: 16 },
  terms: { ...FONT.tiny, color: T.textFaint, textAlign: 'center', paddingHorizontal: 16 },
});
