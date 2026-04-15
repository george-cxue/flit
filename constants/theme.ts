/**
 * "The Architectural Mentor" Design System
 *
 * Colors, typography, spacing, and elevation tokens.
 * Supports light and dark mode palettes.
 */

import { Platform, ViewStyle } from 'react-native';

// ─── Colors ───────────────────────────────────────────────
const lightPalette = {
    // Brand
    primary: '#004be4',
    primaryContainer: '#0356ff',
    onPrimary: '#ffffff',

    // Surfaces (tonal layering — no borders, only bg shifts)
    surface: '#f7f9fb',                        // Level 0: page background
    surfaceContainerLowest: '#ffffff',          // Level 2: interactive cards
    surfaceContainerLow: '#f0f3f5',            // Level 1: section containers
    surfaceContainerHigh: '#e8ecef',           // Input fills, divider strips
    surfaceContainerHighest: '#dfe4e8',        // Progress bar tracks
    surfaceTint: 'rgba(0, 75, 228, 0.04)',     // Subtle blue wash over white areas

    // On-surface
    onSurface: '#2c3437',                      // Primary text (never pure black)
    onSurfaceVariant: '#687076',               // Secondary/icon text

    // Outline (ghost borders — accessibility fallback only)
    outlineVariant: 'rgba(44, 52, 55, 0.15)',

    // Secondary
    secondaryContainer: '#e8ecef',
    onSecondaryContainer: '#2c3437',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',

    // Legacy compatibility aliases
    text: '#2c3437',
    background: '#f7f9fb',
    tint: '#004be4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#004be4',
    cardBackground: '#ffffff',
    border: 'rgba(44, 52, 55, 0.15)',
};

/** Use when surfaces must stay on the light palette regardless of app theme (e.g. embedded charts). */
export const fixedLightPalette = lightPalette;

const darkPalette = {
    primary: '#6B9BFF',
    primaryContainer: '#4a7aff',
    onPrimary: '#ffffff',

    surface: '#0F172A',
    surfaceContainerLowest: '#1E293B',
    surfaceContainerLow: '#162033',
    surfaceContainerHigh: '#253347',
    surfaceContainerHighest: '#2d3d54',
    surfaceTint: 'rgba(107, 155, 255, 0.04)',

    onSurface: '#ECEDEE',
    onSurfaceVariant: '#9BA1A6',

    outlineVariant: 'rgba(236, 237, 238, 0.15)',

    secondaryContainer: '#253347',
    onSecondaryContainer: '#ECEDEE',

    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',

    // Legacy compatibility aliases
    text: '#ECEDEE',
    background: '#0F172A',
    tint: '#6B9BFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#6B9BFF',
    cardBackground: '#1E293B',
    border: 'rgba(236, 237, 238, 0.15)',
};

// Mutable active palette to maintain compatibility with existing `Colors.light` usage.
const activePalette = { ...lightPalette };

export const Colors = {
  light: activePalette,
  dark: darkPalette,
};

export function setActiveThemePalette(mode: 'light' | 'dark') {
  const source = mode === 'dark' ? darkPalette : lightPalette;
  Object.assign(activePalette, source);
}

// ─── Typography ───────────────────────────────────────────
// Manrope: display & headlines (editorial, geometric)
// Inter: title, body, & labels (readability)

export const Typography = {
  'display-lg':   { fontFamily: 'Manrope_700Bold',      fontSize: 56, lineHeight: 64 },
  'display-md':   { fontFamily: 'Manrope_700Bold',      fontSize: 45, lineHeight: 52 },
  'headline-lg':  { fontFamily: 'Manrope_600SemiBold',  fontSize: 32, lineHeight: 40 },
  'headline-md':  { fontFamily: 'Manrope_600SemiBold',  fontSize: 28, lineHeight: 36 },
  'title-lg':     { fontFamily: 'Inter_600SemiBold',    fontSize: 22, lineHeight: 28 },
  'title-md':     { fontFamily: 'Inter_500Medium',      fontSize: 16, lineHeight: 24 },
  'body-lg':      { fontFamily: 'Inter_400Regular',     fontSize: 16, lineHeight: 24 },
  'body-md':      { fontFamily: 'Inter_400Regular',     fontSize: 14, lineHeight: 20 },
  'label-lg':     { fontFamily: 'Inter_500Medium',      fontSize: 14, lineHeight: 20 },
  'label-md':     { fontFamily: 'Inter_500Medium',      fontSize: 12, lineHeight: 16 },
} as const;

// Legacy Fonts export (platform-specific, for backward compat)
export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ─── Spacing ──────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Radii ────────────────────────────────────────────────
export const Radii = {
  sm: 8,
  md: 16,
  lg: 24,      // buttons
  xl: 28,
  full: 9999,  // pills, progress bars
} as const;

// ─── Elevation / Ambient Shadow ───────────────────────────
// Never pure black. Tinted with onSurface at 6% opacity.
export const AmbientShadow: ViewStyle = {
  shadowColor: '#2c3437',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 28,
  elevation: 6,
};

// Lighter shadow for subtle cards
export const SubtleShadow: ViewStyle = {
  shadowColor: '#2c3437',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 16,
  elevation: 3,
};
