import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createDefaultAppStorage } from "@/data/storage";
import { AppThemeProvider } from "@/theme/ThemeContext";
import { hydrateAppState, startPersistSubscription } from "@/state/persistence";
import { useAppStore } from "@/state/store";

const loadingBg = "#F2F2F7";

export default function RootLayout(): React.JSX.Element {
  const hydrated = useAppStore((store) => store.hydrated);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

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

  if (!hydrated || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: loadingBg,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppThemeProvider
        fonts={{
          regular: "Inter_400Regular",
          semibold: "Inter_600SemiBold",
          bold: "Inter_700Bold",
        }}
      >
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
