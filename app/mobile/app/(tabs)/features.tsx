import { Link } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

const ITEMS = [
  { href: "/calendar" as const, title: "日历", desc: "学期总览 / 重要日（工程版）" },
  { href: "/exams" as const, title: "考试与作业", desc: "列表、详情、联动待办（工程版）" },
  { href: "/logs" as const, title: "日志", desc: "记录学习与生活" },
  { href: "/settings" as const, title: "设置 / 外观", desc: "主题、课表管理、显示开关" },
];

export default function FeaturesTab(): React.JSX.Element {
  const { tokens } = useAppTheme();

  return (
    <ScrollView style={[styles.root, { backgroundColor: tokens.bg }]} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      <Text style={{ color: tokens.text, fontSize: 22, fontWeight: "900" }}>功能</Text>
      <Text style={{ color: tokens.textSecondary, lineHeight: 20 }}>
        底部仅保留「课表 / 功能 / 待办」。待办入口在底部 Tab；此处聚合其他模块。
      </Text>
      {ITEMS.map((item) => (
        <Link asChild href={item.href} key={item.href}>
          <Pressable style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
            <Text style={{ color: tokens.text, fontWeight: "900", fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: tokens.textSecondary, marginTop: 6, fontSize: 12 }}>{item.desc}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
});
