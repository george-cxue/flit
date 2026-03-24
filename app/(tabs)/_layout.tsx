import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';
import { useAuthContext } from '@/contexts/auth-context';
import { ProfileButton } from '@/components/profile-button';
import { useThemeMode } from '@/contexts/theme-context';

export default function TabLayout() {
  const { isLoaded, isSignedIn, user, syncError } = useAuthContext();
  const { themeMode } = useThemeMode();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (syncError && !user) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorTitle, { color: colors.onSurface }]}>Account Setup Failed</Text>
        <Text style={[styles.errorMessage, { color: colors.onSurfaceVariant }]}>{syncError}</Text>
        <Text style={[styles.errorHint, { color: colors.onSurfaceVariant }]}>
          Sign out and try again with a different username.
        </Text>
        <ProfileButton />
      </View>
    );
  }

  if (user && !user.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: Typography['label-md'].fontFamily,
          fontSize: Typography['label-md'].fontSize,
        },
      })}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lesson"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.pie.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontFamily: Typography['title-lg'].fontFamily,
    fontSize: Typography['title-lg'].fontSize,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontFamily: Typography['body-md'].fontFamily,
    fontSize: Typography['body-md'].fontSize,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
});
