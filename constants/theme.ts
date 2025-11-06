/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Flit brand colors - royal blue palette
const royalBlue = '#4169E1';
const lightBlue = '#6B9BFF';
const skyBlue = '#E6F0FF';
const navyBlue = '#2C4B9C';

const tintColorLight = royalBlue;
const tintColorDark = lightBlue;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Flit-specific colors
    primary: royalBlue,
    primaryLight: lightBlue,
    primaryPale: skyBlue,
    primaryDark: navyBlue,
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    cardBackground: '#F8FAFC',
    border: '#E2E8F0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Flit-specific colors (dark mode)
    primary: lightBlue,
    primaryLight: '#8BB4FF',
    primaryPale: '#1E3A5F',
    primaryDark: royalBlue,
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    cardBackground: '#1E293B',
    border: '#334155',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
