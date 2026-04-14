import { Link, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { sortExamHomework } from "@nju/domain";

export default function ExamsScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const items = useAppStore((s) => sortExamHomework(s.state.examHomework));

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader
        right={
          <CapsuleButton label="新建" onPress={() => router.push("/exams/new")} />
        }
        title="考试与作业"
      />
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: tokens.textSecondary, textAlign: "center", marginTop: 24 }}>暂无记录</Text>
        }
        renderItem={({ item }) => (
          <Link asChild href={`/exams/${item.id}`}>
            <Pressable style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
              <Text style={{ color: tokens.text, fontWeight: "900" }}>{item.title}</Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, marginTop: 6 }}>
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
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
});
