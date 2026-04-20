import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { SARVAM_MONOGRAM_WHITE, SARVAM_WORDMARK_WHITE } from '../../assets/sarvam-logo';

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.82);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(12);

  useEffect(() => {
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(200, withTiming(1, { duration: 700 }));
    wordmarkOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    wordmarkY.value = withDelay(500, withTiming(0, { duration: 500 }));
    const timer = setTimeout(() => router.replace('/auth/sign-in'), 2600);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#040810', '#0a1530', '#142660', '#1e4090', '#4878c8', '#a8c4e8', '#ddb890', '#e87828']}
        locations={[0, 0.12, 0.25, 0.40, 0.56, 0.70, 0.84, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.center}>
        <Animated.View style={[s.logoWrap, logoStyle]}>
          <Image source={SARVAM_MONOGRAM_WHITE} style={s.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.View style={[s.wordmarkWrap, wordmarkStyle]}>
          <Image source={SARVAM_WORDMARK_WHITE} style={s.wordmark} resizeMode="contain" />
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: 24 },
  logoWrap: {},
  logo: { width: 120, height: 120 },
  wordmarkWrap: {},
  wordmark: { width: 200, height: 48 },
});
