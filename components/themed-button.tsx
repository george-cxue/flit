import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { Colors, Radii, Typography } from '@/constants/theme';

export type ThemedButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function ThemedButton({
  title,
  variant = 'primary',
  style,
  textStyle,
  ...props
}: ThemedButtonProps) {
  const c = Colors.light;

  const containerStyles: ViewStyle[] = [styles.base];
  const labelStyles: TextStyle[] = [styles.label];

  switch (variant) {
    case 'primary':
      containerStyles.push({ backgroundColor: c.primary });
      labelStyles.push({ color: c.onPrimary });
      break;
    case 'secondary':
      containerStyles.push({ backgroundColor: c.secondaryContainer });
      labelStyles.push({ color: c.onSecondaryContainer });
      break;
    case 'ghost':
      containerStyles.push({ backgroundColor: 'transparent' });
      labelStyles.push({ color: c.primary });
      break;
  }

  if (style) containerStyles.push(style);
  if (textStyle) labelStyles.push(textStyle);

  return (
    <Pressable style={containerStyles} {...props}>
      <Text style={labelStyles}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Typography['title-md'].fontFamily,
    fontSize: Typography['title-md'].fontSize,
    lineHeight: Typography['title-md'].lineHeight,
  },
});
