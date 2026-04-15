import { Tabs } from "expo-router";
import React from "react";
import { PillTabBar } from "@/components/PillTabBar";

export default function TabLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <PillTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "课表" }} />
      <Tabs.Screen name="features" options={{ title: "功能" }} />
      <Tabs.Screen name="todo" options={{ title: "待办" }} />
    </Tabs>
  );
}
