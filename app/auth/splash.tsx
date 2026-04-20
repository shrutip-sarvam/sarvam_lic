/**
 * Splash — fast, clean, matches Akshar aesthetic.
 * White background, simple wordmark. 1.2s max before redirecting.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { T, FONT, RADIUS } from '../../components/ui/tokens';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/auth/sign-in'), Platform.OS === 'web' ? 600 : 1000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.center}>
        <Text style={s.brand}>sarvam</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>for LIC</Text>
        </View>
      </View>
      <Text style={s.footer}>Document intelligence · powered by Sarvam AI</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: 10 },
  brand: { fontSize: 44, fontWeight: '800', color: T.text, letterSpacing: -1.2 },
  badge: { backgroundColor: T.orangeSoft, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 5 },
  badgeText: { ...FONT.small, color: T.orangeText, fontWeight: '700' },
  footer: { position: 'absolute', bottom: 44, ...FONT.tiny, color: T.textFaint, letterSpacing: 0.3 },
});
