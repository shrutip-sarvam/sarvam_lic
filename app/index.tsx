import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getSarvamLogoUri } from '../assets/sarvam-logo';

const LAYERS = [
  '#E06020', '#E87030', '#F08840', '#F4A055',
  '#ECC090', '#D8C0C0', '#C0C8E0', '#C5D5F5',
];

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(tabs)'), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#E06020" translucent />

      {/* Gradient */}
      <View style={StyleSheet.absoluteFill}>
        {LAYERS.map((color, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </View>

      {/* Centered stacked wordmark */}
      <View style={s.center}>
        {/* Exact Sarvam SVG logo in circular frame */}
        <View style={s.logoFrame}>
          <Image
            source={{ uri: getSarvamLogoUri('#ffffff', 1) }}
            style={s.logo}
            resizeMode="contain"
          />
        </View>

        {/* sarvam · for · lic stacked */}
        <View style={s.wordStack}>
          <Text style={s.word1}>sarvam</Text>
          <Text style={s.wordFor}>for</Text>
          <Text style={s.word2}>lic</Text>
        </View>

        {/* Tagline */}
        <Text style={s.tagline}>Field Agent · AI-Powered OCR</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 90,
    height: 89,
  },
  wordStack: {
    alignItems: 'center',
    marginBottom: 20,
  },
  word1: {
    fontSize: 58,
    fontWeight: '800',
    fontFamily: 'serif',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 62,
    textAlign: 'center',
  },
  wordFor: {
    fontSize: 32,
    fontWeight: '300',
    fontFamily: 'serif',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 6,
    lineHeight: 40,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  word2: {
    fontSize: 72,
    fontWeight: '800',
    fontFamily: 'serif',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 76,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});
