import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { HeroHeader } from "@/components/HeroHeader";
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
import { PEN, penCard, penScrollContent, penSectionTitle } from "@/ui/pen";
import type { Timetable } from "@nju/contracts";
import { setThemeMode } from "@nju/domain";

export default function SettingsScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const settings = useAppStore((s) => s.state.settings);
  const timetables = useAppStore((s) => s.state.timetables);

  const [accentDraft, setAccentDraft] = React.useState(settings.accentColor);
  const [deleteTarget, setDeleteTarget] = React.useState<Timetable | null>(null);

  React.useEffect(() => {
    setAccentDraft(settings.accentColor);
  }, [settings.accentColor]);

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader title="设置与外观" />

      <ScrollView contentContainerStyle={penScrollContent(40)}>
        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>外观</Text>
        <View style={penCard(tokens.surface, tokens.border, 0)}>
          <SettingsRow
            fonts={fonts}
            label="深色模式"
            tokens={tokens}
            trailing={
              <AppSwitch
                onValueChange={(v) => patchAppSettings((s) => setThemeMode(s, v ? "dark" : "light"))}
                value={settings.themeMode === "dark"}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: tokens.divider }]} />
          <SettingsRow
            fonts={fonts}
            label="跟随系统"
            tokens={tokens}
            trailing={<AppSwitch onValueChange={setFollowSystemFlag} value={settings.followSystem} />}
          />
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            <Text style={{ color: tokens.textSecondary, fontSize: 12, fontFamily: fonts.regular }}>
              全局主题色（十六进制）
            </Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setAccentDraft}
              placeholder="#ff6347"
              placeholderTextColor={tokens.textSecondary}
              style={[
                styles.input,
                { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.wash },
              ]}
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
        </View>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>课表与作息</Text>
        <View style={penCard(tokens.surface, tokens.border, 0)}>
          <SettingsRow
            fonts={fonts}
            label="隐藏周末"
            tokens={tokens}
            trailing={<AppSwitch onValueChange={setHideWeekendFlag} value={settings.hideWeekend} />}
          />
          <View style={[styles.divider, { backgroundColor: tokens.divider }]} />
          <SettingsRow
            fonts={fonts}
            label="隐藏无课行"
            tokens={tokens}
            trailing={<AppSwitch onValueChange={setHideEmptyRowsFlag} value={settings.hideEmptyRows} />}
          />
          <View style={{ padding: 16 }}>
            <CapsuleButton label="重新随机生成课表配色" onPress={randomizeCourseColors} variant="secondary" />
          </View>
        </View>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>课表管理</Text>
        <View style={penCard(tokens.surface, tokens.border, 16)}>
          <Text style={{ color: tokens.textSecondary, fontSize: 12, lineHeight: 16, fontFamily: fonts.regular }}>
            主课表（本人）不可在此删除；至少保留一份课表。
          </Text>
          {timetables.map((tt) => (
            <View
              key={tt.id}
              style={[
                styles.ttRow,
                { borderColor: tokens.border, marginTop: 10 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: tokens.text, fontWeight: "600", fontFamily: fonts.semibold }}>{tt.name}</Text>
                {tt.isPrimary ? (
                  <Text style={{ color: tokens.textSecondary, fontSize: 12, marginTop: 4, fontFamily: fonts.regular }}>
                    主课表
                  </Text>
                ) : null}
              </View>
              {tt.isPrimary ? null : (
                <Pressable hitSlop={8} onPress={() => setDeleteTarget(tt)}>
                  <Text style={{ color: tokens.accent, fontWeight: "600", fontFamily: fonts.semibold }}>删除</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>数据与分享</Text>
        <View style={penCard(tokens.surface, tokens.border, 16)}>
          <SettingsRow
            fonts={fonts}
            label="关联考试与作业到待办"
            tokens={tokens}
            trailing={
              <AppSwitch onValueChange={setLinkExamHomeworkToTodoFlag} value={settings.linkExamHomeworkToTodo} />
            }
          />
          <Text style={{ color: tokens.textSecondary, fontSize: 12, lineHeight: 16, fontFamily: fonts.regular }}>
            说明：本版本先完成数据结构与 UI 主路径；通知调度、云端导入等按文档分期接入。
          </Text>
        </View>

        <Text
          style={{
            color: tokens.textSecondary,
            fontSize: 12,
            lineHeight: 17,
            fontFamily: fonts.regular,
          }}
        >
          桌面小组件与锁屏课表在系统小组件库中添加
        </Text>
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

function SettingsRow(props: {
  label: string;
  trailing: React.ReactNode;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
  fonts: ReturnType<typeof useAppTheme>["fonts"];
}): React.JSX.Element {
  return (
    <View style={styles.settingsRow}>
      <Text style={{ color: props.tokens.text, fontWeight: "400", flex: 1, fontSize: 15, fontFamily: props.fonts.regular }}>
        {props.label}
      </Text>
      {props.trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  settingsRow: {
    minHeight: PEN.rowMinHeight,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: PEN.radiusCardDense,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  ttRow: {
    borderWidth: 1,
    borderRadius: PEN.radiusCard,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
