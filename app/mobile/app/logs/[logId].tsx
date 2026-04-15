import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { HeroHeader } from "@/components/HeroHeader";
import { PenHeaderChip } from "@/components/PenHeaderChip";
import { patchLog, removeLog } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN, penCard, penScrollContent, penSectionTitle } from "@/ui/pen";

export default function LogEditorScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
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
        <HeroHeader title="日志" />
        <Text style={{ color: tokens.textSecondary, padding: 20, fontSize: 14 }}>未找到日志</Text>
      </View>
    );
  }

  const save = (): void => {
    patchLog(entry.id, { title, body });
    setEditing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader
        right={
          <PenHeaderChip
            label={editing ? "完成" : "编辑"}
            onPress={() => {
              if (editing) {
                save();
              } else {
                setEditing(true);
              }
            }}
            variant={editing ? "primary" : "outline"}
          />
        }
        title="日志"
      />
      <ScrollView contentContainerStyle={penScrollContent(120)}>
        <Text style={{ color: tokens.textSecondary, fontSize: 12, fontFamily: fonts.regular }}>
          记录时间：{entry.createdAt}
        </Text>
        <Text style={{ color: tokens.textSecondary, fontSize: 12, fontFamily: fonts.regular }}>
          最近更新：{entry.updatedAt}
        </Text>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>标题</Text>
        <View style={penCard(tokens.surface, tokens.border, 12)}>
          <TextInput
            editable={editing}
            onChangeText={setTitle}
            placeholderTextColor={tokens.textSecondary}
            style={[
              styles.input,
              {
                borderColor: tokens.border,
                color: tokens.text,
                backgroundColor: tokens.wash,
                fontFamily: fonts.regular,
              },
            ]}
            value={title}
          />
        </View>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>正文</Text>
        <View style={penCard(tokens.surface, tokens.border, 12)}>
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
                backgroundColor: tokens.wash,
                minHeight: 220,
                textAlignVertical: "top",
                fontFamily: fonts.regular,
              },
            ]}
            value={body}
          />
        </View>

        <Pressable
          onPress={() => setOpen(true)}
          style={[
            styles.delOutline,
            { borderColor: tokens.border, backgroundColor: tokens.surface },
          ]}
        >
          <Text
            style={{
              color: tokens.danger,
              fontWeight: "600",
              fontFamily: fonts.semibold,
              textAlign: "center",
            }}
          >
            删除日志
          </Text>
        </Pressable>
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
  input: { borderWidth: 1, borderRadius: PEN.radiusCardDense, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  delOutline: {
    borderRadius: PEN.radiusCardDense,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
  },
});
