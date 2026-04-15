import { Link, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { HeroHeader } from "@/components/HeroHeader";
import { PenHeaderChip } from "@/components/PenHeaderChip";
import { addLog } from "@/state/actions";
import { useAppStore } from "@/state/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { PEN } from "@/ui/pen";
import type { LogEntry } from "@nju/contracts";

export default function LogsScreen(): React.JSX.Element {
  const { tokens, fonts } = useAppTheme();
  const router = useRouter();
  const logs = useAppStore((s) => [...s.state.logs].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)));

  const onCreate = (): void => {
    const id = addLog("新日志", "");
    router.push(`/logs/${id}`);
  };

  const renderItem = ({ item }: { item: LogEntry }): React.JSX.Element => (
    <Link asChild href={`/logs/${item.id}`}>
      <Pressable style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
        <Text style={{ color: tokens.textSecondary, fontSize: 12, fontFamily: fonts.regular }}>{item.updatedAt}</Text>
        <Text style={{ color: tokens.text, fontWeight: "600", marginTop: 6, fontSize: 16, fontFamily: fonts.semibold }}>
          {item.title}
        </Text>
      </Pressable>
    </Link>
  );

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <HeroHeader
        right={<PenHeaderChip icon="add" label="新建" onPress={onCreate} variant="primary" />}
        title="我的日志"
      />
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: PEN.padH,
          paddingTop: 8,
          paddingBottom: 40,
          gap: PEN.gapList,
        }}
        data={logs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: tokens.textSecondary, textAlign: "center", marginTop: 24, fontSize: 14 }}>
            暂无日志
          </Text>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, borderRadius: PEN.radiusCard, padding: 14 },
});
