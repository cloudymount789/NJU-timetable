import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { upsertReminder } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { CourseReminder } from "@nju/contracts";
import {
  createReminderDefaults,
  setReminderHolidaySkip,
  setReminderLeadMinutes,
  toggleReminderChannel,
} from "@nju/domain";

const LEADS: CourseReminder["leadMinutes"][] = [5, 10, 15, 30];

export default function CourseReminderScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const params = useLocalSearchParams<{ courseId: string }>();
  const courseId = params.courseId;

  const course = useAppStore((s) => s.state.courses.find((c) => c.id === courseId));
  const stored = useAppStore((s) => s.state.reminders.find((r) => r.courseId === courseId));

  const base = stored ?? (courseId ? createReminderDefaults(courseId) : null);

  if (!course || !courseId || !base) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.bg }]}>
        <ScreenHeader title="课程提醒" />
        <Text style={{ color: tokens.textSecondary, padding: 16 }}>未找到课程。</Text>
      </View>
    );
  }

  const apply = (next: CourseReminder): void => {
    upsertReminder(courseId, next);
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader title="课程提醒" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>
          当前课程：{" "}
          <Text style={{ color: tokens.text, fontWeight: "900" }}>{course.title}</Text>
        </Text>

        <Text style={[styles.section, { color: tokens.text }]}>提前提醒</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {LEADS.map((m) => {
            const on = base.leadMinutes === m;
            return (
              <CapsuleButton
                key={m}
                label={`${m} 分钟`}
                onPress={() => apply(setReminderLeadMinutes(base, m))}
                variant={on ? "primary" : "secondary"}
              />
            );
          })}
        </View>

        <Text style={[styles.section, { color: tokens.text }]}>提醒方式（可多选）</Text>
        {(
          [
            { key: "notification" as const, label: "通知" },
            { key: "silent" as const, label: "静音" },
            { key: "vibrate" as const, label: "震动" },
            { key: "ringtone" as const, label: "铃声" },
          ] as const
        ).map((item) => {
          const on = base.channels.includes(item.key);
          return (
            <CapsuleButton
              key={item.key}
              label={`${item.label}${on ? " \u2713" : ""}`}
              onPress={() => apply(toggleReminderChannel(base, item.key))}
              variant={on ? "primary" : "secondary"}
            />
          );
        })}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.text, fontWeight: "900" }}>节假日跳过</Text>
            <Text style={{ color: tokens.textSecondary, fontSize: 12, marginTop: 4 }}>
              周末与法定节假日不触发（工程版：仅保存策略，系统通知调度后续接入）
            </Text>
          </View>
          <AppSwitch
            onValueChange={(v) => apply(setReminderHolidaySkip(base, v))}
            value={base.skipWeekendsAndHolidays}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  section: { fontSize: 14, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
});
