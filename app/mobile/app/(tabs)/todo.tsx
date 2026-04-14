import { Link, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { addTodo, patchTodo, removeTodo, setLinkExamHomeworkToTodoFlag } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { Todo } from "@nju/contracts";
import { sortTodosDefault, sortTodosManual } from "@nju/domain";
import { AppSwitch } from "@/components/AppSwitch";

type Filter = "all" | "active" | "done";
type SortMode = "default" | "manual";

export default function TodoTab(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const todos = useAppStore((s) => s.state.todos);
  const linkOn = useAppStore((s) => s.state.settings.linkExamHomeworkToTodo);

  const [filter, setFilter] = React.useState<Filter>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("default");
  const [batch, setBatch] = React.useState(false);

  const visible = React.useMemo(() => {
    let list = [...todos];
    if (filter === "active") {
      list = list.filter((t) => !t.completed);
    }
    if (filter === "done") {
      list = list.filter((t) => t.completed);
    }
    const sortedBase = sortMode === "default" ? sortTodosDefault(list) : sortTodosManual(list);
    if (filter === "all" && sortMode === "default") {
      const open = sortedBase.filter((t) => !t.completed);
      const done = sortedBase.filter((t) => t.completed);
      return [...open, ...done];
    }
    return sortedBase;
  }, [todos, filter, sortMode]);

  const onCreate = (): void => {
    const id = addTodo({
      title: "新待办",
      kind: "plain",
      importance: 2,
      remind: false,
      progress: [],
      completed: false,
      source: "manual",
    });
    router.push(`/todo/${id}`);
  };

  const renderItem = ({ item, index }: { item: Todo; index: number }): React.JSX.Element => (
    <View style={[styles.row, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
      <Text style={{ color: tokens.textSecondary, width: 22, textAlign: "center", fontWeight: "900" }}>
        {index + 1}
      </Text>
      <Link asChild href={`/todo/${item.id}`}>
        <Pressable style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: tokens.text,
              fontWeight: "800",
              textDecorationLine: item.completed ? "line-through" : "none",
              opacity: item.completed ? 0.55 : 1,
            }}
          >
            {item.title}
          </Text>
          {item.kind === "duration" && item.startAt ? (
            <Text style={{ color: tokens.accent, fontSize: 12 }}>{item.startAt}</Text>
          ) : null}
          {item.kind === "ddl" && item.dueAt ? (
            <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>截止 {item.dueAt}</Text>
          ) : null}
        </Pressable>
      </Link>
      {batch ? (
        <Pressable
          onPress={() => removeTodo(item.id)}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: tokens.danger, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>×</Text>
        </Pressable>
      ) : item.kind === "ddl" || item.kind === "plain" ? (
        <CapsuleButton
          label="完成"
          onPress={() => patchTodo(item.id, { completed: !item.completed })}
          variant="primary"
        />
      ) : (
        <View style={{ width: 72 }} />
      )}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader
        showBack={false}
        title="待办"
        right={
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <CapsuleButton label={batch ? "完成" : "批量"} onPress={() => setBatch((v) => !v)} variant="secondary" />
            <CapsuleButton label="新建" onPress={onCreate} />
          </View>
        }
      />

      <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(
            [
              { key: "all" as const, label: "全部" },
              { key: "active" as const, label: "未完成" },
              { key: "done" as const, label: "已完成" },
            ] as const
          ).map((x) => {
            const on = filter === x.key;
            return (
              <Text
                key={x.key}
                onPress={() => setFilter(x.key)}
                style={{
                  fontWeight: "900",
                  color: on ? tokens.accent : tokens.textSecondary,
                }}
              >
                {x.label}
              </Text>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>排序</Text>
          {(
            [
              { key: "default" as const, label: "默认" },
              { key: "manual" as const, label: "手动" },
            ] as const
          ).map((x) => {
            const on = sortMode === x.key;
            return (
              <Text
                key={x.key}
                onPress={() => setSortMode(x.key)}
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: on ? tokens.accent : tokens.textSecondary,
                }}
              >
                {x.label}
              </Text>
            );
          })}
        </View>

        <View style={styles.linkRow}>
          <Text style={{ color: tokens.text, fontWeight: "800", flex: 1 }}>关联考试与作业</Text>
          <AppSwitch onValueChange={setLinkExamHomeworkToTodoFlag} value={linkOn} />
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
});
