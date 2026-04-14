import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
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
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { patchCourse, removeCourse } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { CourseMaterial } from "@nju/contracts";
import { createId, nowIso } from "@nju/domain";

export default function CourseDetailScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId: string }>();
  const courseId = params.courseId;

  const course = useAppStore((s) => s.state.courses.find((c) => c.id === courseId));

  const [editing, setEditing] = React.useState(false);
  const [notes, setNotes] = React.useState(course?.notes ?? "");
  const [website, setWebsite] = React.useState(course?.website ?? "");
  const [materials, setMaterials] = React.useState<CourseMaterial[]>(course?.materials ?? []);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!course) {
      return;
    }
    setNotes(course.notes ?? "");
    setWebsite(course.website ?? "");
    setMaterials(course.materials ?? []);
  }, [course?.id, course?.notes, course?.website, course?.materials, course]);

  if (!course) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.bg }]}>
        <ScreenHeader title="课程详情" />
        <Text style={{ color: tokens.textSecondary, padding: 16 }}>未找到课程。</Text>
      </View>
    );
  }

  const persistField = (): void => {
    patchCourse(course.id, {
      materials,
      notes: notes.trim(),
      website: website.trim(),
    });
  };

  const toggleEdit = (): void => {
    if (editing) {
      persistField();
    }
    setEditing((v) => !v);
  };

  const addMockMaterial = (): void => {
    const item: CourseMaterial = {
      id: createId("mat"),
      name: `资料 ${materials.length + 1}`,
      localUri: "mock://local",
      addedAt: nowIso(),
    };
    setMaterials((m) => [...m, item]);
  };

  const removeMaterial = (id: string): void => {
    Alert.alert("删除资料？", "该操作不可撤销。", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => setMaterials((m) => m.filter((x) => x.id !== id)),
      },
    ]);
  };

  const openWebsite = async (): Promise<void> => {
    const url = website.trim();
    if (!url) {
      return;
    }
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    try {
      await WebBrowser.openBrowserAsync(normalized);
    } catch {
      Alert.alert("无法打开链接", "请检查网址格式。");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader
        right={
          <Pressable hitSlop={10} onPress={toggleEdit}>
            <Ionicons color={tokens.accent} name={editing ? "checkmark" : "pencil"} size={20} />
          </Pressable>
        }
        title={course.title}
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}>
        <Text style={{ color: tokens.textSecondary, fontSize: 12, lineHeight: 16 }}>
          其余信息可由你补充；空白项会在浏览态给出轻提示（当前为工程实现版）。
        </Text>

        <Link href={`/courses/${course.id}/reminder`} asChild>
          <Pressable style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <Text style={{ color: tokens.text, fontWeight: "900" }}>设置课程提醒</Text>
            <Text style={{ color: tokens.textSecondary, marginTop: 6, fontSize: 12 }}>
              按课程维度配置提前量与提醒方式
            </Text>
          </Pressable>
        </Link>

        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={{ color: tokens.text, fontWeight: "900" }}>课程网站</Text>
          {editing ? (
            <TextInput
              onChangeText={setWebsite}
              placeholder="https://..."
              placeholderTextColor={tokens.textSecondary}
              style={[styles.input, { borderColor: tokens.border, color: tokens.text }]}
              value={website}
            />
          ) : (
            <Text style={{ color: tokens.textSecondary, marginTop: 8 }}>{website.trim() || "（空）点击右上角编辑填写"}</Text>
          )}
          <Pressable onPress={openWebsite} style={{ marginTop: 10 }}>
            <Text style={{ color: tokens.accent, fontWeight: "800" }}>在浏览器打开</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: tokens.text, fontWeight: "900" }}>资料</Text>
            {editing ? (
              <Pressable onPress={addMockMaterial}>
                <Text style={{ color: tokens.accent, fontWeight: "900" }}>+ 添加（示例）</Text>
              </Pressable>
            ) : null}
          </View>
          {materials.length === 0 ? (
            <Text style={{ color: tokens.textSecondary, marginTop: 8 }}>暂无资料</Text>
          ) : (
            materials.map((m) => (
              <View key={m.id} style={styles.matRow}>
                <Text style={{ color: tokens.text, flex: 1 }}>{m.name}</Text>
                {editing ? (
                  <Pressable hitSlop={10} onPress={() => removeMaterial(m.id)}>
                    <Text style={{ color: tokens.accent, fontWeight: "900" }}>×</Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={{ color: tokens.text, fontWeight: "900" }}>备注</Text>
          {editing ? (
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="写点什么…"
              placeholderTextColor={tokens.textSecondary}
              style={[
                styles.input,
                { borderColor: tokens.border, color: tokens.text, minHeight: 96, textAlignVertical: "top" },
              ]}
              value={notes}
            />
          ) : (
            <Text style={{ color: tokens.textSecondary, marginTop: 8 }}>{notes.trim() || "（空）"}</Text>
          )}
        </View>

        <Pressable onPress={() => setDeleteOpen(true)} style={{ paddingVertical: 14 }}>
          <Text style={{ color: tokens.danger, fontWeight: "900", textAlign: "center" }}>删除课程</Text>
        </Pressable>
      </ScrollView>

      <ConfirmDialog
        cancelLabel="取消"
        confirmLabel="删除"
        destructive
        message="删除后将移除课表与关联展示（按当前数据模型处理）。此操作不可恢复。"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          removeCourse(course.id);
          router.back();
        }}
        title="确认删除课程？"
        visible={deleteOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  matRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
