import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { HeroHeader } from "@/components/HeroHeader";
import { upsertReminder } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN, penCard, penScrollContent, penSectionTitle } from "@/ui/pen";
import type { CourseReminder } from "@nju/contracts";
import {
  createReminderDefaults,
  setReminderHolidaySkip,
  setReminderLeadMinutes,
  toggleReminderChannel,
} from "@nju/domain";

const LEADS: CourseReminder["leadMinutes"][] = [5, 10, 15, 30];

export default function CourseReminderScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const params = useLocalSearchParams<{ courseId: string }>();
  const courseId = params.courseId;

  const course = useAppStore((s) => s.state.courses.find((c) => c.id === courseId));
  const stored = useAppStore((s) => s.state.reminders.find((r) => r.courseId === courseId));

  const base = stored ?? (courseId ? createReminderDefaults(courseId) : null);

  if (!course || !courseId || !base) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.bg }]}>
        <HeroHeader title="课程提醒" />
        <Text style={{ color: tokens.textSecondary, padding: 20, fontSize: 14 }}>未找到课程。</Text>
      </View>
    );
  }

  const apply = (next: CourseReminder): void => {
    upsertReminder(courseId, next);
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader title="课程提醒" />
      <ScrollView contentContainerStyle={penScrollContent(40)}>
        <Text style={{ color: tokens.textSecondary, fontSize: 13, fontFamily: fonts.regular }}>
          当前课程：{" "}
          <Text style={{ color: tokens.text, fontWeight: "600", fontFamily: fonts.semibold }}>{course.title}</Text>
        </Text>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>课前多久提醒</Text>
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

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>提醒方式</Text>
        <View style={penCard(tokens.surface, tokens.border, 0)}>
          {(
            [
              { key: "notification" as const, label: "通知" },
              { key: "silent" as const, label: "静音" },
              { key: "vibrate" as const, label: "震动" },
              { key: "ringtone" as const, label: "铃声" },
            ] as const
          ).map((item, i, arr) => {
            const on = base.channels.includes(item.key);
            return (
              <View
                key={item.key}
                style={[
                  styles.innerRow,
                  i < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: tokens.divider,
                  },
                ]}
              >
                <Text style={{ color: tokens.text, fontSize: 15, fontFamily: fonts.regular }}>{item.label}</Text>
                <CapsuleButton
                  label={on ? "已选" : "选择"}
                  onPress={() => apply(toggleReminderChannel(base, item.key))}
                  variant={on ? "primary" : "ghost"}
                />
              </View>
            );
          })}
        </View>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>智能跳过</Text>
        <View
          style={[
            styles.toggleCard,
            { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: tokens.text, fontWeight: "600", fontFamily: fonts.semibold }}>节假日跳过</Text>
            <Text style={{ color: tokens.textSecondary, fontSize: 12, marginTop: 4, fontFamily: fonts.regular }}>
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
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: PEN.rowMinHeight,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: PEN.radiusCard,
    borderWidth: 1,
    padding: 16,
  },
});
