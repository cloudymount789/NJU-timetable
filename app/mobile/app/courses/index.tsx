import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { HeroHeader } from "@/components/HeroHeader";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN } from "@/ui/pen";
import type { Course } from "@nju/contracts";

export default function AllCoursesScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const selectedId = useAppStore((s) => s.state.selectedTimetableId);
  const courses = useAppStore((s) => s.state.courses.filter((c) => c.timetableId === selectedId));

  const renderItem = ({ item }: { item: Course }): React.JSX.Element => (
    <Link asChild href={`/courses/${item.id}`}>
      <Pressable style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.semibold }]}>{item.title}</Text>
        <Text style={[styles.meta, { color: tokens.textSecondary, fontFamily: fonts.regular }]}>
          {formatCourseMeta(item)}
        </Text>
      </Pressable>
    </Link>
  );

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader
        right={
          <Link href="/courses/new" asChild>
            <Pressable hitSlop={10} accessibilityLabel="新增课程">
              <Ionicons color={tokens.text} name="add" size={22} />
            </Pressable>
          </Link>
        }
        title="全部课程"
      />
      <FlatList
        contentContainerStyle={[
          {
            paddingHorizontal: PEN.padH,
            paddingTop: 8,
            paddingBottom: 32,
            gap: PEN.gapList,
          },
        ]}
        data={courses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Text style={{ color: tokens.textSecondary, fontSize: 14, fontFamily: fonts.regular }}>
              包含未显示在课表上的课程
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={{ color: tokens.textSecondary, textAlign: "center", marginTop: 24, fontSize: 14 }}>
            暂无课程，先在「课表」导入或手动添加。
          </Text>
        }
        renderItem={renderItem}
        ListFooterComponent={
          <Text
            style={{
              color: tokens.textSecondary,
              fontSize: 12,
              marginTop: 12,
              fontFamily: fonts.regular,
            }}
          >
            点击课程可进入课程详情页
          </Text>
        }
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
    borderRadius: PEN.radiusCard,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 12, lineHeight: 16 },
});
