import React from "react";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

interface CapsuleButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CapsuleButton(props: CapsuleButtonProps): React.JSX.Element {
  const { tokens } = useAppTheme();
  const variant = props.variant ?? "primary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={props.disabled}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && { backgroundColor: tokens.accent },
        variant === "secondary" && {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: tokens.border,
        },
        variant === "ghost" && { backgroundColor: tokens.surfaceMuted },
        props.disabled && { opacity: 0.45 },
        pressed && { opacity: 0.85 },
        props.style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: variant === "primary" ? tokens.onAccent : tokens.text },
        ]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
