import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { impact } from '../../utils/haptics';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleContinue = async () => {
    if (!name.trim()) return;
    await impact('Medium');
    router.replace('/(tabs)');
  };

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
          <Text style={s.heading}>What's your name?</Text>
          <Text style={s.sub}>We'll use this on your account and documents.</Text>

          <TextInput
            style={s.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rajesh Kumar"
            placeholderTextColor={T.textFaint}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.continueBtn, !name.trim() && s.continueDisabled]}
            onPress={handleContinue}
            disabled={!name.trim()}
            activeOpacity={0.88}
          >
            <Text style={s.continueText}>Get Started</Text>
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
  content: { flex: 1, paddingHorizontal: SPACE.xl, gap: SPACE.lg },
  heading: { ...FONT.h1, color: T.text },
  sub: { ...FONT.body, color: T.textMuted, lineHeight: 20 },
  nameInput: {
    borderWidth: 1, borderColor: T.border, borderRadius: RADIUS.pill,
    paddingHorizontal: 20, height: 52,
    fontSize: 17, fontWeight: '500', color: T.text,
    marginTop: SPACE.sm,
  },
  footer: { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.xl },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.dark, borderRadius: RADIUS.pill, height: 54,
  },
  continueDisabled: { backgroundColor: T.textFaint },
  continueText: { color: '#fff', ...FONT.bodyStrong, fontSize: 16 },
});
