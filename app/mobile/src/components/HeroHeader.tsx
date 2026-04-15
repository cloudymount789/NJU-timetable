import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN } from "@/ui/pen";

/** Large title row like `Geist` 28 / 700 in Pencil (`导入课表`, `功能`, `全部课程`, …). */
export function HeroHeader(props: {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showBack = props.showBack ?? true;

  return (
    <View style={{ paddingTop: insets.top + 4, paddingBottom: 12 }}>
      <View style={[styles.row, { paddingHorizontal: PEN.padH }]}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons color={tokens.text} name="chevron-back" size={18} />
          </Pressable>
        ) : null}
        <Text
          style={[styles.title, { color: tokens.text, fontFamily: fonts.bold }]}
          numberOfLines={1}
        >
          {props.title}
        </Text>
        <View style={styles.right}>{props.right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  back: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
  },
  right: {
    minWidth: 28,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
