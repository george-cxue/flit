# Flit App Mockups

This document describes the initial frontend mockups created for the Flit financial literacy app.

## Overview

Flit is a gamified financial literacy app that combines Duolingo-style learning with fantasy sports mechanics. Users complete lessons to earn virtual dollars, build simulated investment portfolios, and compete with friends.

## Screens Created

### 1. Home/Dashboard Screen
**Location:** `app/(tabs)/home.tsx`

**Features:**
- **Financial IQ Score card** - Large, prominent display with progress bar
- **Daily streak tracker** - Shows consecutive days of lesson completion
- **Portfolio overview** - Quick balance view with asset allocation breakdown
- **Today's lesson card** - Highlights the current lesson with earning potential
- **Quick action buttons** - Fast access to lessons and leagues
- **Time tick countdown** - Shows when next quarterly simulation occurs

**Design Notes:**
- Royal blue primary card for Financial IQ (hero element)
- Clean card-based layout with proper spacing
- Success indicators (green) for positive portfolio changes
- Earnings displayed prominently (+$500 badges)

### 2. Lesson Screen
**Location:** `app/(tabs)/lesson.tsx`

**Features:**
- **Progress bar** - Shows completion within the lesson (4/8 questions)
- **Educational content** - Mix of text, examples, and key points
- **Interactive quiz** - Multiple choice with immediate feedback
- **Visual examples** - Compound interest calculation breakdown
- **Earnings tracker** - Shows total earned in current lesson
- **Continue button** - Only enabled after correct answer (Duolingo-style)

**Design Notes:**
- Duolingo-inspired UX (progress bar, answer selection, feedback)
- Green/red color coding for correct/incorrect answers
- Key point callouts with icons
- Clean typography for readability
- Disabled state for continue button until answer selected

### 3. Portfolio Screen
**Location:** `app/(tabs)/portfolio.tsx`

**Features:**
- **Total portfolio value card** - Large blue card showing balance
- **Performance metrics** - Total invested vs. lifetime earnings
- **Asset allocation visualization** - Horizontal bar chart representation
- **Holdings list** - Detailed view of each investment with:
  - Asset name and ticker
  - Current value
  - Percentage change
  - Asset type
- **Action buttons** - Allocate funds & rebalance portfolio
- **Time tick reminder** - Countdown to next quarterly update

**Design Notes:**
- Royal blue hero card for total balance
- Color-coded assets (different colors for stocks, bonds, index funds)
- Percentage changes shown with green (positive) / red (negative)
- Clean, scannable list design with icons

### 4. League/Social Screen
**Location:** `app/(tabs)/league.tsx`

**Features:**
- **League info card** - Shows current league (Diamond League)
- **Your stats** - Rank, IQ score, time remaining
- **Promotion/relegation info** - Clear indicators for top 3 / bottom 3
- **Leaderboard** - Ranked list of players with:
  - Medal icons for top 3 (🥇🥈🥉)
  - Avatar emojis
  - Financial IQ scores
  - Score changes (+/-)
  - General investment strategies
- **Current user highlighting** - Special styling for user's position
- **Social actions** - Invite friends button

**Design Notes:**
- Medal/trophy aesthetics for gamification
- Current user highlighted with blue border and background
- Strategy visibility (percentages only, not exact holdings)
- Friendly competition without intimidation

### 5. Onboarding Screen
**Location:** `app/onboarding.tsx`

**Features:**
- **Multi-step walkthrough** - 3 screens explaining core features
- **Step 1: Learn** - Explains lessons and earning system
- **Step 2: Invest** - Shows how learning dollars work
- **Step 3: Compete** - Previews league system
- **Progress dots** - Shows which step user is on
- **Skip option** - Can bypass onboarding
- **Flit branding** - Logo and brand colors

**Design Notes:**
- Large, friendly icons for each step
- Preview cards showing actual UI elements
- Clean, minimal layout focused on one concept per screen
- Clear call-to-action ("Let's Start!")

## Design System

### Colors
Defined in `constants/theme.ts`:

**Brand Colors:**
- Royal Blue: `#4169E1` (primary)
- Light Blue: `#6B9BFF` (primary light)
- Sky Blue: `#E6F0FF` (primary pale)
- Navy Blue: `#2C4B9C` (primary dark)

**Semantic Colors:**
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)

**Neutrals:**
- Card Background: `#F8FAFC` (light) / `#1E293B` (dark)
- Border: `#E2E8F0` (light) / `#334155` (dark)

### Typography
- Title: 32px, bold
- Section Headers: 18-20px, semibold
- Body: 14-16px, regular
- Captions: 12-13px, regular

### Component Patterns
- **Cards:** 16-20px border radius, subtle borders, generous padding
- **Buttons:** 12px border radius, 16-18px vertical padding
- **Icons:** Material Icons (Android/web), SF Symbols (iOS)
- **Spacing:** 20px base unit for margins/padding

## Navigation

### Tab Bar (Bottom)
1. **Home** - Dashboard overview
2. **Lessons** - Learning content
3. **Portfolio** - Investment tracking
4. **League** - Social competition

### Screens
- `/onboarding` - First-time user experience
- `/(tabs)/home` - Main dashboard
- `/(tabs)/lesson` - Lesson viewer
- `/(tabs)/portfolio` - Portfolio manager
- `/(tabs)/league` - Leaderboard/social

## Running the App

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code for physical device

**First Launch:** You'll be directed to the onboarding screen. Complete it or skip to access the app.

**Subsequent Launches:** You'll go directly to the home screen.

**Testing Onboarding Again:** Scroll to the bottom of the home screen and tap "🔄 Reset Onboarding (Debug)"

See [ONBOARDING_FLOW.md](ONBOARDING_FLOW.md) for detailed information about the onboarding system.

## Next Steps

**Recommended implementations:**
1. Add state management (Context API or Zustand)
2. Create lesson browsing/selection screen
3. Build portfolio allocation modal
4. Implement actual quiz logic and progression
5. Add animations (react-native-reanimated)
6. Connect to backend API
7. Add user authentication
8. Implement real league mechanics

**Design iterations:**
1. High-fidelity mockups with real icons
2. Micro-interactions and animations
3. Loading states and error handling
4. Empty states (no lessons, no friends, etc.)
5. Accessibility improvements (screen readers, contrast)

## Notes

- All screens use the existing `ThemedText` and `ThemedView` components
- Full light/dark mode support
- Responsive to different screen sizes
- Platform-specific icons (SF Symbols on iOS, Material Icons elsewhere)
- No external UI libraries required (built with React Native primitives)
