/**
 * Visual tokens sourced from `UI/nju-timetable.pen` theme variables (light / dark).
 * Accent is driven by app settings; defaults align with pen `theme.accent` (light: #ff6347).
 */
export type AppearanceName = "light" | "dark";

export interface ThemeTokens {
  appearance: AppearanceName;
  bg: string;
  surface: string;
  surfaceMuted: string;
  wash: string;
  border: string;
  chrome: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  tertiary: string;
  textTimetable: string;
  accent: string;
  onAccent: string;
  danger: string;
  toggleTrackOff: string;
  toggleTrackOn: string;
  glass: string;
  divider: string;
  gridLine: string;
  courseTitle: string;
  courseSubtitle: string;
  courseRing: string;
  /** @deprecated Prefer courseRing; kept for a few legacy call sites */
  glassBorder: string;
  glassHighlight: string;
}

/** Pastel translucent fills — pen uses trailing `8C` (~55% alpha) on material hues */
const COURSE_FILL: Record<string, { light: string; dark: string }> = {
  "course.slate": { light: "#78909C8C", dark: "#78909C99" },
  "course.blue": { light: "#BBDEFB8C", dark: "#BBDEFB99" },
  "course.teal": { light: "#80DEEA8C", dark: "#80DEEA99" },
  "course.green": { light: "#90CAF98C", dark: "#90CAF999" },
  "course.olive": { light: "#DCE7758C", dark: "#DCE77599" },
  "course.amber": { light: "#FFE0828C", dark: "#FFE08299" },
  "course.rose": { light: "#F48FB18C", dark: "#F48FB199" },
  "course.purple": { light: "#D1C4E98C", dark: "#D1C4E999" },
};

export function resolveCoursePaint(token: string, appearance: AppearanceName): { fill: string } {
  const swatch = COURSE_FILL[token] ?? COURSE_FILL["course.slate"]!;
  return { fill: appearance === "light" ? swatch.light : swatch.dark };
}

export function buildThemeTokens(appearance: AppearanceName, accentHex: string): ThemeTokens {
  if (appearance === "dark") {
    return {
      appearance,
      bg: "#090A0E",
      surface: "#13151C",
      surfaceMuted: "#1E232F",
      wash: "#1A1F2C",
      border: "#242733",
      chrome: "#1B2030",
      text: "#F2F3F7",
      textSecondary: "#8F93A1",
      textMuted: "#9BA1B0",
      tertiary: "#5E6372",
      textTimetable: "#F2F3F7",
      accent: accentHex,
      onAccent: "#FAFBFF",
      danger: "#E57373",
      toggleTrackOff: "#252B38",
      toggleTrackOn: accentHex,
      glass: "#14181ED9",
      divider: "#FFFFFF14",
      gridLine: "#FFFFFF22",
      courseTitle: "#10131C",
      courseSubtitle: "#343948",
      courseRing: "#FFFFFF4A",
      glassBorder: "#FFFFFF4A",
      glassHighlight: "#FFFFFF0F",
    };
  }

  return {
    appearance,
    bg: "#F2F2F7",
    surface: "#FFFFFF",
    surfaceMuted: "#F7F7F8",
    wash: "#F9F9FA",
    border: "#D1D1D6",
    chrome: "#E5E5EA",
    text: "#1D1D1F",
    textSecondary: "#636366",
    textMuted: "#3C3C43",
    tertiary: "#C7C7CC",
    textTimetable: "#1D1D1F",
    accent: accentHex,
    onAccent: "#FFFFFF",
    danger: "#D64545",
    toggleTrackOff: "#E9E9EA",
    toggleTrackOn: accentHex,
    glass: "#FFFFFFA6",
    divider: "#C7C7CC40",
    gridLine: "#FFFFFF44",
    courseTitle: "#151824",
    courseSubtitle: "#3D4356",
    courseRing: "#FFFFFF99",
    glassBorder: "#FFFFFF99",
    glassHighlight: "#FFFFFF55",
  };
}
