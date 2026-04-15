import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { HeroHeader } from "@/components/HeroHeader";
import { removeExamHomework } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN, penCard, penScrollContent } from "@/ui/pen";

export default function ExamDetailScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ itemId: string }>();
  const item = useAppStore((s) => s.state.examHomework.find((x) => x.id === params.itemId));
  const [open, setOpen] = React.useState(false);

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.bg }}>
        <HeroHeader title="详情" />
        <Text style={{ padding: 20, color: tokens.textSecondary, fontSize: 14 }}>未找到记录</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader title="详情" />
      <ScrollView contentContainerStyle={penScrollContent(80)}>
        <View style={penCard(tokens.surface, tokens.border, 16)}>
          <Text style={{ color: tokens.text, fontSize: 17, fontWeight: "600", fontFamily: fonts.semibold }}>
            {item.title}
          </Text>
          <Text style={{ color: tokens.textSecondary, fontSize: 13, fontFamily: fonts.regular }}>
            {item.kind === "exam" ? "考试" : "作业"}
          </Text>
          <Text
            style={{
              color: tokens.text,
              fontSize: 13,
              fontFamily: fonts.regular,
              lineHeight: 18,
            }}
          >
            {JSON.stringify(item, null, 2)}
          </Text>
        </View>

        <View
          style={[
            styles.delBtn,
            { borderColor: tokens.border, backgroundColor: tokens.surface },
          ]}
        >
          <Text
            onPress={() => setOpen(true)}
            style={{
              color: tokens.danger,
              fontWeight: "600",
              fontSize: 15,
              fontFamily: fonts.semibold,
              textAlign: "center",
            }}
          >
            删除本条记录
          </Text>
        </View>
      </ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  delBtn: {
    borderRadius: PEN.radiusCardDense,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 12,
  },
});
