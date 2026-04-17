import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { useOnboarding } from "@/hooks/use-onboarding";
import { AppLoadingScreen } from "@/components/app-loading-screen";

export default function Index() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();

  // Show loading while auth or onboarding state is being determined
  if (!authLoaded || onboardingLoading || hasCompletedOnboarding === null) {
    return <AppLoadingScreen />;
  }

  // If not signed in, redirect to sign-in page
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // If signed in but hasn't completed onboarding, redirect to onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // If signed in and completed onboarding, go to home
  return <Redirect href="/(tabs)/home" />;
}