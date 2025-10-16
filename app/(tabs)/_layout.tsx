import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="stats/index"
        options={{
          title: 'Stats',
        }}
      />
      <Tabs.Screen
        name="chores"
        options={{
          title: 'Chores',
        }}
      />
      <Tabs.Screen
        name="household/index"
        options={{
          title: 'Households',
        }}
      />
    </Tabs>
  );
}
