import { useTheme } from '@/contexts/ThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { Icon } from 'react-native-paper';

const TAB_ICONS: Record<string, string> = {
  index: 'home-variant-outline',
  'stats/index': 'chart-box-outline',
  chores: 'checkbox-multiple-marked-outline',
  household: 'home-group',
  profile: 'account-circle-outline',
  'profile/index': 'account-circle-outline',
};

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
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
        tabBarIcon: ({ color, size }) => (
          <Icon source={TAB_ICONS[route.name] ?? 'dots-grid'} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hem',
        }}
      />
      <Tabs.Screen
        name="stats/index"
        options={{
          title: 'Statistik',
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
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}
