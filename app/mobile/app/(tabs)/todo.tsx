import { Link, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { HeroHeader } from "@/components/HeroHeader";
import { PenHeaderChip } from "@/components/PenHeaderChip";
import { addTodo, patchTodo, removeTodo, setLinkExamHomeworkToTodoFlag } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN } from "@/ui/pen";
import type { Todo } from "@nju/contracts";
import { sortTodosDefault, sortTodosManual } from "@nju/domain";

type Filter = "all" | "active" | "done";
type SortMode = "default" | "manual";

export default function TodoTab(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
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
      <Text
        style={{
          color: tokens.textSecondary,
          width: 22,
          textAlign: "center",
          fontWeight: "600",
          fontFamily: fonts.semibold,
        }}
      >
        {index + 1}
      </Text>
      <Link asChild href={`/todo/${item.id}`}>
        <Pressable style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: tokens.text,
              fontWeight: "600",
              fontSize: 15,
              fontFamily: fonts.semibold,
              textDecorationLine: item.completed ? "line-through" : "none",
              opacity: item.completed ? 0.55 : 1,
            }}
          >
            {item.title}
          </Text>
          {item.kind === "duration" && item.startAt ? (
            <Text style={{ color: tokens.accent, fontSize: 12, fontFamily: fonts.regular }}>{item.startAt}</Text>
          ) : null}
          {item.kind === "ddl" && item.dueAt ? (
            <Text style={{ color: tokens.textSecondary, fontSize: 12, fontFamily: fonts.regular }}>
              截止 {item.dueAt}
            </Text>
          ) : null}
        </Pressable>
      </Link>
      {batch ? (
        <Pressable
          onPress={() => removeTodo(item.id)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: tokens.danger,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: tokens.onAccent, fontWeight: "700" }}>×</Text>
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
      <HeroHeader
        right={
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <PenHeaderChip
              label={batch ? "完成" : "批量"}
              onPress={() => setBatch((v) => !v)}
              variant="outline"
            />
            <PenHeaderChip icon="add" label="新建" onPress={onCreate} variant="primary" />
          </View>
        }
        showBack={false}
        title="待办"
      />

      <View style={{ paddingHorizontal: PEN.padH, paddingTop: 8, gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
          {(
            [
              { key: "all" as const, label: "全部" },
              { key: "active" as const, label: "未完成" },
              { key: "done" as const, label: "已完成" },
            ] as const
          ).map((x) => {
            const on = filter === x.key;
            return (
              <Pressable key={x.key} hitSlop={6} onPress={() => setFilter(x.key)}>
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 14,
                    fontFamily: fonts.semibold,
                    color: on ? tokens.accent : tokens.textSecondary,
                  }}
                >
                  {x.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <Text style={{ color: tokens.textSecondary, fontSize: 12, fontFamily: fonts.regular }}>排序</Text>
          {(
            [
              { key: "default" as const, label: "默认" },
              { key: "manual" as const, label: "手动" },
            ] as const
          ).map((x) => {
            const on = sortMode === x.key;
            return (
              <Pressable key={x.key} hitSlop={6} onPress={() => setSortMode(x.key)}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    fontFamily: fonts.semibold,
                    color: on ? tokens.accent : tokens.textSecondary,
                  }}
                >
                  {x.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.linkRow}>
          <Text style={{ color: tokens.text, fontWeight: "600", flex: 1, fontSize: 15, fontFamily: fonts.semibold }}>
            关联考试与作业
          </Text>
          <AppSwitch onValueChange={setLinkExamHomeworkToTodoFlag} value={linkOn} />
        </View>
      </View>

      <FlatList
        contentContainerStyle={{
          paddingHorizontal: PEN.padH,
          paddingTop: 12,
          paddingBottom: 40,
          gap: PEN.gapList,
        }}
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
    borderRadius: PEN.radiusCard,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
});
