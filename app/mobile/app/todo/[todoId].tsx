import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { patchTodo, removeTodo } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { Todo } from "@nju/contracts";
import { nowIso } from "@nju/domain";

export default function TodoDetailScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ todoId: string }>();
  const todoId = params.todoId;

  const todo = useAppStore((s) => s.state.todos.find((t) => t.id === todoId));

  const [title, setTitle] = React.useState(todo?.title ?? "");
  const [body, setBody] = React.useState(todo?.body ?? "");
  const [place, setPlace] = React.useState(todo?.place ?? "");
  const [kind, setKind] = React.useState<Todo["kind"]>(todo?.kind ?? "plain");
  const [importance, setImportance] = React.useState<Todo["importance"]>(todo?.importance ?? 2);
  const [remind, setRemind] = React.useState(todo?.remind ?? false);
  const [startAt, setStartAt] = React.useState(todo?.startAt ?? "");
  const [endAt, setEndAt] = React.useState(todo?.endAt ?? "");
  const [dueAt, setDueAt] = React.useState(todo?.dueAt ?? "");
  const [progressText, setProgressText] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!todo) {
      return;
    }
    setTitle(todo.title);
    setBody(todo.body ?? "");
    setPlace(todo.place ?? "");
    setKind(todo.kind);
    setImportance(todo.importance);
    setRemind(todo.remind);
    setStartAt(todo.startAt ?? "");
    setEndAt(todo.endAt ?? "");
    setDueAt(todo.dueAt ?? "");
  }, [todo?.id, todo]);

  if (!todo || !todoId) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.bg }]}>
        <ScreenHeader title="待办详情" />
        <Text style={{ color: tokens.textSecondary, padding: 16 }}>未找到待办。</Text>
      </View>
    );
  }

  const save = (): void => {
    const s = startAt.trim();
    const e = endAt.trim();
    const d = dueAt.trim();
    patchTodo(todoId, {
      title,
      body,
      place,
      kind,
      importance,
      remind,
      ...(kind === "duration" && s ? { startAt: s } : {}),
      ...(kind === "duration" && e ? { endAt: e } : {}),
      ...(kind === "ddl" && d ? { dueAt: d } : {}),
    });
    router.back();
  };

  const appendProgress = (): void => {
    const text = progressText.trim();
    if (!text) {
      return;
    }
    const latest = useAppStore.getState().state.todos.find((t) => t.id === todoId);
    if (!latest) {
      return;
    }
    patchTodo(todoId, {
      progress: [...latest.progress, { at: nowIso(), text }],
    });
    setProgressText("");
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader
        right={
          <CapsuleButton
            label="主题色"
            onPress={() => Alert.alert("后续接入", "待办主题色将与全局主题令牌联动（色板选择器）。")}
            variant="secondary"
          />
        }
        title="待办详情"
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}>
        <LabeledInput label="标题" onChangeText={setTitle} tokens={tokens} value={title} />
        <LabeledInput label="内容" multiline onChangeText={setBody} tokens={tokens} value={body} />
        <LabeledInput label="地点" onChangeText={setPlace} tokens={tokens} value={place} />

        <Text style={{ color: tokens.text, fontWeight: "900" }}>种类（三选一）</Text>
        {(
          [
            { key: "duration" as const, label: "持续时间" },
            { key: "ddl" as const, label: "DDL" },
            { key: "plain" as const, label: "普通" },
          ] as const
        ).map((item) => {
          const on = kind === item.key;
          return (
            <CapsuleButton
              key={item.key}
              label={`${item.label}${on ? " \u2713" : ""}`}
              onPress={() => setKind(item.key)}
              variant={on ? "primary" : "secondary"}
            />
          );
        })}

        {kind === "duration" ? (
          <>
            <LabeledInput label="开始时间（ISO 文本，占位）" onChangeText={setStartAt} tokens={tokens} value={startAt} />
            <LabeledInput label="结束时间（ISO 文本，占位）" onChangeText={setEndAt} tokens={tokens} value={endAt} />
          </>
        ) : null}
        {kind === "ddl" ? (
          <LabeledInput label="截止时间（ISO 文本，占位）" onChangeText={setDueAt} tokens={tokens} value={dueAt} />
        ) : null}

        <Text style={{ color: tokens.text, fontWeight: "900" }}>重要程度</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(
            [
              { key: 1 as const, label: "一般" },
              { key: 2 as const, label: "重要" },
              { key: 3 as const, label: "紧急" },
            ] as const
          ).map((x) => {
            const on = importance === x.key;
            return (
              <CapsuleButton
                key={x.key}
                label={`${x.label}${on ? " \u2713" : ""}`}
                onPress={() => setImportance(x.key)}
                variant={on ? "primary" : "secondary"}
              />
            );
          })}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: tokens.text, fontWeight: "900" }}>提醒</Text>
          <AppSwitch onValueChange={setRemind} value={remind} />
        </View>

        <Text style={{ color: tokens.text, fontWeight: "900" }}>进度日志</Text>
        {todo.progress.map((p) => (
          <Text key={`${p.at}-${p.text}`} style={{ color: tokens.textSecondary, fontSize: 12 }}>
            {p.at} · {p.text}
          </Text>
        ))}
        <LabeledInput label="追加一条" onChangeText={setProgressText} tokens={tokens} value={progressText} />
        <CapsuleButton label="追加进度" onPress={appendProgress} variant="secondary" />

        <CapsuleButton label="保存" onPress={save} />

        <Text onPress={() => setDeleteOpen(true)} style={{ color: tokens.danger, fontWeight: "900", textAlign: "center", marginTop: 10 }}>
          删除待办
        </Text>
      </ScrollView>

      <ConfirmDialog
        cancelLabel="取消"
        confirmLabel="删除"
        destructive
        message="此操作不可恢复。"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          removeTodo(todoId);
          router.back();
        }}
        title="确认删除待办？"
        visible={deleteOpen}
      />
    </View>
  );
}

function LabeledInput(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
  multiline?: boolean;
}): React.JSX.Element {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: props.tokens.text, fontWeight: "800" }}>{props.label}</Text>
      <TextInput
        multiline={props.multiline}
        onChangeText={props.onChangeText}
        placeholderTextColor={props.tokens.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: props.tokens.border,
          backgroundColor: props.tokens.surface,
          color: props.tokens.text,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          minHeight: props.multiline ? 96 : undefined,
          textAlignVertical: props.multiline ? "top" : "center",
        }}
        value={props.value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
