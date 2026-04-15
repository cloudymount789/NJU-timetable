import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { HeroHeader } from "@/components/HeroHeader";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN, penCard, penScrollContent } from "@/ui/pen";

export default function ImportScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader title="导入课表" />
      <ScrollView contentContainerStyle={penScrollContent(40)}>
        <Text
          style={{
            color: tokens.textSecondary,
            fontSize: 15,
            lineHeight: 20,
            fontFamily: fonts.regular,
          }}
        >
          登录教务系统或选择其他方式同步
        </Text>

        <View style={[penCard(tokens.surface, tokens.border, 16), { gap: 12 }]}>
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "600", fontFamily: fonts.semibold }}>
            教务统一认证
          </Text>
          <Pressable
            onPress={() =>
              Alert.alert("Mock", "此处将打开 WebView/系统浏览器登录流程；接入 BFF 后替换为真实实现。")
            }
            style={[
              styles.primaryCta,
              { backgroundColor: tokens.accent },
            ]}
          >
            <Text style={{ color: tokens.onAccent, fontWeight: "600", fontFamily: fonts.semibold }}>
              教务登录导入（Mock）
            </Text>
          </Pressable>
        </View>

        <Text
          style={{
            color: tokens.textSecondary,
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 0.4,
            fontFamily: fonts.semibold,
          }}
        >
          其他方式
        </Text>

        <Pressable
          onPress={() => Alert.alert("Mock", "此处将选择截图并指定教学周范围；接入异步任务后替换为真实实现。")}
          style={[
            styles.altRow,
            { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
        >
          <Text style={{ color: tokens.text, fontSize: 15, fontFamily: fonts.regular }}>OCR 导入（Mock）</Text>
          <Text style={{ color: tokens.tertiary, fontSize: 18 }}>›</Text>
        </Pressable>

        <Text
          style={{
            color: tokens.textSecondary,
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 0.4,
            fontFamily: fonts.semibold,
          }}
        >
          导入到
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={[penCard(tokens.surface, tokens.border, 16), { gap: 8 }]}
        >
          <Text style={{ color: tokens.textSecondary, fontSize: 13, fontFamily: fonts.regular }}>
            当前课表 · 工程版占位
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  primaryCta: {
    borderRadius: PEN.radiusPillCta,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  altRow: {
    minHeight: PEN.rowMinHeight,
    borderRadius: PEN.radiusCard,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
