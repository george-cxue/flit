import { useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useRouter, useFocusEffect } from 'expo-router';
import { useLessons, PORTFOLIO_BASE } from '@/hooks/use-lessons';
import { lessonService } from '@/src/services/lessonService';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { resetOnboarding } = useOnboarding();
  const router = useRouter();
  const { isLessonCompleted, portfolioBalance, reload, resetProgress } = useLessons();
  const portfolioEarned = portfolioBalance - PORTFOLIO_BASE;

  // Re-read AsyncStorage on focus so learning dollars update after lesson completion.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Find the first incomplete lesson across all courses to feature as "Today's Lesson"
  const allLessons = lessonService.getAllLessons();
  const todaysLesson = allLessons.find(
    (l) => !isLessonCompleted(l.courseId, l.id)
  ) ?? allLessons[0];

  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const borderColor = useThemeColor({}, 'border' as any);

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
          <ThemedText type="title" style={styles.greeting}>
            Welcome back!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Ready to level up your financial skills?
          </ThemedText>
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
              <ThemedText style={styles.streakSubtitle}>
                Keep it going! 🔥
              </ThemedText>
            </View>
            <View style={styles.streakBadge}>
              <ThemedText style={[styles.streakNumber, { color: colors.warning }]}>
                12
              </ThemedText>
              <ThemedText style={styles.streakDays}>days</ThemedText>
            </View>
          </View>
        </View>

        {/* Portfolio Balance */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Portfolio Balance
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/lesson')}>
              <ThemedText style={[styles.viewAll, { color: primaryColor }]}>
                Browse Lessons →
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.portfolioBalance}>
            ${portfolioBalance.toLocaleString()}
          </ThemedText>
          {portfolioEarned > 0 ? (
            <View style={styles.portfolioChange}>
              <ThemedText style={[styles.changeText, { color: successColor }]}>
                +${portfolioEarned.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.changeLabel}>earned from lessons</ThemedText>
            </View>
          ) : (
            <ThemedText style={[styles.changeLabel, { marginTop: 2 }]}>
              Starting balance · complete lessons to grow it
            </ThemedText>
          )}
        </View>

        {/* Today's Lesson */}
        {todaysLesson && (
          <TouchableOpacity
            style={[styles.lessonCard, { backgroundColor: cardBg, borderColor, borderLeftColor: primaryColor }]}
            onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: todaysLesson.id } })}
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

            <ThemedText style={styles.lessonName}>
              {todaysLesson.title}
            </ThemedText>
            <ThemedText style={styles.lessonDescription}>
              {todaysLesson.description}
            </ThemedText>

            <View style={styles.lessonMeta}>
              <ThemedText style={styles.lessonDuration}>{todaysLesson.estimatedMinutes} min</ThemedText>
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
            <ThemedText style={styles.actionLabel}>Lessons</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={styles.actionIcon}>🏆</ThemedText>
            <ThemedText style={styles.actionLabel}>View Leagues</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Next Time Tick */}
        <View style={[styles.timeTickCard, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.timeTickLabel}>Next Quarter Simulation</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.timeTickValue}>
            2 days, 14 hours
          </ThemedText>
          <ThemedText style={styles.timeTickDescription}>
            Your portfolio will update based on market performance
          </ThemedText>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 16,
  },
  iqCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  iqLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
    marginBottom: 8,
  },
  iqScore: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  iqBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  iqRank: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  iqProgress: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 13,
  },
  streakCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  streakSubtitle: {
    opacity: 0.6,
    fontSize: 14,
  },
  streakBadge: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakDays: {
    opacity: 0.6,
    fontSize: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeLabel: {
    opacity: 0.6,
    fontSize: 14,
  },
  portfolioBreakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
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
  lessonTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  lessonBadge: {
    backgroundColor: 'rgba(65, 105, 225, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lessonBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  lessonName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  lessonDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonDuration: {
    fontSize: 13,
    opacity: 0.6,
  },
  lessonSeparator: {
    opacity: 0.4,
  },
  lessonLevel: {
    fontSize: 13,
    opacity: 0.6,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeTickCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeTickLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },
  timeTickValue: {
    fontSize: 20,
    marginBottom: 8,
  },
  timeTickDescription: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
  debugButton: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    opacity: 0.5,
  },
  debugButtonText: {
    fontSize: 13,
    opacity: 0.7,
  },
  bottomPadding: {
    height: 20,
  },
});
