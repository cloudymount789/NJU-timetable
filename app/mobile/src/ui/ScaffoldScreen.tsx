import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface ScaffoldScreenProps {
  title: string;
  description: string;
  bullets?: string[];
}

export function ScaffoldScreen(props: ScaffoldScreenProps): React.JSX.Element {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.description}>{props.description}</Text>
      <View style={styles.block}>
        {(props.bullets ?? []).map((line) => (
          <Text key={line} style={styles.bullet}>
            - {line}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
  block: {
    gap: 8,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 12,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1f2937",
  },
});
