import { View, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { AmbientShadow, SubtleShadow, Radii } from '@/constants/theme';

export type ThemedCardProps = ViewProps & {
  /** 0 = surface, 1 = surfaceContainerLow, 2 = surfaceContainerLowest (default) */
  level?: 0 | 1 | 2;
  /** Adds ambient shadow for floating cards */
  floating?: boolean;
};

const levelToColorKey = {
  0: 'surface',
  1: 'surfaceContainerLow',
  2: 'surfaceContainerLowest',
} as const;

export function ThemedCard({
  level = 2,
  floating = false,
  style,
  children,
  ...otherProps
}: ThemedCardProps) {
  const backgroundColor = useThemeColor({}, levelToColorKey[level]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor },
        floating ? AmbientShadow : SubtleShadow,
        style,
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.md,
    padding: 16,
    // No borderWidth — ever. Tonal layering only.
  },
});
