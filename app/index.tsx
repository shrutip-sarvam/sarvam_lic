/**
 * Landing — full-screen Sarvam mandala over blue→orange gradient,
 * with "sarvam for LIC" and a Continue CTA. No white card panel.
 */
import React from 'react';
import {
  View, Text, StyleSheet, StatusBar, Image, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SARVAM_MONOGRAM_WHITE, SARVAM_WORDMARK_WHITE } from '../assets/sarvam-logo';
import { Icon } from '../components/ui/Icon';
import { SPACE, RADIUS, FONT } from '../components/ui/tokens';

const HERO_COLORS = ['#0A1530', '#142660', '#2E53A8', '#6C87C8', '#C9B89C', '#E89456', '#E8612A'] as const;
const HERO_LOCS   = [0,         0.18,      0.36,      0.52,      0.70,      0.86,      1] as const;

export default function LandingScreen() {
  const router = useRouter();
  const go = () => router.replace('/(tabs)');

  return (
    <Pressable style={s.root} onPress={go}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={HERO_COLORS}
        locations={HERO_LOCS}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.center}>
        <Image source={SARVAM_MONOGRAM_WHITE} style={s.mandala} resizeMode="contain" />
        <Image source={SARVAM_WORDMARK_WHITE} style={s.wordmark} resizeMode="contain" />
        <View style={s.licBadge}>
          <Text style={s.licBadgeText}>for LIC</Text>
        </View>
      </View>

      <View style={s.footer}>
        <Pressable style={s.cta} onPress={go}>
          <Text style={s.ctaText}>Continue</Text>
          <Icon name="arrow-right" size={16} color="#0A1530" strokeWidth={2.2} />
        </Pressable>
        <Text style={s.hint}>Document intelligence for LIC field agents</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1530' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACE.md },
  mandala: { width: 160, height: 160 },
  wordmark: { width: 220, height: 54 },
  licBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.34)',
    marginTop: 6,
  },
  licBadgeText: { ...FONT.body, color: '#fff', fontWeight: '700', letterSpacing: 0.3 },

  footer: {
    paddingHorizontal: SPACE.xl, paddingBottom: SPACE.xxl, alignItems: 'center', gap: SPACE.md,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 32, paddingVertical: 14,
    minWidth: 200, justifyContent: 'center',
  },
  ctaText: { color: '#0A1530', fontSize: 16, fontWeight: '700' },
  hint: { ...FONT.small, color: 'rgba(255,255,255,0.78)', letterSpacing: 0.2 },
});
