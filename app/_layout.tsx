import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { PortfolioProvider } from "@/contexts/portfolio-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if segments is populated (navigation is ready)
    // and we're not on index route
    if (segments.length === 0) return;

    const inTabs = segments[0] === "(tabs)";
    const inFantasy = segments[0] === "fantasy";
    const isIndex = segments[0] === "index";

    // Redirect to home if not in tabs, fantasy, or valid routes
    // Skip redirect if on index (it has its own redirect)
    if (!inTabs && !inFantasy && !isIndex && segments[0] !== "modal" && segments[0] !== "onboarding") {
      router.replace("/(tabs)/home");
    }
  }, [segments, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <PortfolioProvider>
        <Stack>
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="fantasy" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </PortfolioProvider>
    </ThemeProvider>
  );
}
