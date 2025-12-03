import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useRouter } from 'expo-router';
import { usePortfolio } from '@/contexts/portfolio-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { resetOnboarding, profileName } = useOnboarding();
  const router = useRouter();
  const { portfolios, loading } = usePortfolio();

  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  // Get first portfolio
  const firstPortfolio = Object.values(portfolios)[0];

  // Calculate portfolio statistics
  const totalValue = firstPortfolio?.totalValue || 0;
  const liquidFunds = firstPortfolio?.liquidFunds || 0;
  const holdingsValue = firstPortfolio?.holdings.reduce((sum, h) => sum + h.totalValue, 0) || 0;

  // Calculate percentages for breakdown
  const stocksPercent = totalValue > 0 ? Math.round((holdingsValue / totalValue) * 100) : 0;
  const savingsPercent = totalValue > 0 ? Math.round((liquidFunds / totalValue) * 100) : 0;

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    router.replace('/onboarding');
  };

  const handleBrowseLessons = () => {
    router.push('/(tabs)/lesson');
  };

  const handleTodaysLesson = () => {
    router.push('/(tabs)/lesson');
  };

  const handleViewLeagues = () => {
    router.push('/(tabs)/league');
  };

  const handleViewAllPortfolios = () => {
    router.push('/(tabs)/portfolio');
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
            {profileName?.trim() ? `Welcome back, ${profileName.trim()}!` : 'Welcome back!'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {profileName?.trim() ? "Let's keep growing your money skills." : 'Ready to level up your financial skills?'}
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

        {/* Portfolio Overview */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Portfolio Balance
            </ThemedText>
            <TouchableOpacity onPress={handleViewAllPortfolios}>
              <ThemedText style={[styles.viewAll, { color: primaryColor }]}>
                View All →
              </ThemedText>
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
        <TouchableOpacity
          style={[styles.lessonCard, { backgroundColor: cardBg, borderColor, borderLeftColor: primaryColor }]}
          onPress={handleTodaysLesson}
        >
          <View style={styles.lessonHeader}>
            <ThemedText type="defaultSemiBold" style={styles.lessonTitle}>
              Today&apos;s Lesson
            </ThemedText>
            <View style={styles.lessonBadge}>
              <ThemedText style={[styles.lessonBadgeText, { color: primaryColor }]}>
                +$500
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.lessonName}>
            Understanding Compound Interest
          </ThemedText>
          <ThemedText style={styles.lessonDescription}>
            Learn how your money can grow exponentially over time
          </ThemedText>

          <View style={styles.lessonMeta}>
            <ThemedText style={styles.lessonDuration}>5 min</ThemedText>
            <ThemedText style={styles.lessonSeparator}>•</ThemedText>
            <ThemedText style={styles.lessonLevel}>Intermediate</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg, borderColor }]}
            onPress={handleBrowseLessons}
          >
            <ThemedText style={styles.actionIcon}>📚</ThemedText>
            <ThemedText style={styles.actionLabel}>Browse Lessons</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg, borderColor }]}
            onPress={handleViewLeagues}
          >
            <ThemedText style={styles.actionIcon}>🏆</ThemedText>
            <ThemedText style={styles.actionLabel}>View Leagues</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Debug: Reset Onboarding */}
        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: cardBg, borderColor }]}
          onPress={handleResetOnboarding}
        >
          <ThemedText style={styles.debugButtonText}>🔄 Reset Onboarding (Debug)</ThemedText>
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
