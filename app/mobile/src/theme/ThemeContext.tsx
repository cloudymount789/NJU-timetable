import type { AppSettings } from "@nju/contracts";
import React from "react";
import { useColorScheme, type ColorSchemeName } from "react-native";
import { useAppStore } from "@/state/store";
import { type AppearanceName, type ThemeTokens, buildThemeTokens } from "./tokens";

export interface ThemeContextValue {
  appearance: AppearanceName;
  tokens: ThemeTokens;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function resolveAppearance(settings: AppSettings, system: ColorSchemeName): AppearanceName {
  const sys = system === "dark" ? "dark" : "light";
  if (settings.followSystem || settings.themeMode === "system") {
    return sys === "dark" ? "dark" : "light";
  }
  return settings.themeMode === "dark" ? "dark" : "light";
}

export function AppThemeProvider(props: { children: React.ReactNode }): React.JSX.Element {
  const settings = useAppStore((store) => store.state.settings);
  const systemScheme = useColorScheme();
  const appearance = resolveAppearance(settings, systemScheme);
  const tokens = React.useMemo(
    () => buildThemeTokens(appearance, settings.accentColor),
    [appearance, settings.accentColor],
  );

  const value = React.useMemo(() => ({ appearance, tokens }), [appearance, tokens]);

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return ctx;
}
