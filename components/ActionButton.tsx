import { Pressable, ViewStyle, StyleSheet, Text } from 'react-native';
import { Icon } from 'react-native-paper';

type ButtonProps = {
  label: string;
  icon: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  style?: ViewStyle;
};

export default function ActionButton({
  label,
  icon,
  onPress,
  backgroundColor = '#ffffffff',
  textColor = '#000000ff',
  iconColor,
  style,
}: ButtonProps) {
  return (
    <Pressable style={[styles.button, { backgroundColor }, style]} onPress={onPress}>
      <Icon source={icon} size={18} color={iconColor ?? textColor} />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: '600',
  },
});
