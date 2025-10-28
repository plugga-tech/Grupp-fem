import { useTheme } from '@/state/ThemeContext';
import React from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';

type AppHeaderAction = {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

type AppHeaderProps = {
  title?: string;
  titleContent?: React.ReactNode;
  leftAction?: AppHeaderAction;
  rightActions?: AppHeaderAction[];
};

export default function AppHeader({
  title,
  titleContent,
  leftAction,
  rightActions = [],
}: AppHeaderProps) {
  const { colors } = useTheme();

  return (
    <Appbar.Header
      mode="center-aligned"
      style={{
        backgroundColor: colors.header,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
      }}
    >
      {/* Visa leftAction om den finns, annars visa tom View för spacing */}
      {leftAction ? (
        <Appbar.Action
          icon={leftAction.icon}
          onPress={leftAction.onPress}
          accessibilityLabel={leftAction.accessibilityLabel}
          iconColor={colors.text}
        />
      ) : (
        <View style={{ width: 48 }} />
      )}
      
      {titleContent ? (
        <View style={{ flex: 1, alignItems: 'center' }}>{titleContent}</View>
      ) : (
        <Appbar.Content title={title || ''} color={colors.text} />
      )}

      {rightActions.length > 0 ? (
        rightActions.map((action) => (
          <Appbar.Action
            key={action.icon}
            icon={action.icon}
            onPress={action.onPress}
            accessibilityLabel={action.accessibilityLabel}
            iconColor={colors.text}
          />
        ))
      ) : (
        <View style={{ width: 48 }} />
      )}
    </Appbar.Header>
  );
}