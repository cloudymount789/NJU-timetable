import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { HeroHeader } from "@/components/HeroHeader";
import { PenHubRow } from "@/components/PenHubRow";
import { useAppTheme } from "@/theme/ThemeContext";
import { penScrollContent } from "@/ui/pen";

const ROUTES = [
  { path: "/calendar" as const, label: "日历", fontSize: 16 },
  { path: "/exams" as const, label: "考试与作业", fontSize: 15 },
  { path: "/logs" as const, label: "日志", fontSize: 16 },
  { path: "/settings" as const, label: "设置", fontSize: 16 },
];

export default function FeaturesTab(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader showBack={false} title="功能" />
      <ScrollView contentContainerStyle={[penScrollContent(40, true), { paddingTop: 4 }]}>
        {ROUTES.map((item) => (
          <PenHubRow
            key={item.path}
            fontSize={item.fontSize}
            label={item.label}
            onPress={() => router.push(item.path)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
