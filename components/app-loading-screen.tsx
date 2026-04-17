import { Image, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useThemeMode } from '@/contexts/theme-context';

interface AppLoadingScreenProps {
  message?: string;
}

export function AppLoadingScreen({ message }: AppLoadingScreenProps) {
  const { themeMode } = useThemeMode();
  const c = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('@/assets/images/flit-logo.png')} style={styles.logo} resizeMode="contain" />
        {message ? (
          <ThemedText type="body-md" style={[styles.message, { color: c.onSurfaceVariant }]}>
            {message}
          </ThemedText>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    width: 96,
    height: 96,
  },
  message: {
    textAlign: 'center',
  },
});
