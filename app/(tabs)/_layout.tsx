import { useTheme } from '@/contexts/ThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.header,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
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
          href: null,
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: 'Households',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
