import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { addImportantDay } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { filterTodosForDay } from "@nju/domain";

function buildMonthMatrix(year: number, monthIndex: number): Array<Array<number | null>> {
  const first = new Date(year, monthIndex, 1);
  const startWeekday = first.getDay(); // 0 Sun
  const mondayFirst = (startWeekday + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = [];
  for (let i = 0; i < mondayFirst; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(d);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const rows: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export default function CalendarScreen(): React.JSX.Element {
  const { tokens, appearance } = useAppTheme();
  const todos = useAppStore((s) => s.state.todos);
  const marks = useAppStore((s) => s.state.calendarMarks);

  const [cursor, setCursor] = React.useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = React.useState<number | null>(new Date().getDate());

  const matrix = React.useMemo(
    () => buildMonthMatrix(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  );

  const selectedDateKey =
    selectedDay === null
      ? null
      : `${cursor.y}-${`${cursor.m + 1}`.padStart(2, "0")}-${`${selectedDay}`.padStart(2, "0")}`;

  const dayTodos = selectedDateKey ? filterTodosForDay(todos, selectedDateKey) : [];
  const dayMarks = selectedDateKey ? marks.filter((m) => m.dateKey === selectedDateKey) : [];

  const today = new Date();
  const isToday = (day: number | null): boolean =>
    day !== null && cursor.y === today.getFullYear() && cursor.m === today.getMonth() && day === today.getDate();

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader title="学期日历" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <View style={styles.monthRow}>
          <Pressable hitSlop={8} onPress={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}>
            <Text style={{ color: tokens.accent, fontWeight: "900" }}>{"<"}</Text>
          </Pressable>
          <Text style={{ color: tokens.text, fontWeight: "900", fontSize: 16 }}>
            {cursor.y} 年 {cursor.m + 1} 月
          </Text>
          <Pressable hitSlop={8} onPress={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}>
            <Text style={{ color: tokens.accent, fontWeight: "900" }}>{">"}</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 }}>
          {["一", "二", "三", "四", "五", "六", "日"].map((w) => (
            <Text key={w} style={{ width: `${100 / 7}%`, textAlign: "center", color: tokens.textSecondary, fontSize: 12 }}>
              {w}
            </Text>
          ))}
        </View>

        {matrix.map((row, ri) => (
          <View key={`r${ri}`} style={{ flexDirection: "row" }}>
            {row.map((day, di) => {
              const markTypes = day
                ? marks.filter((m) => m.dateKey === `${cursor.y}-${`${cursor.m + 1}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`)
                : [];
              const filled = markTypes.find((m) => m.type === "important") ?? markTypes[0];
              const key = `${ri}-${di}`;
              return (
                <Pressable
                  key={key}
                  onPress={() => day !== null && setSelectedDay(day)}
                  style={{
                    width: `${100 / 7}%`,
                    aspectRatio: 1,
                    padding: 3,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: isToday(day) ? 2 : 0,
                      borderColor: isToday(day) ? (appearance === "dark" ? "#CBD5E1" : "#4B5563") : "transparent",
                      backgroundColor: filled ? tokens.accent : tokens.surfaceMuted,
                      opacity: day === null ? 0 : 1,
                    }}
                  >
                    {day === null ? null : (
                      <Text style={{ color: filled ? "#FFFFFF" : tokens.text, fontWeight: "900" }}>{day}</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}

        <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "900", color: tokens.text }}>
          {selectedDateKey ?? "选择日期"}
        </Text>

        <CapsuleButton
          label="添加重要日（示例）"
          onPress={() => {
            if (!selectedDateKey) {
              return;
            }
            addImportantDay({ dateKey: selectedDateKey, title: "重要日", note: "示例" });
          }}
        />

        <Text style={{ color: tokens.text, fontWeight: "900" }}>当日标注</Text>
        {dayMarks.length === 0 ? (
          <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>无</Text>
        ) : (
          dayMarks.map((m) => (
            <Text key={m.id} style={{ color: tokens.textSecondary, fontSize: 12 }}>
              {m.type} · {m.title}
            </Text>
          ))
        )}

        <Text style={{ color: tokens.text, fontWeight: "900" }}>当日待办（含时间信息）</Text>
        {dayTodos.length === 0 ? (
          <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>无</Text>
        ) : (
          dayTodos.map((t) => (
            <Text key={t.id} style={{ color: tokens.textSecondary, fontSize: 12 }}>
              {t.title}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
