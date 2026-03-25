import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Typography, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ProfileButton } from "@/components/profile-button";
import { useAuthContext } from "@/contexts/auth-context";
import { useLessons } from "@/hooks/use-lessons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const c = Colors.light;

export function TopBar() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { portfolioBalance } = useLessons(user?.id || null);

  const iqScore = user?.financialIQScore || 500;
  const streak = user?.learningStreak || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
      <View style={styles.row}>
        {/* Financial IQ */}
        <View style={styles.stat}>
          <MaterialIcons name="trending-up" size={22} color={c.primary} />
          <ThemedText style={styles.statValue}>{iqScore}</ThemedText>
        </View>

        {/* Daily Streak */}
        <View style={styles.stat}>
          <MaterialIcons
            name="local-fire-department"
            size={22}
            color={c.warning}
          />
          <ThemedText style={styles.statValue}>{streak}</ThemedText>
        </View>

        {/* Learning Dollars */}
        <View style={styles.stat}>
          <MaterialIcons
            name="account-balance-wallet"
            size={22}
            color={c.success}
          />
          <ThemedText style={styles.statValue}>
            {portfolioBalance.toLocaleString()}
          </ThemedText>
        </View>

        {/* Profile */}
        <ProfileButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 32,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontFamily: Typography["label-lg"].fontFamily,
    fontSize: 16,
    color: Colors.light.onSurface,
  },
});
