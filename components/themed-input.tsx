import { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  type TextInputProps,
} from 'react-native';

import { Colors, Radii, Typography } from '@/constants/theme';

export type ThemedInputProps = TextInputProps;

export function ThemedInput({ style, onFocus, onBlur, ...props }: ThemedInputProps) {
  const [focused, setFocused] = useState(false);
  const c = Colors.light;

  return (
    <TextInput
      style={[
        styles.base,
        {
          backgroundColor: focused ? c.surfaceContainerLowest : c.surfaceContainerHigh,
          borderWidth: focused ? 2 : 0,
          borderColor: focused ? 'rgba(0, 75, 228, 0.2)' : 'transparent',
        },
        style,
      ]}
      placeholderTextColor={c.onSurfaceVariant}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    color: Colors.light.onSurface,
  },
});
