import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  deleteNonPrimaryTimetable,
  patchAppSettings,
  randomizeCourseColors,
  setAccent,
  setFollowSystemFlag,
  setHideEmptyRowsFlag,
  setHideWeekendFlag,
  setLinkExamHomeworkToTodoFlag,
} from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { Timetable } from "@nju/contracts";
import { setThemeMode } from "@nju/domain";

export default function SettingsScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const settings = useAppStore((s) => s.state.settings);
  const timetables = useAppStore((s) => s.state.timetables);

  const [accentDraft, setAccentDraft] = React.useState(settings.accentColor);
  const [deleteTarget, setDeleteTarget] = React.useState<Timetable | null>(null);

  React.useEffect(() => {
    setAccentDraft(settings.accentColor);
  }, [settings.accentColor]);

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader title="设置与外观" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <Section title="主题">
          <Row
            label="深色模式"
            trailing={
              <AppSwitch
                onValueChange={(v) => patchAppSettings((s) => setThemeMode(s, v ? "dark" : "light"))}
                value={settings.themeMode === "dark"}
              />
            }
          />
          <Row
            label="跟随系统"
            trailing={
              <AppSwitch
                onValueChange={(v) => setFollowSystemFlag(v)}
                value={settings.followSystem}
              />
            }
          />
          <View style={{ gap: 6, marginTop: 6 }}>
            <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>全局主题色（十六进制）</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setAccentDraft}
              placeholder="#ff6347"
              placeholderTextColor={tokens.textSecondary}
              style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.surface }]}
              value={accentDraft}
            />
            <CapsuleButton
              label="应用主题色"
              onPress={() => {
                if (/^#([0-9a-fA-F]{6})$/.test(accentDraft.trim())) {
                  setAccent(accentDraft.trim());
                  return;
                }
                Alert.alert("格式不正确", "请使用形如 #RRGGBB 的色值。");
              }}
            />
          </View>
        </Section>

        <Section title="课表显示">
          <Row
            label="隐藏周末"
            trailing={<AppSwitch onValueChange={setHideWeekendFlag} value={settings.hideWeekend} />}
          />
          <Row
            label="隐藏无课行"
            trailing={<AppSwitch onValueChange={setHideEmptyRowsFlag} value={settings.hideEmptyRows} />}
          />
          <CapsuleButton label="重新随机生成课表配色" onPress={randomizeCourseColors} variant="secondary" />
        </Section>

        <Section title="课表管理">
          <Text style={{ color: tokens.textSecondary, fontSize: 12, lineHeight: 16 }}>
            主课表（本人）不可在此删除；至少保留一份课表。
          </Text>
          {timetables.map((tt) => (
            <View key={tt.id} style={[styles.ttRow, { borderColor: tokens.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: tokens.text, fontWeight: "800" }}>{tt.name}</Text>
                {tt.isPrimary ? (
                  <Text style={{ color: tokens.textSecondary, fontSize: 12, marginTop: 4 }}>主课表</Text>
                ) : null}
              </View>
              {tt.isPrimary ? null : (
                <Text onPress={() => setDeleteTarget(tt)} style={{ color: tokens.accent, fontWeight: "900" }}>
                  删除
                </Text>
              )}
            </View>
          ))}
        </Section>

        <Section title="数据与联动（工程版）">
          <Row
            label="关联考试与作业到待办"
            trailing={
              <AppSwitch
                onValueChange={setLinkExamHomeworkToTodoFlag}
                value={settings.linkExamHomeworkToTodo}
              />
            }
          />
          <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>
            说明：本版本先完成数据结构与 UI 主路径；通知调度、云端导入等按文档分期接入。
          </Text>
        </Section>
      </ScrollView>

      <ConfirmDialog
        cancelLabel="取消"
        confirmLabel="删除"
        destructive
        message="删除该课表会移除其课程数据（按当前级联策略）。此操作不可恢复。"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }
          const ok = deleteNonPrimaryTimetable(deleteTarget.id);
          setDeleteTarget(null);
          if (!ok) {
            Alert.alert("无法删除", "主课表不可删除，或至少需要保留一份课表。");
          }
        }}
        title="确认删除课表？"
        visible={deleteTarget !== null}
      />
    </View>
  );
}

function Section(props: { title: string; children: React.ReactNode }): React.JSX.Element {
  const { tokens } = useAppTheme();
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "900" }}>{props.title}</Text>
      {props.children}
    </View>
  );
}

function Row(props: { label: string; trailing: React.ReactNode }): React.JSX.Element {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={{ color: tokens.text, fontWeight: "700", flex: 1 }}>{props.label}</Text>
      {props.trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ttRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
