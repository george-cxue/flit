import { useThemeMode } from '@/contexts/theme-context';

export function useColorScheme() {
  const { themeMode } = useThemeMode();
  return themeMode;
}
