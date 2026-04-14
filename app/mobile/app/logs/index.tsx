import { Link, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { CapsuleButton } from "@/components/CapsuleButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { addLog } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import type { LogEntry } from "@nju/contracts";

export default function LogsScreen(): React.JSX.Element {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const logs = useAppStore((s) => [...s.state.logs].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)));

  const onCreate = (): void => {
    const id = addLog("新日志", "");
    router.push(`/logs/${id}`);
  };

  const renderItem = ({ item }: { item: LogEntry }): React.JSX.Element => (
    <Link asChild href={`/logs/${item.id}`}>
      <Pressable style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
        <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>{item.updatedAt}</Text>
        <Text style={{ color: tokens.text, fontWeight: "900", marginTop: 6 }}>{item.title}</Text>
      </Pressable>
    </Link>
  );

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <ScreenHeader right={<CapsuleButton label="新建" onPress={onCreate} />} title="我的日志" />
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        data={logs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: tokens.textSecondary, textAlign: "center", marginTop: 24 }}>暂无日志</Text>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
});
