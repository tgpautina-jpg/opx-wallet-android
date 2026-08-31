import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '../src/config/network';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: THEME.card },
          headerTintColor: THEME.accent,
          headerTitleStyle: { color: THEME.text, fontWeight: '700' },
          contentStyle: { backgroundColor: THEME.bg },
          headerShadowVisible: false
        }}
      />
    </>
  );
}
