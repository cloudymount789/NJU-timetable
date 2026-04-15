import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN } from "@/ui/pen";

type Ion = React.ComponentProps<typeof Ionicons>["name"];

/** 30pt-tall header chips from Pencil (`待办` / `我的日志` toolbars). */
export function PenHeaderChip(props: {
  label: string;
  onPress: () => void;
  variant: "outline" | "primary";
  icon?: Ion;
}): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const outline = props.variant === "outline";
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.chip,
        outline
          ? { backgroundColor: tokens.surface, borderColor: tokens.border }
          : { backgroundColor: tokens.accent, borderColor: tokens.accent },
      ]}
    >
      {props.icon ? (
        <Ionicons color={outline ? tokens.text : tokens.onAccent} name={props.icon} size={14} />
      ) : null}
      <Text
        style={{
          color: outline ? tokens.text : tokens.onAccent,
          fontSize: 12,
          fontFamily: fonts.regular,
        }}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    height: 30,
    paddingHorizontal: 10,
    borderRadius: PEN.radiusPill,
    borderWidth: 1,
    gap: 4,
  },
});
