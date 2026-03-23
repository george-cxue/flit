import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Radii } from '@/constants/theme';

export type ThemedProgressBarProps = {
  /** 0 to 1 */
  progress: number;
  height?: number;
};

export function ThemedProgressBar({ progress, height = 8 }: ThemedProgressBarProps) {
  const c = Colors.light;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: c.surfaceContainerHighest }]}>
      <LinearGradient
        colors={[c.primary, c.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.fill,
          { width: `${clampedProgress * 100}%`, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: Radii.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: Radii.full,
  },
});
