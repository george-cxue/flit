import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { PortfolioProvider } from "@/contexts/portfolio-context";
import { AuthProvider } from "@/contexts/auth-context";
import { apiClient } from "@/src/services/api";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  // Update stock prices on app load
  useEffect(() => {
    const updateStockPrices = async () => {
      try {
        console.log('📊 Triggering stock price update...');
        const response = await apiClient.post('/assets/update-prices');
        if (response.data.updated) {
          console.log('✅ Stock prices updated:', response.data.message);
        } else {
          console.log('⏭️  Stock prices skipped:', response.data.message);
        }
      } catch (error) {
        console.error('Failed to update stock prices:', error);
        // Don't block app loading if price update fails
      }
    };

    updateStockPrices();
  }, []); // Run once on mount

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
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <PortfolioProvider>
              <Stack>
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="fantasy" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </PortfolioProvider>
          </AuthProvider>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
