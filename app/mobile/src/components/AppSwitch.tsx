import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

interface AppSwitchProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

export function AppSwitch(props: AppSwitchProps): React.JSX.Element {
  const { tokens } = useAppTheme();
  const on = props.value;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled: props.disabled }}
      disabled={props.disabled}
      onPress={() => props.onValueChange(!on)}
      style={[
        styles.track,
        {
          backgroundColor: on ? tokens.toggleTrackOn : tokens.toggleTrackOff,
          opacity: props.disabled ? 0.45 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.thumb,
          {
            alignSelf: on ? "flex-end" : "flex-start",
            backgroundColor: "#FFFFFF",
          },
        ]}
      />
    </Pressable>
  );
}

const TRACK_W = 48;
const TRACK_H = 28;
const THUMB = 22;

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
  },
});
