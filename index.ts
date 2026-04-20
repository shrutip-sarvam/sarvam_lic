// Polyfill crypto.getRandomValues for native only (not needed on web/Vercel)
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native-get-random-values');
}

import 'expo-router/entry';
