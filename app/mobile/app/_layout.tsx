import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createDefaultAppStorage } from "@/data/storage";
import { AppThemeProvider } from "@/theme/ThemeContext";
import { hydrateAppState, startPersistSubscription } from "@/state/persistence";
import { useAppStore } from "@/state/store";

export default function RootLayout(): React.JSX.Element {
  const hydrated = useAppStore((store) => store.hydrated);

  React.useEffect(() => {
    const storage = createDefaultAppStorage();
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      await hydrateAppState(storage);
      unsubscribe = startPersistSubscription(storage);
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="import" />
          <Stack.Screen name="courses" />
          <Stack.Screen name="calendar" />
          <Stack.Screen name="exams" />
          <Stack.Screen name="logs" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="todo/[todoId]" />
        </Stack>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
