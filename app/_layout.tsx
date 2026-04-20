import React from 'react';
import { Platform, Text, ScrollView } from 'react-native';

// Only polyfill on native — crashes on web
if (Platform.OS !== 'web') {
  require('react-native-get-random-values');
}

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { FONT_FAMILY } from '../components/ui/tokens';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000 } },
});

// Wire Geist as the default font across every <Text> so styling never has to
// repeat the font-family. Matches akshar-frontend's `--font-geist-sans` default.
const DefaultText: any = Text;
const prevTextDefaults = DefaultText.defaultProps || {};
DefaultText.defaultProps = {
  ...prevTextDefaults,
  style: [
    { fontFamily: FONT_FAMILY.regular, color: '#262626' },
    prevTextDefaults.style,
  ],
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#c00', marginTop: 60 }}>
            App crashed — error details:
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 13, color: '#333', marginTop: 12 }}>
            {String(this.state.error)}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  // Render with system fonts until Geist finishes loading — exactly what
  // the Akshar web stack does via font-display:swap. Avoid blocking paint
  // so the app stays snappy on first visit / cold start.
  void fontsLoaded;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="auth/sign-in" />
            <Stack.Screen name="auth/otp" />
            <Stack.Screen name="auth/name" />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="job/camera"
              options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', headerShown: false }}
            />
            <Stack.Screen
              name="job/scan"
              options={{ animation: 'fade', headerShown: false }}
            />
            <Stack.Screen
              name="job/form"
              options={{ animation: 'slide_from_right', headerShown: false }}
            />
            <Stack.Screen
              name="job/upload"
              options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
            />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
