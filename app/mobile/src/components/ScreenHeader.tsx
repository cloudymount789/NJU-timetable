import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/theme/ThemeContext";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader(props: ScreenHeaderProps): React.JSX.Element {
  const { tokens } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showBack = props.showBack ?? true;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6, borderBottomColor: tokens.border }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons color={tokens.text} name="chevron-back" size={22} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={[styles.title, { color: tokens.text }]} numberOfLines={1}>
          {props.title}
        </Text>
        <View style={styles.right}>{props.right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
    gap: 4,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: {
    width: 36,
    height: 36,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
  right: {
    minWidth: 36,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
