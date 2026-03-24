import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setActiveThemePalette } from '@/constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  isThemeLoaded: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleThemeMode: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'flit_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const nextTheme: ThemeMode = savedTheme === 'dark' ? 'dark' : 'light';
        setActiveThemePalette(nextTheme);
        if (mounted) {
          setThemeModeState(nextTheme);
        }
      } catch {
        setActiveThemePalette('light');
      } finally {
        if (mounted) {
          setIsThemeLoaded(true);
        }
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setActiveThemePalette(mode);
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const toggleThemeMode = useCallback(async () => {
    const nextMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(nextMode);
  }, [setThemeMode, themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      isDarkMode: themeMode === 'dark',
      isThemeLoaded,
      setThemeMode,
      toggleThemeMode,
    }),
    [themeMode, isThemeLoaded, setThemeMode, toggleThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}
