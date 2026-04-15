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
import { HeroHeader } from "@/components/HeroHeader";
import { patchCourse, removeCourse } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN, penCard, penScrollContent } from "@/ui/pen";
import type { CourseMaterial } from "@nju/contracts";
import { createId, nowIso } from "@nju/domain";

export default function CourseDetailScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
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
        <HeroHeader title="课程详情" />
        <Text style={{ color: tokens.textSecondary, padding: 20, fontSize: 14 }}>未找到课程。</Text>
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
      <HeroHeader
        right={
          <Pressable hitSlop={10} onPress={toggleEdit}>
            {editing ? (
              <View
                style={[
                  styles.editChip,
                  { backgroundColor: tokens.accent },
                ]}
              >
                <Ionicons color={tokens.onAccent} name="checkmark" size={14} />
                <Text style={{ color: tokens.onAccent, fontSize: 12, fontFamily: fonts.regular }}>
                  编辑中
                </Text>
              </View>
            ) : (
              <Ionicons color={tokens.text} name="pencil" size={18} />
            )}
          </Pressable>
        }
        title="课程详情"
      />

      <ScrollView contentContainerStyle={penScrollContent(120)}>
        <Text style={{ color: tokens.text, fontSize: 17, fontWeight: "600", fontFamily: fonts.semibold }}>
          {course.title}
        </Text>

        <Text
          style={{
            color: tokens.textSecondary,
            fontSize: 11,
            lineHeight: 15,
            fontFamily: fonts.regular,
          }}
        >
          提示：未编辑时显示铅笔图标，进入编辑模式后切换为打勾。
        </Text>

        <Link href={`/courses/${course.id}/reminder`} asChild>
          <Pressable
            style={[
              styles.compactRow,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <Text style={{ color: tokens.text, fontSize: 15, fontFamily: fonts.regular }}>设置课程提醒</Text>
            <Text style={{ color: tokens.tertiary, fontSize: 18 }}>›</Text>
          </Pressable>
        </Link>

        <View style={penCard(tokens.surface, tokens.border)}>
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "600", fontFamily: fonts.semibold }}>
            课程网站
          </Text>
          {editing ? (
            <TextInput
              onChangeText={setWebsite}
              placeholder="https://..."
              placeholderTextColor={tokens.textSecondary}
              style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.wash }]}
              value={website}
            />
          ) : (
            <Text style={{ color: tokens.textSecondary, fontSize: 14, fontFamily: fonts.regular }}>
              {website.trim() || "（空）点击右上角编辑填写"}
            </Text>
          )}
          <Pressable onPress={openWebsite} style={{ marginTop: 4 }}>
            <Text style={{ color: tokens.accent, fontWeight: "600", fontSize: 14, fontFamily: fonts.semibold }}>
              在浏览器打开
            </Text>
          </Pressable>
        </View>

        <View style={penCard(tokens.surface, tokens.border)}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "600", fontFamily: fonts.semibold }}>资料</Text>
            {editing ? (
              <Pressable onPress={addMockMaterial}>
                <Text style={{ color: tokens.accent, fontWeight: "600", fontSize: 14 }}>+ 添加（示例）</Text>
              </Pressable>
            ) : null}
          </View>
          {materials.length === 0 ? (
            <Text style={{ color: tokens.textSecondary, fontSize: 14, fontFamily: fonts.regular }}>暂无资料</Text>
          ) : (
            materials.map((m) => (
              <View key={m.id} style={styles.matRow}>
                <Text style={{ color: tokens.text, flex: 1, fontSize: 15, fontFamily: fonts.regular }}>{m.name}</Text>
                {editing ? (
                  <Pressable hitSlop={10} onPress={() => removeMaterial(m.id)}>
                    <Text style={{ color: tokens.accent, fontWeight: "600" }}>×</Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={penCard(tokens.surface, tokens.border)}>
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "600", fontFamily: fonts.semibold }}>备注</Text>
          {editing ? (
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="写点什么…"
              placeholderTextColor={tokens.textSecondary}
              style={[
                styles.input,
                {
                  borderColor: tokens.border,
                  color: tokens.text,
                  minHeight: 96,
                  textAlignVertical: "top",
                  backgroundColor: tokens.wash,
                },
              ]}
              value={notes}
            />
          ) : (
            <Text style={{ color: tokens.textSecondary, fontSize: 14, fontFamily: fonts.regular }}>
              {notes.trim() || "（空）"}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => setDeleteOpen(true)}
          style={[
            styles.delOutline,
            { borderColor: tokens.border, backgroundColor: tokens.surface },
          ]}
        >
          <Text style={{ color: tokens.danger, fontWeight: "600", fontSize: 15, fontFamily: fonts.semibold }}>
            删除课程
          </Text>
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
  editChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: PEN.radiusPill,
    paddingHorizontal: 10,
    height: 30,
    gap: 4,
  },
  compactRow: {
    minHeight: PEN.rowCompactHeight,
    borderRadius: PEN.radiusCard,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: PEN.radiusCardDense,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  matRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  delOutline: {
    borderRadius: PEN.radiusCardDense,
    borderWidth: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
