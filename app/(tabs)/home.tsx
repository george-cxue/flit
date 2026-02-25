import { useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useRouter, useFocusEffect, Redirect } from 'expo-router';
import { usePortfolio } from '@/contexts/portfolio-context';
import { useAuth } from '@clerk/clerk-expo';
import { ProfileButton } from '@/components/profile-button';
import { useLessons } from '@/hooks/use-lessons';
import { lessonService } from '@/src/services/lessonService';

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { resetOnboarding, profileName } = useOnboarding();
  const router = useRouter();
  const { portfolios } = usePortfolio();
  const { isLessonCompleted, reload, resetProgress } = useLessons();

  // Reload lesson state whenever this tab gains focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Call ALL hooks before any conditional returns
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  // Redirect to sign-in if not authenticated
  if (!isLoaded) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Portfolio data from context
  const firstPortfolio = Object.values(portfolios)[0];
  const totalValue = firstPortfolio?.totalValue || 0;
  const liquidFunds = firstPortfolio?.liquidFunds || 0;
  const holdingsValue = firstPortfolio?.holdings.reduce((sum, h) => sum + h.totalValue, 0) || 0;
  const stocksPercent = totalValue > 0 ? Math.round((holdingsValue / totalValue) * 100) : 0;
  const savingsPercent = totalValue > 0 ? Math.round((liquidFunds / totalValue) * 100) : 0;

  // First incomplete lesson for the Today's Lesson card
  const allLessons = lessonService.getAllLessons();
  const todaysLesson = allLessons.find((l) => !isLessonCompleted(l.courseId, l.id)) ?? allLessons[0];

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    router.replace('/onboarding');
  };

  const handleResetProgress = async () => {
    await resetProgress();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <ThemedText type="title" style={styles.greeting}>
                {profileName?.trim() ? `Welcome back, ${profileName.trim()}!` : 'Welcome back!'}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {profileName?.trim()
                  ? "Let's keep growing your money skills."
                  : 'Ready to level up your financial skills?'}
              </ThemedText>
            </View>
            <ProfileButton />
          </View>
        </View>

        {/* Financial IQ Score Card */}
        <View style={[styles.iqCard, { backgroundColor: primaryColor }]}>
          <ThemedText style={styles.iqLabel}>Your Financial IQ</ThemedText>
          <ThemedText style={styles.iqScore}>847</ThemedText>
          <View style={styles.iqBadge}>
            <ThemedText style={styles.iqRank}>Advanced Investor</ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '84.7%' }]} />
          </View>
          <ThemedText style={styles.iqProgress}>153 points to Master</ThemedText>
        </View>

        {/* Daily Streak */}
        <View style={[styles.streakCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.streakHeader}>
            <View>
              <ThemedText type="defaultSemiBold" style={styles.streakTitle}>
                Daily Streak
              </ThemedText>
              <ThemedText style={styles.streakSubtitle}>Keep it going! 🔥</ThemedText>
            </View>
            <View style={styles.streakBadge}>
              <ThemedText style={[styles.streakNumber, { color: colors.warning }]}>12</ThemedText>
              <ThemedText style={styles.streakDays}>days</ThemedText>
            </View>
          </View>
        </View>

        {/* Portfolio Overview */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Portfolio Balance
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/portfolio')}>
              <ThemedText style={[styles.viewAll, { color: primaryColor }]}>View All →</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.portfolioBalance}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </ThemedText>
          <View style={styles.portfolioChange}>
            <ThemedText style={styles.changeLabel}>
              {firstPortfolio ? `${firstPortfolio.holdings.length} holdings` : 'No portfolios yet'}
            </ThemedText>
          </View>

          <View style={styles.portfolioBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <ThemedText style={styles.breakdownLabel}>Holdings</ThemedText>
              <ThemedText style={styles.breakdownValue}>{stocksPercent}%</ThemedText>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <ThemedText style={styles.breakdownLabel}>Liquid Funds</ThemedText>
              <ThemedText style={styles.breakdownValue}>{savingsPercent}%</ThemedText>
            </View>
          </View>
        </View>

        {/* Today's Lesson */}
        {todaysLesson && (
          <TouchableOpacity
            style={[
              styles.lessonCard,
              { backgroundColor: cardBg, borderColor, borderLeftColor: primaryColor },
            ]}
            onPress={() =>
              router.push({ pathname: '/lesson/[id]', params: { id: todaysLesson.id } })
            }
          >
            <View style={styles.lessonHeader}>
              <ThemedText type="defaultSemiBold" style={styles.lessonTitle}>
                Today&apos;s Lesson
              </ThemedText>
              <View style={styles.lessonBadge}>
                <ThemedText style={[styles.lessonBadgeText, { color: primaryColor }]}>
                  +${todaysLesson.reward}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.lessonName}>{todaysLesson.title}</ThemedText>
            <ThemedText style={styles.lessonDescription}>{todaysLesson.description}</ThemedText>

            <View style={styles.lessonMeta}>
              <ThemedText style={styles.lessonDuration}>
                {todaysLesson.estimatedMinutes} min
              </ThemedText>
              <ThemedText style={styles.lessonSeparator}>•</ThemedText>
              <ThemedText style={styles.lessonLevel}>{todaysLesson.difficulty}</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg, borderColor }]}
            onPress={() => router.push('/(tabs)/lesson')}
          >
            <ThemedText style={styles.actionIcon}>📚</ThemedText>
            <ThemedText style={styles.actionLabel}>Browse Lessons</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg, borderColor }]}
            onPress={() => router.push('/(tabs)/group')}
          >
            <ThemedText style={styles.actionIcon}>🏆</ThemedText>
            <ThemedText style={styles.actionLabel}>View Groups</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Debug: Reset Onboarding */}
        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: cardBg, borderColor }]}
          onPress={handleResetOnboarding}
        >
          <ThemedText style={styles.debugButtonText}>🔄 Reset Onboarding (Debug)</ThemedText>
        </TouchableOpacity>

        {/* Debug: Reset Lesson Progress */}
        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: cardBg, borderColor }]}
          onPress={handleResetProgress}
        >
          <ThemedText style={styles.debugButtonText}>🗑️ Reset Lesson Progress (Debug)</ThemedText>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 28, marginBottom: 4 },
  subtitle: { opacity: 0.7, fontSize: 16 },
  iqCard: { borderRadius: 20, padding: 24, marginBottom: 16, alignItems: 'center' },
  iqLabel: { color: '#FFFFFF', opacity: 0.9, fontSize: 14, marginBottom: 8 },
  iqScore: { color: '#FFFFFF', fontSize: 64, fontWeight: 'bold', marginBottom: 12 },
  iqBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  iqRank: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  iqProgress: { color: '#FFFFFF', opacity: 0.9, fontSize: 13 },
  streakCard: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1 },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakTitle: { fontSize: 16, marginBottom: 4 },
  streakSubtitle: { opacity: 0.6, fontSize: 14 },
  streakBadge: { alignItems: 'center' },
  streakNumber: { fontSize: 32, fontWeight: 'bold' },
  streakDays: { opacity: 0.6, fontSize: 12 },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16 },
  viewAll: { fontSize: 14, fontWeight: '600' },
  portfolioBalance: { fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  portfolioChange: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  changeText: { fontSize: 16, fontWeight: '600' },
  changeLabel: { opacity: 0.6, fontSize: 14 },
  portfolioBreakdown: { gap: 12 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  breakdownLabel: { flex: 1, fontSize: 14 },
  breakdownValue: { fontSize: 14, fontWeight: '600' },
  lessonCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonTitle: { fontSize: 14, opacity: 0.7 },
  lessonBadge: {
    backgroundColor: 'rgba(65, 105, 225, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lessonBadgeText: { fontSize: 13, fontWeight: '700' },
  lessonName: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  lessonDescription: { fontSize: 14, opacity: 0.7, marginBottom: 12 },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lessonDuration: { fontSize: 13, opacity: 0.6 },
  lessonSeparator: { opacity: 0.4 },
  lessonLevel: { fontSize: 13, opacity: 0.6 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: { flex: 1, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1 },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '600' },
  debugButton: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    opacity: 0.5,
  },
  debugButtonText: { fontSize: 13, opacity: 0.7 },
  bottomPadding: { height: 20 },
});