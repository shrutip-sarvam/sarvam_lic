/**
 * Landing — Akshar-for-LIC front page.
 *
 * Full-bleed navy→orange hero with the Akshar mandala, "Akshar" wordmark,
 * a "for LIC" badge, and a Continue CTA. Tapping anywhere on the page, or
 * the Continue pill, lands the agent on the Home dashboard.
 *
 * This is the first impression of the app — branded enough to feel like
 * a Sarvam product, but a single tap away from the real work.
 */
import React from 'react';
import {
  View, Text, StyleSheet, StatusBar, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { AKSHAR_LOGO_SVG } from '../assets/akshar-logo';
import { Icon } from '../components/ui/Icon';
import { SPACE, RADIUS, FONT_FAMILY } from '../components/ui/tokens';

// Navy at top, orange at bottom — mirrors the Akshar marketing gradient.
const HERO_COLORS = ['#0A1530', '#142660', '#2E53A8', '#6C87C8', '#C9B89C', '#E89456', '#E8612A'] as const;
const HERO_LOCS = [0, 0.18, 0.36, 0.52, 0.70, 0.86, 1] as const;

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
        <SvgXml xml={AKSHAR_LOGO_SVG} width={160} height={160} color="#FFFFFF" />
        <Text style={s.wordmark}>Akshar</Text>
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
  wordmark: {
    color: '#FFFFFF',
    fontSize: 56,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: '500',
    letterSpacing: -1.5,
    marginTop: 4,
  },
  licBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
    marginTop: 6,
  },
  licBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  footer: {
    paddingHorizontal: SPACE.xl,
    paddingBottom: SPACE.xxl,
    alignItems: 'center',
    gap: SPACE.md,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minWidth: 200,
    justifyContent: 'center',
  },
  ctaText: {
    color: '#0A1530',
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
  },
  hint: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});
