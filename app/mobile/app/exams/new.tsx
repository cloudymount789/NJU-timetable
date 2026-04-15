import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppSwitch } from "@/components/AppSwitch";
import { CapsuleButton } from "@/components/CapsuleButton";
import { HeroHeader } from "@/components/HeroHeader";
import { addExam, addHomework } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { ThemeTokens } from "@/theme/tokens";
import { PEN, penCard, penScrollContent, penSectionTitle } from "@/ui/pen";

export default function AddExamHomeworkScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
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
          deadlines: homeworkDdl.trim() ? [{ dueAt: homeworkDdl.trim() }] : [],
          ...(rel ? { relatedContent: rel } : {}),
          repeat,
        },
      });
    }
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader title="添加考试/作业" />
      <ScrollView contentContainerStyle={penScrollContent(40)}>
        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>类型</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <CapsuleButton
            label={kind === "exam" ? "考试 ✓" : "考试"}
            onPress={() => setKind("exam")}
            variant={kind === "exam" ? "primary" : "secondary"}
          />
          <CapsuleButton
            label={kind === "homework" ? "作业 ✓" : "作业"}
            onPress={() => setKind("homework")}
            variant={kind === "homework" ? "primary" : "secondary"}
          />
        </View>

        <View style={penCard(tokens.surface, tokens.border, 16)}>
          <Field fonts={fonts} label="标题" onChangeText={setTitle} tokens={tokens} value={title} />
        </View>

        <Text style={penSectionTitle(tokens.textSecondary, fonts.semibold)}>关联课程（可选）</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
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
          <View style={penCard(tokens.surface, tokens.border, 16)}>
            <Field fonts={fonts} label="考试时间" onChangeText={setExamTime} tokens={tokens} value={examTime} />
            <Field fonts={fonts} label="地点" onChangeText={setPlace} tokens={tokens} value={place} />
            <Field fonts={fonts} label="考试类型" onChangeText={setExamType} tokens={tokens} value={examType} />
            <Field fonts={fonts} label="备注" onChangeText={setNote} tokens={tokens} value={note} />
          </View>
        ) : (
          <View style={penCard(tokens.surface, tokens.border, 16)}>
            <Field fonts={fonts} label="截止时间" onChangeText={setHomeworkDdl} tokens={tokens} value={homeworkDdl} />
            <Field fonts={fonts} label="关联内容" onChangeText={setRelated} tokens={tokens} value={related} />
            <View style={styles.toggleRow}>
              <Text style={{ color: tokens.text, fontSize: 15, fontFamily: fonts.regular }}>重复</Text>
              <AppSwitch onValueChange={setRepeat} value={repeat} />
            </View>
          </View>
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
  tokens: ThemeTokens;
  fonts: { regular?: string; semibold?: string };
}): React.JSX.Element {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: props.tokens.text, fontWeight: "600", fontFamily: props.fonts.semibold }}>
        {props.label}
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
});
