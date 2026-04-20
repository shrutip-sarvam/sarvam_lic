/**
 * Root entry — no landing gate. Open app → land on the Home dashboard.
 * Every click before "start new upload" is overhead the field agent
 * doesn't need, so we redirect as soon as Expo Router mounts the tree.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
