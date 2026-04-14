import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAppTheme } from "@/theme/ThemeContext";

export default function TabLayout(): React.JSX.Element {
  const { tokens } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.textSecondary,
        tabBarStyle: {
          backgroundColor: tokens.surface,
          borderTopColor: tokens.border,
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "课表",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="calendar" size={size} />,
        }}
      />
      <Tabs.Screen
        name="features"
        options={{
          title: "功能",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="grid" size={size} />,
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: "待办",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="checkbox" size={size} />,
        }}
      />
    </Tabs>
  );
}
