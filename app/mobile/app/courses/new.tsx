import { useRouter } from "expo-router";
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
import { HeroHeader } from "@/components/HeroHeader";
import { saveNewCourse } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { ThemeTokens } from "@/theme/tokens";
import { PEN, penCard, penScrollContent, penSectionTitle } from "@/ui/pen";
import type { WeekRule } from "@nju/contracts";

export default function ManualAddCourseScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const router = useRouter();
  const timetableId = useAppStore((s) => s.state.selectedTimetableId);

  const [title, setTitle] = React.useState("");
  const [teacher, setTeacher] = React.useState("");
  const [classroom, setClassroom] = React.useState("");
  const [weekday, setWeekday] = React.useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [startPeriod, setStartPeriod] = React.useState("1");
  const [endPeriod, setEndPeriod] = React.useState("2");
  const [showOnGrid, setShowOnGrid] = React.useState(true);
  const [weekRuleType, setWeekRuleType] = React.useState<WeekRule["type"]>("all");
  const [submitting, setSubmitting] = React.useState(false);

  const weekRule: WeekRule = React.useMemo(() => ({ type: weekRuleType }), [weekRuleType]);

  const onSave = (): void => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    const sp = Number(startPeriod);
    const ep = Number(endPeriod);
    const result = saveNewCourse({
      timetableId,
      title,
      teacher,
      classroom,
      weekday,
      startPeriod: Number.isFinite(sp) ? sp : 1,
      endPeriod: Number.isFinite(ep) ? ep : 1,
      weekRule,
      showOnGrid,
    });
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert("无法保存", result.errors.join("\n"));
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader title="手动添加课程" />
      <ScrollView contentContainerStyle={penScrollContent(48, true)}>
        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>基本信息</Text>
        <View style={penCard(tokens.surface, tokens.border, 14)}>
          <Field label="课程名称" tokens={tokens} description="必填" onChangeText={setTitle} value={title} fonts={fonts} />
          <Field label="教师" tokens={tokens} description="可选" onChangeText={setTeacher} value={teacher} fonts={fonts} />
          <Field label="教室" tokens={tokens} description="可选" onChangeText={setClassroom} value={classroom} fonts={fonts} />
        </View>

        {showOnGrid ? (
          <>
            <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>时间与节次</Text>
            <View style={penCard(tokens.surface, tokens.border, 14)}>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, fontFamily: fonts.regular }}>星期</Text>
              <WeekdayPicker fonts={fonts} onChange={setWeekday} tokens={tokens} value={weekday} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <SmallField fonts={fonts} label="开始节次" onChangeText={setStartPeriod} tokens={tokens} value={startPeriod} />
                <SmallField fonts={fonts} label="结束节次" onChangeText={setEndPeriod} tokens={tokens} value={endPeriod} />
              </View>
            </View>

            <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>适用周次</Text>
            <View style={penCard(tokens.surface, tokens.border, 14)}>
              <WeekRulePicker fonts={fonts} onChange={setWeekRuleType} tokens={tokens} value={weekRuleType} />
            </View>
          </>
        ) : null}

        <Pressable
          disabled={submitting}
          onPress={onSave}
          style={[
            styles.saveCta,
            { backgroundColor: tokens.accent, opacity: submitting ? 0.7 : 1 },
          ]}
        >
          <Text style={{ color: tokens.onAccent, fontWeight: "600", fontSize: 16, fontFamily: fonts.semibold }}>
            {submitting ? "保存中…" : "保存课程"}
          </Text>
        </Pressable>

        <Text
          style={{
            color: tokens.textSecondary,
            fontSize: 11,
            lineHeight: 15,
            fontFamily: fonts.regular,
          }}
        >
          保存后可在课表长按该课程快速编辑、删除、复制或拖拽改时间
        </Text>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>显示设置</Text>
        <View
          style={[
            styles.toggleRow,
            { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
        >
          <Text style={{ color: tokens.text, fontSize: 15, flex: 1, fontFamily: fonts.regular }}>
            显示在周课表
          </Text>
          <AppSwitch onValueChange={setShowOnGrid} value={showOnGrid} />
        </View>
        <Text
          style={{
            color: tokens.textSecondary,
            fontSize: 12,
            lineHeight: 17,
            fontFamily: fonts.regular,
          }}
        >
          用于网课/自学课时，可关闭显示但仍保留课程资料与提醒。
        </Text>
      </ScrollView>
    </View>
  );
}

function Field(props: {
  label: string;
  description: string;
  value: string;
  onChangeText: (t: string) => void;
  tokens: ThemeTokens;
  fonts: { regular?: string; semibold?: string };
}): React.JSX.Element {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: props.tokens.text, fontWeight: "600", fontFamily: props.fonts.semibold }}>{props.label}</Text>
      <Text style={{ color: props.tokens.textSecondary, fontSize: 12, fontFamily: props.fonts.regular }}>
        {props.description}
      </Text>
      <TextInput
        onChangeText={props.onChangeText}
        placeholderTextColor={props.tokens.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: props.tokens.border,
          backgroundColor: props.tokens.wash,
          color: props.tokens.text,
          borderRadius: PEN.radiusCardDense,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontFamily: props.fonts.regular,
        }}
        value={props.value}
      />
    </View>
  );
}

function SmallField(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  tokens: ThemeTokens;
  fonts: { regular?: string; semibold?: string };
}): React.JSX.Element {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={{ color: props.tokens.text, fontWeight: "600", fontSize: 13, fontFamily: props.fonts.semibold }}>
        {props.label}
      </Text>
      <TextInput
        keyboardType="number-pad"
        onChangeText={props.onChangeText}
        placeholderTextColor={props.tokens.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: props.tokens.border,
          backgroundColor: props.tokens.wash,
          color: props.tokens.text,
          borderRadius: PEN.radiusCardDense,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontFamily: props.fonts.regular,
        }}
        value={props.value}
      />
    </View>
  );
}

function WeekdayPicker(props: {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onChange: (v: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  tokens: ThemeTokens;
  fonts: { regular?: string };
}): React.JSX.Element {
  const labels = ["一", "二", "三", "四", "五", "六", "日"];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {labels.map((lb, idx) => {
        const v = (idx + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
        const on = props.value === v;
        return (
          <Text
            key={lb}
            onPress={() => props.onChange(v)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              overflow: "hidden",
              fontWeight: "600",
              fontFamily: props.fonts.regular,
              color: on ? props.tokens.onAccent : props.tokens.text,
              backgroundColor: on ? props.tokens.accent : props.tokens.surfaceMuted,
              borderWidth: on ? 0 : 1,
              borderColor: props.tokens.border,
            }}
          >
            周{lb}
          </Text>
        );
      })}
    </View>
  );
}

function WeekRulePicker(props: {
  value: WeekRule["type"];
  onChange: (v: WeekRule["type"]) => void;
  tokens: ThemeTokens;
  fonts: { regular?: string };
}): React.JSX.Element {
  const items: Array<{ key: WeekRule["type"]; label: string }> = [
    { key: "all", label: "每周" },
    { key: "odd", label: "单周" },
    { key: "even", label: "双周" },
  ];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {items.map((it) => {
        const on = props.value === it.key;
        return (
          <Text
            key={it.key}
            onPress={() => props.onChange(it.key)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              fontWeight: "600",
              fontFamily: props.fonts.regular,
              color: on ? props.tokens.onAccent : props.tokens.text,
              backgroundColor: on ? props.tokens.accent : props.tokens.surfaceMuted,
              borderWidth: on ? 0 : 1,
              borderColor: props.tokens.border,
            }}
          >
            {it.label}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  saveCta: {
    borderRadius: PEN.radiusPillCta,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    minHeight: PEN.rowCompactHeight,
    borderRadius: PEN.radiusCard,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
