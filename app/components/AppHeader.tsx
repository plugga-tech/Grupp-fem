import { Appbar } from 'react-native-paper';
import React from 'react';

type AppHeaderAction = {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

type AppHeaderProps = {
  title: string;
  leftAction?: AppHeaderAction;
  rightActions?: AppHeaderAction[];
};

export function AppHeader({ title, leftAction, rightActions = [] }: AppHeaderProps) {
  return (
    <Appbar.Header mode="center-aligned">
      {leftAction ? (
        <Appbar.Action
          icon={leftAction.icon}
          onPress={leftAction.onPress}
          accessibilityLabel={leftAction.accessibilityLabel}
        />
      ) : (
        <Appbar.Action icon="menu" onPress={() => {}} />
      )}
      <Appbar.Content title={title} />
      {rightActions.map((action) => (
        <Appbar.Action
          key={action.icon}
          icon={action.icon}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel}
        />
      ))}
    </Appbar.Header>
  );
}
