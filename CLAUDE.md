# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flit is a React Native mobile application built with Expo and TypeScript. It uses Expo Router for file-based navigation and supports iOS, Android, and web platforms. The project uses React 19.1.0 with the new React architecture enabled (`newArchEnabled: true`).

## Development Commands

### Running the App
```bash
npm start              # Start Expo dev server
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run in web browser
```

### Code Quality
```bash
npm run lint           # Run ESLint with expo config
```

### Project Reset
```bash
npm run reset-project  # Move starter code to app-example/ and create blank app/
```

## Architecture & Key Patterns

### File-Based Routing (Expo Router)
- Routes are defined by the file structure in the `app/` directory
- `app/_layout.tsx` - Root layout with theme provider and Stack navigation
- `app/(tabs)/` - Tab-based navigation group (home and explore screens)
- `app/(tabs)/_layout.tsx` - Tab layout configuration
- `unstable_settings.anchor` in root layout sets default route anchor to `(tabs)`

### TypeScript Path Aliases
- `@/*` maps to root directory (configured in [tsconfig.json](tsconfig.json))
- Use `@/components/...`, `@/hooks/...`, `@/constants/...` for imports

### Theming System
The app uses a centralized theming system with light/dark mode support:

1. **Color definitions**: [constants/theme.ts](constants/theme.ts) exports `Colors` object with light/dark variants
2. **Theme hooks**:
   - `useColorScheme()` from [hooks/use-color-scheme.ts](hooks/use-color-scheme.ts) - detects system theme
   - `useThemeColor()` from [hooks/use-theme-color.ts](hooks/use-theme-color.ts) - retrieves theme-aware colors
3. **Themed components**: `ThemedText` and `ThemedView` automatically adapt to color scheme
4. **Font system**: Platform-specific font mappings (SF Pro on iOS, system fonts on Android/web)

### Component Patterns

#### Themed Components
Always use `ThemedText` and `ThemedView` instead of plain `Text` and `View` for automatic theme support:
```tsx
<ThemedView>
  <ThemedText type="title">Hello</ThemedText>
</ThemedView>
```

#### Platform-Specific Components
The project uses platform-specific files for conditional implementations:
- `icon-symbol.ios.tsx` - Uses native SF Symbols on iOS
- `icon-symbol.tsx` - Falls back to Material Icons on Android/web
- `use-color-scheme.web.ts` - Web-specific implementation

When adding new icons to `IconSymbol`, manually map SF Symbol names to Material Icon names in the `MAPPING` constant.

#### Haptic Feedback
Tab navigation includes iOS haptic feedback via the `HapticTab` component wrapper.

## Project Structure

```
app/                    # File-based routes (Expo Router)
  ├── (tabs)/          # Tab navigation group
  ├── _layout.tsx      # Root layout with theme provider
  └── modal.tsx        # Modal screen example
components/            # Reusable UI components
  ├── themed-*.tsx     # Theme-aware wrappers (Text, View)
  ├── ui/              # UI primitives (icons, collapsibles)
  └── *.tsx            # Feature components
hooks/                 # Custom React hooks (theme, color scheme)
constants/             # App constants (colors, fonts, themes)
assets/                # Static assets (images, icons)
scripts/               # Build/utility scripts
```

## Key Configuration

### Expo Features Enabled
- **Typed Routes**: Auto-generated route types for type-safe navigation
- **React Compiler**: Experimental React compiler enabled
- **New Architecture**: React Native's new architecture enabled
- **Edge-to-Edge**: Android edge-to-edge display

### ESLint Configuration
- Uses `eslint-config-expo` flat config
- Code actions on save: fix all, organize imports, sort members (VSCode)
- Run linting before commits

### Platform Support
- iOS: Supports tablets
- Android: Edge-to-edge enabled, predictive back gesture disabled
- Web: Static output with custom favicon

## Development Notes

- This project was bootstrapped with `create-expo-app`
- Install dependencies with `npm install` (not yarn or pnpm)
- The app uses strict TypeScript mode
- Development builds, iOS simulator, Android emulator, and Expo Go are all supported
- Use VSCode extension: `expo.vscode-expo-tools` (recommended in workspace settings)
