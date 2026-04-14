import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { removeExamHomework } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";

export default function ExamDetailScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ itemId: string }>();
  const item = useAppStore((s) => s.state.examHomework.find((x) => x.id === params.itemId));
  const [open, setOpen] = React.useState(false);

  if (!item) {
    return (
      <ScrollView style={{ backgroundColor: tokens.bg }}>
        <ScreenHeader title="详情" />
        <Text style={{ padding: 16, color: tokens.textSecondary }}>未找到记录</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.root, { backgroundColor: tokens.bg }]} contentContainerStyle={{ paddingBottom: 80 }}>
      <ScreenHeader title={item.title} />
      <Text style={{ padding: 16, color: tokens.textSecondary }}>
        {item.kind === "exam" ? "考试" : "作业"}
      </Text>
      <Text style={{ paddingHorizontal: 16, color: tokens.text }}>
        {JSON.stringify(item, null, 2)}
      </Text>
      <Text onPress={() => setOpen(true)} style={{ color: tokens.danger, fontWeight: "900", textAlign: "center", marginTop: 24 }}>
        删除本条记录
      </Text>
      <ConfirmDialog
        cancelLabel="取消"
        confirmLabel="删除"
        destructive
        message="此操作不可恢复。"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          removeExamHomework(item.id);
          router.back();
        }}
        title="确认删除？"
        visible={open}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
