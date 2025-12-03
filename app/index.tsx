import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { useOnboarding } from "@/hooks/use-onboarding";

export default function Index() {
  const { hasCompletedOnboarding, isLoading } = useOnboarding();

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}