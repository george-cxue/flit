import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Typography, Radii, AmbientShadow, Spacing, SubtleShadow } from '@/constants/theme';
import { useRouter, useFocusEffect, Redirect } from 'expo-router';
import { usePortfolio } from '@/contexts/portfolio-context';
import { useAuth } from '@clerk/clerk-expo';
import { useAuthContext } from '@/contexts/auth-context';
import { useThemeMode } from '@/contexts/theme-context';
import { TopBar } from '@/components/top-bar';
import { useLessons } from '@/hooks/use-lessons';
import { lessonService } from '@/src/services/lessonService';
import { GroupService } from '@/src/services/fantasy/groupService';
import { Group } from '@/src/types/fantasy';

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, syncUser, userId } = useAuthContext();
  const { themeMode } = useThemeMode();
  const c = themeMode === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(c);
  const router = useRouter();
  const {
    portfolios,
    refreshPortfolios,
    selectedLeagueId,
    setSelectedLeagueId,
  } = usePortfolio();
  const { isLessonCompleted, reload } = useLessons(user?.id || null);
  const [groups, setGroups] = useState<Group[]>([]);

  useFocusEffect(
    useCallback(() => {
      reload();
      refreshPortfolios();
      syncUser();
    }, [reload, refreshPortfolios, syncUser])
  );

  useEffect(() => {
    const fetchGroups = async () => {
      if (!isLoaded || !isSignedIn || !userId) {
        setGroups([]);
        return;
      }
      try {
        const data = await GroupService.getGroups();
        setGroups(data);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      }
    };
    fetchGroups();
  }, [isLoaded, isSignedIn, userId]);

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

  // Portfolio data for selected group
  const portfolio = portfolios[selectedLeagueId] || Object.values(portfolios)[0];
  const totalValue = portfolio?.totalValue || 0;
  const liquidFunds = portfolio?.liquidFunds || 0;
  const holdingsValue = portfolio?.holdings.reduce((sum, h) => sum + h.totalValue, 0) || 0;
  const otherAssetsValue = portfolio
    ? portfolio.allocation.savings + portfolio.allocation.bonds + portfolio.allocation.indexFunds
    : 0;
  const holdingsPercent = totalValue > 0 ? Math.round((holdingsValue / totalValue) * 100) : 0;
  const liquidPercent = totalValue > 0 ? Math.round((liquidFunds / totalValue) * 100) : 0;

  // Find user's rank in the selected group
  const selectedGroup = groups.find((g) => g.id === (portfolio?.leagueId || selectedLeagueId));

  // Overall return calculation
  const startingBalance = selectedGroup?.settings?.startingBalance || 0;
  const totalReturn = startingBalance > 0 ? totalValue - startingBalance : 0;
  const totalReturnPct = startingBalance > 0 ? ((totalValue - startingBalance) / startingBalance) * 100 : 0;

  // Top mover (best performing holding)
  const topMover = portfolio?.holdings.length
    ? [...portfolio.holdings].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))[0]
    : null;
  const getUserRank = (group: Group) => {
    if (!group.members || !userId) return null;
    const idx = group.members.findIndex((m) => m.id === userId);
    return idx >= 0 ? idx + 1 : null;
  };

  const getRankSuffix = (rank: number) => {
    if (rank % 100 >= 11 && rank % 100 <= 13) return 'th';
    switch (rank % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const allLessons = lessonService.getAllLessons();
  const todaysLesson =
    allLessons.find((l) => !isLessonCompleted(l.courseId, l.id)) ?? allLessons[0];

  return (
    <ThemedView style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Group Selector */}
        {groups.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupRow}
            style={styles.groupScroll}
          >
            {groups.map((group) => {
              const isSelected = (portfolio?.leagueId || selectedLeagueId) === group.id;
              const rank = getUserRank(group);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupTab,
                    {
                      backgroundColor: isSelected ? c.primary : c.surfaceContainerLowest,
                    },
                    !isSelected && SubtleShadow,
                  ]}
                  onPress={() => setSelectedLeagueId(group.id)}
                  activeOpacity={0.75}
                >
                  <ThemedText
                    type="label-lg"
                    style={[
                      styles.groupTabName,
                      { color: isSelected ? '#FFFFFF' : c.onSurface },
                    ]}
                    numberOfLines={1}
                  >
                    {group.name}
                  </ThemedText>
                  <ThemedText
                    type="label-md"
                    style={[
                      styles.groupTabMeta,
                      { color: isSelected ? 'rgba(255,255,255,0.7)' : c.onSurfaceVariant },
                    ]}
                  >
                    {rank ? `${rank}${getRankSuffix(rank)} Place` : `${group.members?.length || 0} members`}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Portfolio Balance */}
        <View style={[styles.card, { backgroundColor: c.surfaceContainerLowest }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="title-md" style={styles.cardTitle}>
              Portfolio Balance
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/portfolio')}>
              <ThemedText type="label-lg" style={[styles.viewAll, { color: c.primary }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.portfolioBalance}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </ThemedText>

          {/* Return % and P&L */}
          {startingBalance > 0 && (
            <View style={styles.returnRow}>
              <ThemedText
                type="label-lg"
                style={{ color: totalReturn >= 0 ? c.success : c.danger }}
              >
                {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemedText>
              <View style={[styles.returnBadge, { backgroundColor: totalReturnPct >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                <ThemedText type="label-md" style={{ color: totalReturnPct >= 0 ? c.success : c.danger }}>
                  {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%
                </ThemedText>
              </View>
            </View>
          )}

          <View style={styles.portfolioChange}>
            <ThemedText type="body-md" style={styles.changeLabel}>
              {portfolio ? `${portfolio.holdings.length} holding${portfolio.holdings.length !== 1 ? 's' : ''}` : 'No portfolios yet'}
            </ThemedText>
          </View>

          <View style={styles.portfolioBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: c.primary }]} />
              <ThemedText type="body-md" style={styles.breakdownLabel}>Holdings</ThemedText>
              <ThemedText type="label-lg" style={styles.breakdownValue}>{holdingsPercent}%</ThemedText>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: c.success }]} />
              <ThemedText type="body-md" style={styles.breakdownLabel}>Liquid Funds</ThemedText>
              <ThemedText type="label-lg" style={styles.breakdownValue}>{liquidPercent}%</ThemedText>
            </View>
          </View>

          {/* Portfolio details */}
          <View style={styles.portfolioDetails}>
            <View style={styles.detailRow}>
              <ThemedText type="body-md" style={styles.detailLabel}>Cash Available</ThemedText>
              <ThemedText type="label-lg" style={styles.detailValue}>
                ${liquidFunds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText type="body-md" style={styles.detailLabel}>Holdings Value</ThemedText>
              <ThemedText type="label-lg" style={styles.detailValue}>
                ${holdingsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemedText>
            </View>
            {otherAssetsValue > 0 && (
              <View style={styles.detailRow}>
                <ThemedText type="body-md" style={styles.detailLabel}>Other Assets</ThemedText>
                <ThemedText type="label-lg" style={styles.detailValue}>
                  ${otherAssetsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </ThemedText>
              </View>
            )}
            {startingBalance > 0 && (
              <View style={styles.detailRow}>
                <ThemedText type="body-md" style={styles.detailLabel}>Starting Balance</ThemedText>
                <ThemedText type="label-lg" style={styles.detailValue}>
                  ${startingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Top Mover */}
          {topMover && (
            <View style={styles.topMover}>
              <ThemedText type="label-md" style={styles.topMoverLabel}>Top Mover Today</ThemedText>
              <View style={styles.topMoverRow}>
                <ThemedText type="label-lg" style={styles.topMoverSymbol}>{topMover.symbol}</ThemedText>
                <ThemedText type="body-md" style={styles.topMoverName} numberOfLines={1}>{topMover.name}</ThemedText>
                <ThemedText
                  type="label-lg"
                  style={{ color: topMover.changePercent >= 0 ? c.success : c.danger }}
                >
                  {topMover.changePercent >= 0 ? '+' : ''}{topMover.changePercent.toFixed(2)}%
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Today's Lesson */}
        {todaysLesson && (
          <TouchableOpacity
            style={[styles.lessonCard, { backgroundColor: c.surfaceContainerLowest }]}
            onPress={() =>
              router.push({ pathname: '/lesson/[id]', params: { id: todaysLesson.id } })
            }
          >
            <View style={styles.lessonAccent} />
            <View style={styles.lessonContent}>
              <View style={styles.lessonHeader}>
                <ThemedText type="label-lg" style={styles.lessonTitle}>
                  Today&apos;s Lesson
                </ThemedText>
                <View style={styles.lessonBadge}>
                  <ThemedText type="label-md" style={[styles.lessonBadgeText, { color: c.primary }]}>
                    +${todaysLesson.reward}
                  </ThemedText>
                </View>
              </View>

              <ThemedText type="title-lg" style={styles.lessonName}>{todaysLesson.title}</ThemedText>
              <ThemedText type="body-md" style={styles.lessonDescription}>{todaysLesson.description}</ThemedText>

              <View style={styles.lessonMeta}>
                <ThemedText type="label-md" style={styles.lessonDuration}>
                  {todaysLesson.estimatedMinutes} min
                </ThemedText>
                <ThemedText type="label-md" style={styles.lessonSeparator}>-</ThemedText>
                <ThemedText type="label-md" style={styles.lessonLevel}>{todaysLesson.difficulty}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: c.surfaceContainerLowest }]}
            onPress={() => router.push('/(tabs)/lesson')}
          >
            <ThemedText style={styles.actionIcon}>📚</ThemedText>
            <ThemedText type="label-lg" style={styles.actionLabel}>Browse Lessons</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: c.surfaceContainerLowest }]}
            onPress={() => router.push('/(tabs)/group')}
          >
            <ThemedText style={styles.actionIcon}>🏆</ThemedText>
            <ThemedText type="label-lg" style={styles.actionLabel}>View Groups</ThemedText>
          </TouchableOpacity>
        </View>

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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Group selector
    groupScroll: { marginHorizontal: -16, marginBottom: Spacing.md },
    groupRow: { paddingHorizontal: 16, gap: 10 },
    groupTab: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: Radii.md,
      minWidth: 120,
    },
    groupTabName: { marginBottom: 2 },
    groupTabMeta: {},

    // Portfolio card
    card: {
      borderRadius: Radii.md,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      ...AmbientShadow,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    cardTitle: {},
    viewAll: {},
    portfolioBalance: {
      fontSize: 32,
      fontFamily: Typography['display-md'].fontFamily,
      lineHeight: 40,
      color: c.onSurface,
      marginBottom: 4,
    },
    portfolioChange: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    changeLabel: { color: c.onSurfaceVariant },
    portfolioBreakdown: { gap: 12, marginBottom: Spacing.md },
    breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    breakdownLabel: { flex: 1, color: c.onSurfaceVariant },
    breakdownValue: {},

    // Extra portfolio details
    portfolioDetails: {
      borderTopWidth: 1,
      borderTopColor: c.surfaceContainerHigh,
      paddingTop: Spacing.md,
      gap: 10,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: { color: c.onSurfaceVariant },
    detailValue: { color: c.onSurface },

    // Return row
    returnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    returnBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radii.full,
    },

    // Top mover
    topMover: {
      borderTopWidth: 1,
      borderTopColor: c.surfaceContainerHigh,
      paddingTop: Spacing.md,
      marginTop: Spacing.md,
    },
    topMoverLabel: { color: c.onSurfaceVariant, marginBottom: 8 },
    topMoverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    topMoverSymbol: { color: c.onSurface },
    topMoverName: { flex: 1, color: c.onSurfaceVariant },

    // Lesson card
    lessonCard: {
      borderRadius: Radii.md,
      marginBottom: Spacing.md,
      flexDirection: 'row',
      overflow: 'hidden',
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    lessonTitle: { color: c.onSurfaceVariant },
    lessonBadge: {
      backgroundColor: 'rgba(0, 75, 228, 0.08)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: Radii.full,
    },
    lessonBadgeText: {},
    lessonName: { marginBottom: 6 },
    lessonDescription: { color: c.onSurfaceVariant, marginBottom: 12 },
    lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    lessonDuration: { color: c.onSurfaceVariant },
    lessonSeparator: { color: c.onSurfaceVariant },
    lessonLevel: { color: c.onSurfaceVariant },

    // Quick actions
    quickActions: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
    actionButton: {
      flex: 1,
      borderRadius: Radii.md,
      padding: Spacing.lg,
      alignItems: 'center',
      ...AmbientShadow,
    },
    actionIcon: { fontSize: 32, marginBottom: Spacing.sm },
    actionLabel: {},

    bottomPadding: { height: 20 },
  });
