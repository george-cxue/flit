import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeagueService } from '@/src/services/fantasy/leagueService';
import { League } from '@/src/types/fantasy';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePortfolio } from '@/contexts/portfolio-context';

export default function FantasyHubScreen() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const primaryColor = useThemeColor({}, 'primary' as any);
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const { getPortfolioByLeague, setSelectedLeagueId, ensurePortfolioExists } = usePortfolio();

  const fetchLeagues = async () => {
    try {
      const data = await LeagueService.getLeagues();
      setLeagues(data);

      // Ensure each league has an associated portfolio
      data.forEach((league) => {
        ensurePortfolioExists(league.id, league.name);
      });
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refetch leagues every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLeagues();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeagues();
  };

  const handleCreateLeague = () => {
    router.push('/fantasy/create-league');
  };

  const handleLeaguePress = (leagueId: string) => {
    router.push(`/fantasy/league/${leagueId}`);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Fantasy Finance</ThemedText>
          <ThemedText style={styles.subtitle}>Compete with friends, risk-free.</ThemedText>
        </View>

        {/* Active Leagues */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Your Leagues</ThemedText>
            <TouchableOpacity onPress={handleCreateLeague}>
              <ThemedText style={[styles.createLink, { color: primaryColor }]}>+ Create New</ThemedText>
            </TouchableOpacity>
          </View>

          {leagues.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.emptyStateText}>You haven't joined any leagues yet.</ThemedText>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                onPress={handleCreateLeague}
              >
                <ThemedText style={styles.primaryButtonText}>Create a League</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            leagues.map((league) => (
              <TouchableOpacity
                key={league.id}
                style={[styles.leagueCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => handleLeaguePress(league.id)}
              >
                <View style={styles.leagueCardHeader}>
                  <ThemedText style={styles.leagueName}>{league.name}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: league.status === 'active' ? '#4CAF50' : '#FFC107' }]}>
                    <ThemedText style={styles.statusText}>{league.status?.toUpperCase() || 'PRE-DRAFT'}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.leagueDetails}>
                  {league.members?.length || 0} Members • Week {league.currentWeek || 0}
                </ThemedText>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* League Portfolios - Each league has an associated portfolio */}
        {leagues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">League Portfolios</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/portfolio')}>
                <ThemedText style={[styles.createLink, { color: primaryColor }]}>View All</ThemedText>
              </TouchableOpacity>
            </View>

            {leagues.map((league) => {
              const portfolio = getPortfolioByLeague(league.id);
              if (!portfolio) return null;

              return (
                <TouchableOpacity
                  key={league.id}
                  style={[styles.portfolioCard, { backgroundColor: cardBg, borderColor }]}
                  onPress={() => {
                    setSelectedLeagueId(league.id);
                    router.push('/(tabs)/portfolio');
                  }}
                >
                  <View style={styles.portfolioHeader}>
                    <View>
                      <ThemedText style={styles.portfolioLeagueName}>{league.name}</ThemedText>
                      <ThemedText style={styles.portfolioMemberCount}>
                        {league.members?.length || 0} members • Week {league.currentWeek || 0}
                      </ThemedText>
                    </View>
                    <View style={styles.portfolioValueContainer}>
                      <ThemedText style={styles.portfolioValueLabel}>Portfolio Value</ThemedText>
                      <ThemedText style={styles.portfolioValue}>
                        ${portfolio.totalValue.toFixed(2)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.portfolioStats}>
                    <View style={styles.portfolioStat}>
                      <ThemedText style={styles.statLabel}>Holdings</ThemedText>
                      <ThemedText style={styles.statValue}>{portfolio.holdings.length}</ThemedText>
                    </View>
                    <View style={styles.portfolioStat}>
                      <ThemedText style={styles.statLabel}>Liquid Funds</ThemedText>
                      <ThemedText style={[styles.statValue, { color: primaryColor }]}>
                        ${portfolio.liquidFunds.toFixed(0)}
                      </ThemedText>
                    </View>
                    <View style={styles.portfolioStat}>
                      <ThemedText style={styles.statLabel}>Rewards</ThemedText>
                      <ThemedText style={[styles.statValue, { color: '#10B981' }]}>
                        ${portfolio.lessonRewards.toFixed(0)}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  createLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leagueCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  leagueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  leagueDetails: {
    fontSize: 14,
    opacity: 0.6,
  },
  marketCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  portfolioLeagueName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  portfolioMemberCount: {
    fontSize: 13,
    opacity: 0.6,
  },
  portfolioValueContainer: {
    alignItems: 'flex-end',
  },
  portfolioValueLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  portfolioStat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
