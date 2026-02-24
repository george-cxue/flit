import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GroupService } from '@/src/services/fantasy/groupService';
import { Group } from '@/src/types/fantasy';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePortfolio } from '@/contexts/portfolio-context';

export default function FantasyHubScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const primaryColor = useThemeColor({}, 'primary' as any);
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const { getPortfolioByLeague, setSelectedLeagueId, refreshPortfolios } = usePortfolio();

  const fetchGroups = async () => {
    try {
      const data = await GroupService.getGroups();
      setGroups(data);

      // Refresh portfolios from backend
      await refreshPortfolios();
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refetch groups every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const handleCreateGroup = () => {
    router.push('/fantasy/create-group');
  };

  const handleJoinGroup = () => {
    router.push('/fantasy/join-group');
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/fantasy/group/${groupId}`);
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
          <ThemedText type="title" style={styles.title}>Social</ThemedText>
          <ThemedText style={styles.subtitle}>Compete with friends, risk-free.</ThemedText>
        </View>

        {/* Active Groups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Your Groups</ThemedText>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleJoinGroup}>
                <ThemedText style={[styles.createLink, { color: primaryColor }]}>Join Group</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.dividerDot}>•</ThemedText>
              <TouchableOpacity onPress={handleCreateGroup}>
                <ThemedText style={[styles.createLink, { color: primaryColor }]}>Create New</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {groups.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.emptyStateText}>You haven't joined any groups yet.</ThemedText>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                  onPress={handleCreateGroup}
                >
                  <ThemedText style={styles.primaryButtonText}>Create Group</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: primaryColor }]}
                  onPress={handleJoinGroup}
                >
                  <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>Join Group</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[styles.groupCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => handleGroupPress(group.id)}
              >
                <View style={styles.groupCardHeader}>
                  <ThemedText style={styles.groupName}>{group.name}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: group.status === 'active' ? '#4CAF50' : '#FFC107' }]}>
                    <ThemedText style={styles.statusText}>{group.status?.toUpperCase() || 'PRE-DRAFT'}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.groupDetails}>
                  {group.members?.length || 0} Members • Week {group.currentWeek || 0}
                </ThemedText>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Group Portfolios - Each group has an associated portfolio */}
        {groups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Group Portfolios</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/portfolio')}>
                <ThemedText style={[styles.createLink, { color: primaryColor }]}>View All</ThemedText>
              </TouchableOpacity>
            </View>

            {groups.map((group) => {
              const portfolio = getPortfolioByLeague(group.id);
              if (!portfolio) return null;

              return (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.portfolioCard, { backgroundColor: cardBg, borderColor }]}
                  onPress={() => {
                    setSelectedLeagueId(group.id);
                    router.push('/(tabs)/portfolio');
                  }}
                >
                  <View style={styles.portfolioHeader}>
                    <View>
                      <ThemedText style={styles.portfolioGroupName}>{group.name}</ThemedText>
                      <ThemedText style={styles.portfolioMemberCount}>
                        {group.members?.length || 0} members • Week {group.currentWeek || 0}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerDot: {
    fontSize: 14,
    opacity: 0.5,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  groupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
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
  groupDetails: {
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
  portfolioGroupName: {
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
