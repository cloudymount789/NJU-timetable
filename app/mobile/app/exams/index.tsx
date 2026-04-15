import { Link, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { HeroHeader } from "@/components/HeroHeader";
import { PenHeaderChip } from "@/components/PenHeaderChip";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN } from "@/ui/pen";
import { sortExamHomework } from "@nju/domain";

export default function ExamsScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const router = useRouter();
  const items = useAppStore((s) => sortExamHomework(s.state.examHomework));

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader
        right={<PenHeaderChip icon="add" label="新建" onPress={() => router.push("/exams/new")} variant="primary" />}
        title="考试与作业"
      />
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: PEN.padH,
          paddingTop: 8,
          paddingBottom: 40,
          gap: PEN.gapList,
        }}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: tokens.textSecondary, textAlign: "center", marginTop: 24, fontSize: 14 }}>
            暂无记录
          </Text>
        }
        ListFooterComponent={
          <Text
            style={{
              color: tokens.textSecondary,
              fontSize: 13,
              marginTop: 8,
              fontFamily: fonts.regular,
            }}
          >
            排序：截止时间 ↑
          </Text>
        }
        renderItem={({ item }) => (
          <Link asChild href={`/exams/${item.id}`}>
            <Pressable style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
              <Text style={{ color: tokens.text, fontWeight: "600", fontSize: 16, fontFamily: fonts.semibold }}>
                {item.title}
              </Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, marginTop: 6, fontFamily: fonts.regular }}>
                {`${item.kind === "exam" ? "考试" : "作业"}${
                  item.exam?.dateTime ? ` · ${item.exam.dateTime}` : ""
                }`}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, borderRadius: PEN.radiusCard, padding: 16 },
});
