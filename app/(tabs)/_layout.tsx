import { Stack } from 'expo-router';

/**
 * Uses a Stack (not Tabs) because Akshar mobile has no bottom nav —
 * just a top bar + content. Legacy screens (settings/camera/chat) are hidden.
 */
export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
