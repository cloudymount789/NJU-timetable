import { Link } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { Course } from "@nju/contracts";

export default function AllCoursesScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const selectedId = useAppStore((s) => s.state.selectedTimetableId);
  const courses = useAppStore((s) => s.state.courses.filter((c) => c.timetableId === selectedId));

  const renderItem = ({ item }: { item: Course }): React.JSX.Element => (
    <Link asChild href={`/courses/${item.id}`}>
      <Pressable style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.title, { color: tokens.text }]}>{item.title}</Text>
        <Text style={[styles.meta, { color: tokens.textSecondary }]}>
          {formatCourseMeta(item)}
        </Text>
      </Pressable>
    </Link>
  );

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader
        right={
          <Link asChild href="/courses/new">
            <Pressable hitSlop={8}>
              <Text style={{ color: tokens.accent, fontWeight: "800" }}>新增</Text>
            </Pressable>
          </Link>
        }
        title="全部课程"
      />
      <FlatList
        contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 32 }}
        data={courses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: tokens.textSecondary, textAlign: "center", marginTop: 24 }}>
            暂无课程，先在「课表」导入或手动添加。
          </Text>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

function formatCourseMeta(course: Course): string {
  const teacher = course.teacher?.trim() ? course.teacher : "教师待定";
  const room = course.classroom?.trim() ? course.classroom : "教室待定";
  const day = ["一", "二", "三", "四", "五", "六", "日"][course.weekday - 1] ?? "";
  return `周${day} 第${course.startPeriod}-${course.endPeriod}节 · ${room} · ${teacher}`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  title: { fontSize: 16, fontWeight: "800" },
  meta: { marginTop: 6, fontSize: 12, lineHeight: 16 },
});
