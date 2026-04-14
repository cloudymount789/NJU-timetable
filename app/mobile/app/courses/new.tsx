import { useRouter } from "expo-router";
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
import { ScreenHeader } from "@/components/ScreenHeader";
import { saveNewCourse } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { WeekRule } from "@nju/contracts";

export default function ManualAddCourseScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
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
      <ScreenHeader title="手动添加课程" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Field
          description="课程名称（必填）"
          label="课程名称"
          onChangeText={setTitle}
          tokens={tokens}
          value={title}
        />
        <Field
          description="任课教师（可选）"
          label="教师"
          onChangeText={setTeacher}
          tokens={tokens}
          value={teacher}
        />
        <Field
          description="教室（可选）"
          label="教室"
          onChangeText={setClassroom}
          tokens={tokens}
          value={classroom}
        />

        <Row label="显示在周课表" tokens={tokens} trailing={<AppSwitch onValueChange={setShowOnGrid} value={showOnGrid} />} />

        {showOnGrid ? (
          <>
            <Text style={[styles.section, { color: tokens.textSecondary }]}>上课时间</Text>
            <WeekdayPicker onChange={setWeekday} tokens={tokens} value={weekday} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <SmallField label="开始节次" onChangeText={setStartPeriod} tokens={tokens} value={startPeriod} />
              <SmallField label="结束节次" onChangeText={setEndPeriod} tokens={tokens} value={endPeriod} />
            </View>
            <Text style={[styles.section, { color: tokens.textSecondary }]}>周次规则</Text>
            <WeekRulePicker onChange={setWeekRuleType} tokens={tokens} value={weekRuleType} />
          </>
        ) : null}

        <CapsuleButton disabled={submitting} label={submitting ? "保存中…" : "保存"} onPress={onSave} />
      </ScrollView>
    </View>
  );
}

function Field(props: {
  label: string;
  description: string;
  value: string;
  onChangeText: (t: string) => void;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
}): React.JSX.Element {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: props.tokens.text, fontWeight: "700" }}>{props.label}</Text>
      <Text style={{ color: props.tokens.textSecondary, fontSize: 12 }}>{props.description}</Text>
      <TextInput
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
  tokens: ReturnType<typeof useAppTheme>["tokens"];
}): React.JSX.Element {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={{ color: props.tokens.text, fontWeight: "700" }}>{props.label}</Text>
      <TextInput
        keyboardType="number-pad"
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
        }}
        value={props.value}
      />
    </View>
  );
}

function Row(props: {
  label: string;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
  trailing: React.ReactNode;
}): React.JSX.Element {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: props.tokens.text, fontWeight: "700" }}>{props.label}</Text>
      {props.trailing}
    </View>
  );
}

function WeekdayPicker(props: {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onChange: (v: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
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
              fontWeight: "800",
              color: on ? "#FFFFFF" : props.tokens.text,
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
  tokens: ReturnType<typeof useAppTheme>["tokens"];
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
              fontWeight: "800",
              color: on ? "#FFFFFF" : props.tokens.text,
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
  section: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
});
