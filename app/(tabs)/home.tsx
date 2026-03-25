import { useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  Colors,
  Typography,
  Radii,
  AmbientShadow,
  Spacing,
} from "@/constants/theme";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useRouter, useFocusEffect, Redirect } from "expo-router";
import { usePortfolio } from "@/contexts/portfolio-context";
import { useAuth } from "@clerk/clerk-expo";
import { useAuthContext } from "@/contexts/auth-context";
import { useThemeMode } from "@/contexts/theme-context";
import { TopBar } from "@/components/top-bar";
import { useLessons } from "@/hooks/use-lessons";
import { lessonService } from "@/src/services/lessonService";

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, syncUser } = useAuthContext();
  const { themeMode } = useThemeMode();
  const c = themeMode === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(c);
  const { resetOnboarding } = useOnboarding();
  const router = useRouter();
  const { portfolios, refreshPortfolios } = usePortfolio();
  const { isLessonCompleted, reload, resetProgress } = useLessons(
    user?.id || null,
  );

  useFocusEffect(
    useCallback(() => {
      reload();
      refreshPortfolios();
      syncUser();
    }, [reload, refreshPortfolios, syncUser]),
  );

  if (!isLoaded) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={c.primary} />
      </ThemedView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const firstPortfolio = Object.values(portfolios)[0];
  const totalValue = firstPortfolio?.totalValue || 0;
  const liquidFunds = firstPortfolio?.liquidFunds || 0;
  const holdingsValue =
    firstPortfolio?.holdings.reduce((sum, h) => sum + h.totalValue, 0) || 0;
  const stocksPercent =
    totalValue > 0 ? Math.round((holdingsValue / totalValue) * 100) : 0;
  const savingsPercent =
    totalValue > 0 ? Math.round((liquidFunds / totalValue) * 100) : 0;

  const allLessons = lessonService.getAllLessons();
  const todaysLesson =
    allLessons.find((l) => !isLessonCompleted(l.courseId, l.id)) ??
    allLessons[0];

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    router.replace("/onboarding");
  };

  const handleResetProgress = async () => {
    await resetProgress();
  };

  return (
    <ThemedView style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Financial IQ Score Card — Hero gradient */}
        <LinearGradient
          colors={[c.primary, c.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iqCard}
        >
          <ThemedText type="label-lg" style={styles.iqLabel}>
            Your Financial IQ
          </ThemedText>
          <ThemedText style={styles.iqScore}>
            {user?.financialIQScore || 500}
          </ThemedText>
          <View style={styles.iqBadge}>
            <ThemedText type="label-lg" style={styles.iqRank}>
              {(user?.financialIQScore || 500) >= 800
                ? "Advanced Investor"
                : (user?.financialIQScore || 500) >= 600
                  ? "Intermediate"
                  : "Beginner"}
            </ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, ((user?.financialIQScore || 500) / 1500) * 100)}%`,
                },
              ]}
            />
          </View>
          <ThemedText type="body-md" style={styles.iqProgress}>
            {1500 - (user?.financialIQScore || 500)} points to Master
          </ThemedText>
        </LinearGradient>

        {/* Daily Streak */}
        <View
          style={[
            styles.streakCard,
            { backgroundColor: c.surfaceContainerLowest },
          ]}
        >
          <View style={styles.streakHeader}>
            <View>
              <ThemedText type="title-md" style={styles.streakTitle}>
                Daily Streak
              </ThemedText>
              <ThemedText type="body-md" style={styles.streakSubtitle}>
                Keep it going!
              </ThemedText>
            </View>
            <View style={styles.streakBadge}>
              <ThemedText style={[styles.streakNumber, { color: c.warning }]}>
                {user?.learningStreak || 0}
              </ThemedText>
              <ThemedText type="label-md" style={styles.streakDays}>
                days
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Portfolio Overview */}
        <View
          style={[styles.card, { backgroundColor: c.surfaceContainerLowest }]}
        >
          <View style={styles.cardHeader}>
            <ThemedText type="title-md" style={styles.cardTitle}>
              Portfolio Balance
            </ThemedText>
            <TouchableOpacity onPress={() => router.push("/(tabs)/portfolio")}>
              <ThemedText
                type="label-lg"
                style={[styles.viewAll, { color: c.primary }]}
              >
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.portfolioBalance}>
            $
            {totalValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </ThemedText>
          <View style={styles.portfolioChange}>
            <ThemedText type="body-md" style={styles.changeLabel}>
              {firstPortfolio
                ? `${firstPortfolio.holdings.length} holdings`
                : "No portfolios yet"}
            </ThemedText>
          </View>

          <View style={styles.portfolioBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: c.primary }]} />
              <ThemedText type="body-md" style={styles.breakdownLabel}>
                Holdings
              </ThemedText>
              <ThemedText type="label-lg" style={styles.breakdownValue}>
                {stocksPercent}%
              </ThemedText>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: c.success }]} />
              <ThemedText type="body-md" style={styles.breakdownLabel}>
                Liquid Funds
              </ThemedText>
              <ThemedText type="label-lg" style={styles.breakdownValue}>
                {savingsPercent}%
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Today's Lesson */}
        {todaysLesson && (
          <TouchableOpacity
            style={[
              styles.lessonCard,
              { backgroundColor: c.surfaceContainerLowest },
            ]}
            onPress={() =>
              router.push({
                pathname: "/lesson/[id]",
                params: { id: todaysLesson.id },
              })
            }
          >
            <View style={styles.lessonAccent} />
            <View style={styles.lessonContent}>
              <View style={styles.lessonHeader}>
                <ThemedText type="label-lg" style={styles.lessonTitle}>
                  Today&apos;s Lesson
                </ThemedText>
                <View style={styles.lessonBadge}>
                  <ThemedText
                    type="label-md"
                    style={[styles.lessonBadgeText, { color: c.primary }]}
                  >
                    +${todaysLesson.reward}
                  </ThemedText>
                </View>
              </View>

              <ThemedText type="title-lg" style={styles.lessonName}>
                {todaysLesson.title}
              </ThemedText>
              <ThemedText type="body-md" style={styles.lessonDescription}>
                {todaysLesson.description}
              </ThemedText>

              <View style={styles.lessonMeta}>
                <ThemedText type="label-md" style={styles.lessonDuration}>
                  {todaysLesson.estimatedMinutes} min
                </ThemedText>
                <ThemedText type="label-md" style={styles.lessonSeparator}>
                  -
                </ThemedText>
                <ThemedText type="label-md" style={styles.lessonLevel}>
                  {todaysLesson.difficulty}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: c.surfaceContainerLowest },
            ]}
            onPress={() => router.push("/(tabs)/lesson")}
          >
            <ThemedText style={styles.actionIcon}>📚</ThemedText>
            <ThemedText type="label-lg" style={styles.actionLabel}>
              Browse Lessons
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: c.surfaceContainerLowest },
            ]}
            onPress={() => router.push("/(tabs)/group")}
          >
            <ThemedText style={styles.actionIcon}>🏆</ThemedText>
            <ThemedText type="label-lg" style={styles.actionLabel}>
              View Groups
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Debug buttons */}
        <TouchableOpacity
          style={[
            styles.debugButton,
            { backgroundColor: c.surfaceContainerLow },
          ]}
          onPress={handleResetOnboarding}
        >
          <ThemedText type="label-md" style={styles.debugButtonText}>
            Reset Onboarding (Debug)
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.debugButton,
            { backgroundColor: c.surfaceContainerLow },
          ]}
          onPress={handleResetProgress}
        >
          <ThemedText type="label-md" style={styles.debugButtonText}>
            Reset Lesson Progress (Debug)
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (c: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16 },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    // Hero IQ card with gradient
    iqCard: {
      borderRadius: Radii.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      alignItems: "center",
    },
    iqLabel: { color: "rgba(255,255,255,0.85)", marginBottom: Spacing.sm },
    iqScore: {
      color: "#FFFFFF",
      fontSize: 64,
      fontFamily: Typography["display-lg"].fontFamily,
      lineHeight: 76,
      paddingTop: Platform.OS !== "web" ? 4 : 0,
      marginBottom: 12,
    },
    iqBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radii.full,
      marginBottom: Spacing.md,
    },
    iqRank: { color: "#FFFFFF" },
    progressBarContainer: {
      width: "100%",
      height: 6,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: Radii.full,
      marginBottom: Spacing.sm,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: Radii.full,
    },
    iqProgress: { color: "rgba(255,255,255,0.85)" },

    // Streak card — no border, tonal bg
    streakCard: {
      borderRadius: Radii.md,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      ...AmbientShadow,
    },
    streakHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    streakTitle: { marginBottom: 4 },
    streakSubtitle: { color: c.onSurfaceVariant },
    streakBadge: { alignItems: "center" },
    streakNumber: {
      fontSize: 32,
      fontFamily: Typography["headline-lg"].fontFamily,
    },
    streakDays: { color: c.onSurfaceVariant },

    // Portfolio card — no border
    card: {
      borderRadius: Radii.md,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      ...AmbientShadow,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    cardTitle: {},
    viewAll: {},
    portfolioBalance: {
      fontSize: 36,
      fontFamily: Typography["display-md"].fontFamily,
      lineHeight: 44,
      paddingTop: Platform.OS !== "web" ? 4 : 0,
      color: c.onSurface,
      marginBottom: Spacing.sm,
    },
    portfolioChange: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    changeLabel: { color: c.onSurfaceVariant },
    portfolioBreakdown: { gap: 12 },
    breakdownItem: { flexDirection: "row", alignItems: "center", gap: 12 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    breakdownLabel: { flex: 1, color: c.onSurfaceVariant },
    breakdownValue: {},

    // Lesson card — no border, accent strip instead of borderLeft
    lessonCard: {
      borderRadius: Radii.md,
      marginBottom: Spacing.md,
      flexDirection: "row",
      overflow: "hidden",
      ...AmbientShadow,
    },
    lessonAccent: {
      width: 4,
      backgroundColor: c.primary,
    },
    lessonContent: {
      flex: 1,
      padding: Spacing.lg,
    },
    lessonHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    lessonTitle: { color: c.onSurfaceVariant },
    lessonBadge: {
      backgroundColor: "rgba(0, 75, 228, 0.08)",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: Radii.full,
    },
    lessonBadgeText: {},
    lessonName: { marginBottom: 6 },
    lessonDescription: { color: c.onSurfaceVariant, marginBottom: 12 },
    lessonMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
    lessonDuration: { color: c.onSurfaceVariant },
    lessonSeparator: { color: c.onSurfaceVariant },
    lessonLevel: { color: c.onSurfaceVariant },

    // Quick actions — no border
    quickActions: { flexDirection: "row", gap: 12, marginBottom: Spacing.md },
    actionButton: {
      flex: 1,
      borderRadius: Radii.md,
      padding: Spacing.lg,
      alignItems: "center",
      ...AmbientShadow,
    },
    actionIcon: { fontSize: 32, marginBottom: Spacing.sm },
    actionLabel: {},

    // Debug
    debugButton: {
      marginTop: Spacing.md,
      borderRadius: Radii.md,
      paddingVertical: 12,
      alignItems: "center",
      opacity: 0.5,
    },
    debugButtonText: { color: c.onSurfaceVariant },

    bottomPadding: { height: 20 },
  });
