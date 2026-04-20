import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ label, active }: { label: string; active: boolean }) {
  const icons: Record<string, string> = {
    index: '📋',
    settings: '⚙️',
  };
  return (
    <View style={tabStyles.wrap}>
      <Text style={[tabStyles.icon, active && tabStyles.activeIcon]}>{icons[label] ?? '●'}</Text>
      {active && <View style={tabStyles.dot} />}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  icon: { fontSize: 22, opacity: 0.4 },
  activeIcon: { opacity: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#131313' },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#131313',
        tabBarInactiveTintColor: '#b5b5b5',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="index" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="settings" active={focused} />,
        }}
      />
      {/* Hidden from tab bar but accessible */}
      <Tabs.Screen name="camera" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
    </Tabs>
  );
}
