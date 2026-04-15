import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN, penRowChevron } from "@/ui/pen";

/** Single-line 56pt row with › chevron — `12 Functions Hub` list rows in Pencil. */
export function PenHubRow(props: {
  label: string;
  onPress: () => void;
  fontSize?: number;
}): React.JSX.Element {
  const { tokens } = useAppTheme();
  const fs = props.fontSize ?? 16;
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.row,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        },
      ]}
    >
      <Text style={{ color: tokens.text, fontSize: fs, fontWeight: "400" }}>{props.label}</Text>
      <Text style={penRowChevron(tokens.tertiary)}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: PEN.rowMinHeight,
    borderRadius: PEN.radiusCard,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
