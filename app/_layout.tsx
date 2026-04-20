import React from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';

// Only polyfill on native — crashes on web
if (Platform.OS !== 'web') {
  require('react-native-get-random-values');
}

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000 } },
});

// Catch render errors so we see them instead of a blank white page
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
            <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
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
