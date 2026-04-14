import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { patchLog, removeLog } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";

export default function LogEditorScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ logId: string }>();
  const entry = useAppStore((s) => s.state.logs.find((l) => l.id === params.logId));

  const [title, setTitle] = React.useState(entry?.title ?? "");
  const [body, setBody] = React.useState(entry?.body ?? "");
  const [editing, setEditing] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!entry) {
      return;
    }
    setTitle(entry.title);
    setBody(entry.body);
  }, [entry?.id, entry?.title, entry?.body]);

  if (!entry || !params.logId) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.bg }]}>
        <ScreenHeader title="日志" />
        <Text style={{ color: tokens.textSecondary, padding: 16 }}>未找到日志</Text>
      </View>
    );
  }

  const save = (): void => {
    patchLog(entry.id, { title, body });
    setEditing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader
        right={
          <CapsuleButton
            label={editing ? "完成" : "编辑"}
            onPress={() => {
              if (editing) {
                save();
              } else {
                setEditing(true);
              }
            }}
          />
        }
        title="日志"
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}>
        <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>记录时间：{entry.createdAt}</Text>
        <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>最近更新：{entry.updatedAt}</Text>

        <Text style={{ color: tokens.text, fontWeight: "900" }}>标题</Text>
        <TextInput
          editable={editing}
          onChangeText={setTitle}
          placeholderTextColor={tokens.textSecondary}
          style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.surface }]}
          value={title}
        />

        <Text style={{ color: tokens.text, fontWeight: "900" }}>正文</Text>
        <TextInput
          editable={editing}
          multiline
          onChangeText={setBody}
          placeholderTextColor={tokens.textSecondary}
          style={[
            styles.input,
            {
              borderColor: tokens.border,
              color: tokens.text,
              backgroundColor: tokens.surface,
              minHeight: 200,
              textAlignVertical: "top",
            },
          ]}
          value={body}
        />

        <Text onPress={() => setOpen(true)} style={{ color: tokens.danger, fontWeight: "900", textAlign: "center" }}>
          删除日志
        </Text>
      </ScrollView>

      <ConfirmDialog
        cancelLabel="取消"
        confirmLabel="删除"
        destructive
        message="此操作不可恢复。"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          removeLog(entry.id);
          router.back();
        }}
        title="确认删除日志？"
        visible={open}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
});
