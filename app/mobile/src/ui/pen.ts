import type { TextStyle, ViewStyle } from "react-native";

/** Layout / type metrics aligned with `UI/nju-timetable.pen` (iPhone 390pt frames). */
export const PEN = {
  radiusCard: 14,
  radiusCardDense: 12,
  radiusPill: 15,
  radiusPillCta: 26,
  rowMinHeight: 56,
  rowCompactHeight: 52,
  gapSection: 16,
  gapMain: 18,
  gapTight: 12,
  gapList: 10,
  padH: 20,
};

export function penScrollContent(padBottom: number, denseTop = false): ViewStyle {
  return {
    paddingHorizontal: PEN.padH,
    paddingTop: denseTop ? 16 : 8,
    paddingBottom: padBottom,
    gap: denseTop ? 14 : PEN.gapMain,
  };
}

export function penSectionTitle(color: string, fontFamily?: string): TextStyle {
  return {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    color,
    fontFamily,
  };
}

export function penCard(surface: string, border: string, padding = 16): ViewStyle {
  return {
    borderRadius: PEN.radiusCard,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: surface,
    padding,
    gap: PEN.gapList,
  };
}

export function penRowChevron(color: string): TextStyle {
  return { fontSize: 18, color, fontWeight: "400" };
}
