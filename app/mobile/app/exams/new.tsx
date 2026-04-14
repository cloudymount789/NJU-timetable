import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { addExam, addHomework } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";

export default function AddExamHomeworkScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const courses = useAppStore((s) => s.state.courses);

  const [kind, setKind] = React.useState<"exam" | "homework">("exam");
  const [title, setTitle] = React.useState("");
  const [examTime, setExamTime] = React.useState("");
  const [place, setPlace] = React.useState("");
  const [examType, setExamType] = React.useState("");
  const [note, setNote] = React.useState("");
  const [homeworkDdl, setHomeworkDdl] = React.useState("");
  const [related, setRelated] = React.useState("");
  const [repeat, setRepeat] = React.useState(false);
  const [courseId, setCourseId] = React.useState<string | undefined>(undefined);

  const onSave = (): void => {
    if (!title.trim()) {
      Alert.alert("缺少标题", "请填写标题。");
      return;
    }
    if (kind === "exam") {
      const loc = place.trim();
      const et = examType.trim();
      const nt = note.trim();
      addExam({
        title: title.trim(),
        ...(courseId ? { courseId } : {}),
        exam: {
          dateTime: examTime.trim() || new Date().toISOString(),
          ...(loc ? { location: loc } : {}),
          ...(et ? { examType: et } : {}),
          ...(nt ? { note: nt } : {}),
        },
      });
    } else {
      const rel = related.trim();
      addHomework({
        title: title.trim(),
        ...(courseId ? { courseId } : {}),
        homework: {
          deadlines: homeworkDdl.trim()
            ? [{ dueAt: homeworkDdl.trim() }]
            : [],
          ...(rel ? { relatedContent: rel } : {}),
          repeat,
        },
      });
    }
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader title="添加考试/作业" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: tokens.text, fontWeight: "900" }}>类型</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <CapsuleButton label={kind === "exam" ? "考试 \u2713" : "考试"} onPress={() => setKind("exam")} variant={kind === "exam" ? "primary" : "secondary"} />
          <CapsuleButton label={kind === "homework" ? "作业 \u2713" : "作业"} onPress={() => setKind("homework")} variant={kind === "homework" ? "primary" : "secondary"} />
        </View>

        <Field label="标题" onChangeText={setTitle} tokens={tokens} value={title} />

        <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>关联课程（可选）</Text>
        <ScrollView horizontal style={{ maxHeight: 40 }} contentContainerStyle={{ gap: 8 }}>
          <CapsuleButton label="无" onPress={() => setCourseId(undefined)} variant={courseId ? "secondary" : "primary"} />
          {courses.map((c) => (
            <CapsuleButton
              key={c.id}
              label={c.title}
              onPress={() => setCourseId(c.id)}
              variant={courseId === c.id ? "primary" : "secondary"}
            />
          ))}
        </ScrollView>

        {kind === "exam" ? (
          <>
            <Field label="考试时间（ISO 文本占位）" onChangeText={setExamTime} tokens={tokens} value={examTime} />
            <Field label="地点" onChangeText={setPlace} tokens={tokens} value={place} />
            <Field label="考试类型" onChangeText={setExamType} tokens={tokens} value={examType} />
            <Field label="备注" onChangeText={setNote} tokens={tokens} value={note} />
          </>
        ) : (
          <>
            <Field label="DDL（ISO 文本占位）" onChangeText={setHomeworkDdl} tokens={tokens} value={homeworkDdl} />
            <Field label="关联内容" onChangeText={setRelated} tokens={tokens} value={related} />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: tokens.text, fontWeight: "900" }}>重复</Text>
              <AppSwitch onValueChange={setRepeat} value={repeat} />
            </View>
          </>
        )}

        <CapsuleButton label="保存" onPress={onSave} />
      </ScrollView>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
}): React.JSX.Element {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: props.tokens.text, fontWeight: "800" }}>{props.label}</Text>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
});
