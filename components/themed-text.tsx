import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'display-lg'
    | 'display-md'
    | 'headline-lg'
    | 'headline-md'
    | 'title-lg'
    | 'title-md'
    | 'body-lg'
    | 'body-md'
    | 'label-lg'
    | 'label-md';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'onSurface');
  const flattenedStyle = StyleSheet.flatten(style);
  const dynamicLineHeight =
    typeof flattenedStyle?.fontSize === 'number' && flattenedStyle?.lineHeight == null
      ? Math.round(flattenedStyle.fontSize * 1.25)
      : undefined;

  return (
    <Text
      style={[
        { color },
        styles[type] ?? styles.default,
        dynamicLineHeight != null ? { lineHeight: dynamicLineHeight } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Legacy types mapped to new typography
  default: {
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    lineHeight: Typography['body-lg'].lineHeight,
  },
  defaultSemiBold: {
    fontFamily: Typography['title-md'].fontFamily,
    fontSize: Typography['title-md'].fontSize,
    lineHeight: Typography['title-md'].lineHeight,
  },
  title: {
    fontFamily: Typography['headline-lg'].fontFamily,
    fontSize: Typography['headline-lg'].fontSize,
    lineHeight: Typography['headline-lg'].lineHeight,
  },
  subtitle: {
    fontFamily: Typography['title-lg'].fontFamily,
    fontSize: Typography['title-lg'].fontSize,
    lineHeight: Typography['title-lg'].lineHeight,
  },
  link: {
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: 16,
    lineHeight: 30,
    color: '#004be4',
  },

  // New typography scale
  'display-lg': {
    fontFamily: Typography['display-lg'].fontFamily,
    fontSize: Typography['display-lg'].fontSize,
    lineHeight: Typography['display-lg'].lineHeight,
  },
  'display-md': {
    fontFamily: Typography['display-md'].fontFamily,
    fontSize: Typography['display-md'].fontSize,
    lineHeight: Typography['display-md'].lineHeight,
  },
  'headline-lg': {
    fontFamily: Typography['headline-lg'].fontFamily,
    fontSize: Typography['headline-lg'].fontSize,
    lineHeight: Typography['headline-lg'].lineHeight,
  },
  'headline-md': {
    fontFamily: Typography['headline-md'].fontFamily,
    fontSize: Typography['headline-md'].fontSize,
    lineHeight: Typography['headline-md'].lineHeight,
  },
  'title-lg': {
    fontFamily: Typography['title-lg'].fontFamily,
    fontSize: Typography['title-lg'].fontSize,
    lineHeight: Typography['title-lg'].lineHeight,
  },
  'title-md': {
    fontFamily: Typography['title-md'].fontFamily,
    fontSize: Typography['title-md'].fontSize,
    lineHeight: Typography['title-md'].lineHeight,
  },
  'body-lg': {
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    lineHeight: Typography['body-lg'].lineHeight,
  },
  'body-md': {
    fontFamily: Typography['body-md'].fontFamily,
    fontSize: Typography['body-md'].fontSize,
    lineHeight: Typography['body-md'].lineHeight,
  },
  'label-lg': {
    fontFamily: Typography['label-lg'].fontFamily,
    fontSize: Typography['label-lg'].fontSize,
    lineHeight: Typography['label-lg'].lineHeight,
  },
  'label-md': {
    fontFamily: Typography['label-md'].fontFamily,
    fontSize: Typography['label-md'].fontSize,
    lineHeight: Typography['label-md'].lineHeight,
  },
});
