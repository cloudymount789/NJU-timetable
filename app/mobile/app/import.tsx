import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppTheme } from "@/theme/ThemeContext";

export default function ImportScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader title="导入课表" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: tokens.textSecondary, lineHeight: 20 }}>
          工程版：教务统一认证与 OCR 将走可选 BFF（Mock → 真网关）。当前提供占位流程用于联调 UI 与错误提示。
        </Text>
        <CapsuleButton
          label="教务登录导入（Mock）"
          onPress={() =>
            Alert.alert("Mock", "此处将打开 WebView/系统浏览器登录流程；接入 BFF 后替换为真实实现。")
          }
        />
        <CapsuleButton
          label="OCR 导入（Mock）"
          onPress={() => Alert.alert("Mock", "此处将选择截图并指定教学周范围；接入异步任务后替换为真实实现。")}
          variant="secondary"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
