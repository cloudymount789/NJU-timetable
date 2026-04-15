import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/theme/ThemeContext";

/** Bottom tabs matching `02 Week Timetable` → `tabWrap` / `pill` in `UI/nju-timetable.pen`. */
export function PillTabBar(props: BottomTabBarProps): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: tokens.bg }]}>
      <View style={[styles.pill, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        {props.state.routes.map((route, index) => {
          const { options = {} } = props.descriptors[route.key] ?? {};
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title !== undefined
                ? options.title
                : route.name;
          const isFocused = props.state.index === index;
          const onPress = (): void => {
            const event = props.navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              props.navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              key={route.key}
              onPress={onPress}
              style={[styles.segment, isFocused && { backgroundColor: tokens.accent }]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color: isFocused ? tokens.onAccent : tokens.textSecondary,
                    fontFamily: fonts.bold,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 21,
    paddingTop: 12,
  },
  pill: {
    flexDirection: "row",
    height: 62,
    borderRadius: 36,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
