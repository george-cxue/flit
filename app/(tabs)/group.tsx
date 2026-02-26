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
  const [tournament, setTournament] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningTournament, setJoiningTournament] = useState(false);

  const primaryColor = useThemeColor({}, 'primary' as any);
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const { getPortfolioByLeague, setSelectedLeagueId, refreshPortfolios } = usePortfolio();

  const fetchGroups = async () => {
    try {
      const data = await GroupService.getGroups();
      setGroups(data);

      // Fetch tournament
      const tournamentData = await GroupService.getActiveTournament();
      setTournament(tournamentData);

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

  const handleJoinTournament = async () => {
    if (!tournament || joiningTournament) return;
    
    setJoiningTournament(true);
    try {
      await GroupService.joinTournament(tournament.id);
      // Refresh to get updated tournament data
      await fetchGroups();
    } catch (error: any) {
      console.error('Failed to join tournament:', error);
      alert(error.message || 'Failed to join tournament');
    } finally {
      setJoiningTournament(false);
    }
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

        {/* Monthly Tournament */}
        {tournament && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">🏆 Monthly Tournament</ThemedText>
            </View>
            
            <View style={[styles.tournamentCard, { backgroundColor: cardBg, borderColor: primaryColor }]}>
              {/* Tournament Header */}
              <View style={styles.tournamentHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.tournamentName}>{tournament.name}</ThemedText>
                  <ThemedText style={styles.tournamentDescription}>
                    {tournament.description || 'Open to everyone • No join code required'}
                  </ThemedText>
                </View>
                <View style={[styles.tournamentBadge, { backgroundColor: primaryColor }]}>
                  <ThemedText style={styles.tournamentBadgeText}>LIVE</ThemedText>
                </View>
              </View>

              {/* Tournament Stats */}
              <View style={styles.tournamentStats}>
                <View style={styles.tournamentStat}>
                  <ThemedText style={styles.tournamentStatValue}>{tournament.memberCount || 0}</ThemedText>
                  <ThemedText style={styles.tournamentStatLabel}>Participants</ThemedText>
                </View>
                <View style={styles.tournamentStat}>
                  <ThemedText style={styles.tournamentStatValue}>Top 10</ThemedText>
                  <ThemedText style={styles.tournamentStatLabel}>Win Rewards</ThemedText>
                </View>
                <View style={styles.tournamentStat}>
                  <ThemedText style={[styles.tournamentStatValue, { color: primaryColor }]}>
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}d
                  </ThemedText>
                  <ThemedText style={styles.tournamentStatLabel}>Remaining</ThemedText>
                </View>
              </View>

              {/* Action Button */}
              {tournament.isUserMember ? (
                <TouchableOpacity
                  style={[styles.tournamentButton, { backgroundColor: primaryColor }]}
                  onPress={() => handleGroupPress(tournament.id)}
                >
                  <ThemedText style={styles.tournamentButtonText}>View Leaderboard</ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.tournamentButton, { backgroundColor: primaryColor }]}
                  onPress={handleJoinTournament}
                  disabled={joiningTournament}
                >
                  <ThemedText style={styles.tournamentButtonText}>
                    {joiningTournament ? 'Joining...' : 'Join Tournament'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

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
            groups.map((group) => {
              const portfolio = getPortfolioByLeague(group.id);
              
              return (
                <View
                  key={group.id}
                  style={[styles.groupCard, { backgroundColor: cardBg, borderColor }]}
                >
                  {/* Status Badge - Top Right */}
                  <View style={[styles.statusBadge, { 
                    backgroundColor: group.status === 'active' ? '#4CAF50' : '#FFC107',
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1,
                  }]}>
                    <ThemedText style={styles.statusText}>{group.status?.toUpperCase() || 'PRE-DRAFT'}</ThemedText>
                  </View>

                  {/* Group Info Section - Click to view group details */}
                  <TouchableOpacity
                    onPress={() => handleGroupPress(group.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.groupCardHeader}>
                      <ThemedText style={styles.groupName}>{group.name}</ThemedText>
                      <ThemedText style={styles.groupDetails}>
                        {group.members?.length || 0} Members • Week {group.currentWeek || 0}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>

                  {/* Portfolio Section - Click to view/edit portfolio */}
                  {portfolio && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLeagueId(group.id);
                        router.push('/(tabs)/portfolio');
                      }}
                      activeOpacity={0.7}
                      style={styles.portfolioSection}
                    >
                      <View style={styles.portfolioValueRow}>
                        <ThemedText style={styles.portfolioValueLabel}>Portfolio Value</ThemedText>
                        <ThemedText style={styles.portfolioValue}>
                          ${portfolio.totalValue.toFixed(2)}
                        </ThemedText>
                      </View>

                      <View style={styles.portfolioStats}>
                        <View style={styles.portfolioStat}>
                          <ThemedText style={styles.statLabel}>Holdings</ThemedText>
                          <ThemedText style={styles.statValue}>{portfolio.holdings.length}</ThemedText>
                        </View>
                        <View style={styles.portfolioStat}>
                          <ThemedText style={styles.statLabel}>Cash</ThemedText>
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
                  )}
                </View>
              );
            })
          )}
        </View>

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
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  groupCardHeader: {
    padding: 16,
    paddingRight: 80, // Make room for the absolute positioned badge
    paddingBottom: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
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
  portfolioSection: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  portfolioValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioValueLabel: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
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
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
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
  tournamentCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  tournamentDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  tournamentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tournamentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tournamentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    marginBottom: 16,
  },
  tournamentStat: {
    alignItems: 'center',
  },
  tournamentStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  tournamentStatLabel: {
    fontSize: 11,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tournamentButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  tournamentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
