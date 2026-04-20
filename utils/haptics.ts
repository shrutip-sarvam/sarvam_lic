import { Platform } from 'react-native';

// Safe haptics wrapper — no-op on web
export async function impact(style: 'Light' | 'Medium' | 'Heavy' = 'Light') {
  if (Platform.OS === 'web') return;
  const Haptics = await import('expo-haptics');
  const styleMap = {
    Light: Haptics.ImpactFeedbackStyle.Light,
    Medium: Haptics.ImpactFeedbackStyle.Medium,
    Heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };
  await Haptics.impactAsync(styleMap[style]);
}
