import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSessionStore } from './src/state/useSessionStore';
import { detectDeviceLanguage } from './src/i18n';
import { applyLanguage } from './src/i18n/applyLanguage';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const language = useSessionStore((s) => s.language);
  const setLanguage = useSessionStore((s) => s.setLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    const resolvedLanguage = language ?? detectDeviceLanguage();
    if (!language) {
      setLanguage(resolvedLanguage);
    }

    let cancelled = false;
    applyLanguage(resolvedLanguage).finally(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
