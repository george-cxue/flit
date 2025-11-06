# Onboarding Flow Implementation

## Overview

The Flit app now implements persistent onboarding state tracking. First-time users are automatically directed to the onboarding screen, while returning users skip directly to the home screen.

## How It Works

### 1. Persistent Storage
- Uses `@react-native-async-storage/async-storage` to store onboarding completion status
- Storage key: `@flit_onboarding_completed`
- Value stored: `'true'` when completed, `null` when not completed

### 2. Onboarding Hook
**Location:** [hooks/use-onboarding.ts](hooks/use-onboarding.ts)

Provides three key functions:
- `hasCompletedOnboarding` - Boolean indicating if user has finished onboarding
- `completeOnboarding()` - Marks onboarding as complete and persists to storage
- `resetOnboarding()` - Clears onboarding status (useful for testing)

### 3. Root Layout Navigation Logic
**Location:** [app/_layout.tsx](app/_layout.tsx)

The root layout uses `useSegments()` and `useRouter()` to handle automatic routing:

```typescript
// If user hasn't completed onboarding → redirect to /onboarding
if (!hasCompletedOnboarding && !inOnboarding) {
  router.replace('/onboarding');
}

// If user has completed onboarding → redirect to /home
else if (hasCompletedOnboarding && !inTabs) {
  router.replace('/(tabs)/home');
}
```

### 4. Onboarding Completion
**Location:** [app/onboarding.tsx](app/onboarding.tsx)

When the user:
- **Completes all 3 steps** and clicks "Let's Start!"
- **Clicks "Skip"** at any point

The app:
1. Calls `completeOnboarding()` to persist the state
2. Navigates to `/(tabs)/home`
3. On next app launch, user goes directly to home

## User Flow

### First-Time User
```
App Launch
    ↓
Root Layout checks onboarding status
    ↓
hasCompletedOnboarding = false
    ↓
Navigate to /onboarding
    ↓
User completes or skips onboarding
    ↓
completeOnboarding() is called
    ↓
Navigate to /(tabs)/home
```

### Returning User
```
App Launch
    ↓
Root Layout checks onboarding status
    ↓
hasCompletedOnboarding = true
    ↓
Navigate directly to /(tabs)/home
```

## Testing the Flow

### Method 1: Debug Button (Recommended)
1. Launch the app and complete onboarding
2. Scroll to the bottom of the **Home** screen
3. Tap the "🔄 Reset Onboarding (Debug)" button
4. App will clear onboarding state and redirect to onboarding screen
5. Complete onboarding again to test the flow

### Method 2: Clear App Data
**iOS Simulator:**
```bash
# Reset all simulator data
xcrun simctl erase all
```

**Android Emulator:**
1. Settings → Apps → Flit → Storage → Clear Data

**Expo Go:**
1. Long press the app in Expo Go
2. Select "Clear cache and reload"

### Method 3: Programmatic Reset
Add this code anywhere in your app:
```typescript
import { useOnboarding } from '@/hooks/use-onboarding';

const { resetOnboarding } = useOnboarding();
await resetOnboarding();
```

## File Changes

### New Files
- `hooks/use-onboarding.ts` - Onboarding state management hook

### Modified Files
- `app/_layout.tsx` - Added routing logic based on onboarding status
- `app/onboarding.tsx` - Calls `completeOnboarding()` on finish/skip
- `app/(tabs)/home.tsx` - Added debug reset button
- `package.json` - Added `@react-native-async-storage/async-storage` dependency

## Important Notes

1. **Loading State**: The root layout waits for `isLoading` to be false before making routing decisions to prevent flashing between screens

2. **Skip Behavior**: Clicking "Skip" marks onboarding as completed, meaning users won't see it again. If you want different behavior (e.g., remind them later), modify the `handleSkip` function.

3. **Production**: Remember to remove or hide the debug reset button before shipping to production:
   ```typescript
   // Option 1: Remove the debug button entirely
   // Option 2: Only show in development
   {__DEV__ && (
     <TouchableOpacity onPress={handleResetOnboarding}>
       <Text>Reset Onboarding</Text>
     </TouchableOpacity>
   )}
   ```

4. **AsyncStorage Limits**: AsyncStorage is suitable for simple key-value storage. For more complex app state, consider using:
   - Redux Persist
   - Zustand with AsyncStorage
   - MMKV (faster alternative to AsyncStorage)

## Future Enhancements

Consider implementing:
- **Multi-step onboarding tracking** - Track which specific step user is on
- **Onboarding version tracking** - Show onboarding again when updated (v1, v2, etc.)
- **Feature announcements** - Show "What's New" for returning users
- **A/B testing** - Test different onboarding flows
- **Analytics** - Track completion rates and drop-off points
