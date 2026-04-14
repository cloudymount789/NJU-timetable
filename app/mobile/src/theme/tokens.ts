export type AppearanceName = "light" | "dark";

export interface ThemeTokens {
  appearance: AppearanceName;
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textSecondary: string;
  textTimetable: string;
  accent: string;
  danger: string;
  toggleTrackOff: string;
  toggleTrackOn: string;
  glassBorder: string;
  glassHighlight: string;
}

const MORANDI_SWATCH: Record<string, { light: string; dark: string }> = {
  "course.slate": { light: "#8B9AAB", dark: "#9DADB8" },
  "course.blue": { light: "#7FA4B8", dark: "#8FB4C4" },
  "course.teal": { light: "#6FA6A0", dark: "#7FB6B0" },
  "course.green": { light: "#8BA88E", dark: "#9BB89E" },
  "course.olive": { light: "#9AA37A", dark: "#AAB38A" },
  "course.amber": { light: "#C6A676", dark: "#D6B686" },
  "course.rose": { light: "#C8959A", dark: "#D8A5AA" },
  "course.purple": { light: "#9B8FBF", dark: "#AB9FCF" },
};

export function resolveCoursePaint(
  token: string,
  appearance: AppearanceName,
): { fill: string; text: string } {
  const swatch = MORANDI_SWATCH[token] ?? MORANDI_SWATCH["course.slate"]!;
  const fill = appearance === "light" ? swatch.light : swatch.dark;
  const text = appearance === "light" ? "#1F2933" : "#0F1720";
  return { fill, text };
}

export function buildThemeTokens(appearance: AppearanceName, accentHex: string): ThemeTokens {
  if (appearance === "dark") {
    return {
      appearance,
      bg: "#0F1419",
      surface: "#161C24",
      surfaceMuted: "#1E2630",
      border: "#2A3441",
      text: "#E8EDF2",
      textSecondary: "#9AA7B2",
      textTimetable: "#F2F6FA",
      accent: accentHex,
      danger: "#E57373",
      toggleTrackOff: "#2F3A46",
      toggleTrackOn: accentHex,
      glassBorder: "rgba(255,255,255,0.12)",
      glassHighlight: "rgba(255,255,255,0.06)",
    };
  }

  return {
    appearance,
    bg: "#F4F6F8",
    surface: "#FFFFFF",
    surfaceMuted: "#EEF1F4",
    border: "#E1E6EB",
    text: "#1F2933",
    textSecondary: "#6B7785",
    textTimetable: "#1F2933",
    accent: accentHex,
    danger: "#D64545",
    toggleTrackOff: "#D5DADF",
    toggleTrackOn: accentHex,
    glassBorder: "rgba(15,20,25,0.08)",
    glassHighlight: "rgba(255,255,255,0.65)",
  };
}
