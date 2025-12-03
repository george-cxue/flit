import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeagueService } from '@/src/services/fantasy/leagueService';
import { League } from '@/src/types/fantasy';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function FantasyHubScreen() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const primaryColor = useThemeColor({}, 'primary' as any);
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const fetchLeagues = async () => {
    try {
      const data = await LeagueService.getLeagues();
      setLeagues(data);
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

  const handleJoinLeague = () => {
    router.push('/fantasy/join-league');
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
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleJoinLeague}>
                <ThemedText style={[styles.createLink, { color: primaryColor }]}>Join League</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.dividerDot}>•</ThemedText>
              <TouchableOpacity onPress={handleCreateLeague}>
                <ThemedText style={[styles.createLink, { color: primaryColor }]}>Create New</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {leagues.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.emptyStateText}>You haven't joined any leagues yet.</ThemedText>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                  onPress={handleCreateLeague}
                >
                  <ThemedText style={styles.primaryButtonText}>Create League</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: primaryColor }]}
                  onPress={handleJoinLeague}
                >
                  <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>Join League</ThemedText>
                </TouchableOpacity>
              </View>
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

        {/* Market Highlights (Placeholder) */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Market Highlights</ThemedText>
          <View style={[styles.marketCard, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText>Market data coming soon...</ThemedText>
          </View>
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
});
