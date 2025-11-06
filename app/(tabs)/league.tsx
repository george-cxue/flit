import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LeagueScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const leaderboard = [
    {
      rank: 1,
      name: 'Sarah Chen',
      username: '@sarahc',
      iqScore: 923,
      avatar: '👩‍💼',
      strategy: '65% Stocks, 25% Index, 10% Savings',
      change: '+12',
    },
    {
      rank: 2,
      name: 'Marcus Johnson',
      username: '@marcusj',
      iqScore: 891,
      avatar: '👨‍💻',
      strategy: '50% Index, 30% Stocks, 20% Bonds',
      change: '+5',
    },
    {
      rank: 3,
      name: 'You',
      username: '@alex',
      iqScore: 847,
      avatar: '😊',
      strategy: '45% Stocks, 35% Index, 20% Savings',
      change: '+8',
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: 'Emma Rodriguez',
      username: '@emmar',
      iqScore: 812,
      avatar: '👩‍🎓',
      strategy: '40% Index, 35% Stocks, 25% Savings',
      change: '-3',
    },
    {
      rank: 5,
      name: 'Jake Thompson',
      username: '@jaket',
      iqScore: 789,
      avatar: '👨‍🚀',
      strategy: '55% Stocks, 30% Index, 15% Bonds',
      change: '+15',
    },
    {
      rank: 6,
      name: 'Priya Patel',
      username: '@priyap',
      iqScore: 765,
      avatar: '👩‍🔬',
      strategy: '60% Index, 25% Savings, 15% Stocks',
      change: '+2',
    },
    {
      rank: 7,
      name: 'David Kim',
      username: '@davidk',
      iqScore: 743,
      avatar: '👨‍🎨',
      strategy: '45% Stocks, 30% Index, 25% Savings',
      change: '-7',
    },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.icon;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
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
          <ThemedText type="title" style={styles.title}>
            League
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Weekly Financial IQ Competition
          </ThemedText>
        </View>

        {/* League Info Card */}
        <View style={[styles.leagueCard, { backgroundColor: primaryColor }]}>
          <View style={styles.leagueHeader}>
            <View>
              <ThemedText style={styles.leagueName}>Diamond League</ThemedText>
              <ThemedText style={styles.leagueDescription}>
                Top 20% of all players
              </ThemedText>
            </View>
            <ThemedText style={styles.leagueBadge}>💎</ThemedText>
          </View>

          <View style={styles.leagueStats}>
            <View style={styles.leagueStat}>
              <ThemedText style={styles.leagueStatValue}>#3</ThemedText>
              <ThemedText style={styles.leagueStatLabel}>Your Rank</ThemedText>
            </View>
            <View style={styles.leagueStatDivider} />
            <View style={styles.leagueStat}>
              <ThemedText style={styles.leagueStatValue}>847</ThemedText>
              <ThemedText style={styles.leagueStatLabel}>Your IQ</ThemedText>
            </View>
            <View style={styles.leagueStatDivider} />
            <View style={styles.leagueStat}>
              <ThemedText style={styles.leagueStatValue}>5d 12h</ThemedText>
              <ThemedText style={styles.leagueStatLabel}>Time Left</ThemedText>
            </View>
          </View>
        </View>

        {/* Promotion/Relegation Info */}
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoIcon}>⬆️</ThemedText>
            <View style={styles.infoText}>
              <ThemedText style={styles.infoTitle}>Top 3 get promoted</ThemedText>
              <ThemedText style={styles.infoDescription}>
                Move up to Master League
              </ThemedText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoIcon}>⬇️</ThemedText>
            <View style={styles.infoText}>
              <ThemedText style={styles.infoTitle}>Bottom 3 get relegated</ThemedText>
              <ThemedText style={styles.infoDescription}>
                Move down to Platinum League
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Leaderboard
          </ThemedText>

          {leaderboard.map((player, index) => (
            <View
              key={index}
              style={[
                styles.playerCard,
                {
                  backgroundColor: player.isCurrentUser ? primaryColor + '15' : cardBg,
                  borderColor: player.isCurrentUser ? primaryColor : borderColor,
                  borderWidth: player.isCurrentUser ? 2 : 1,
                },
              ]}
            >
              <View style={styles.playerRank}>
                {player.rank <= 3 ? (
                  <ThemedText style={styles.rankEmoji}>
                    {getRankIcon(player.rank)}
                  </ThemedText>
                ) : (
                  <ThemedText style={[styles.rankNumber, { color: getRankColor(player.rank) }]}>
                    {player.rank}
                  </ThemedText>
                )}
              </View>

              <View style={styles.playerAvatar}>
                <ThemedText style={styles.avatarEmoji}>{player.avatar}</ThemedText>
              </View>

              <View style={styles.playerInfo}>
                <View style={styles.playerNameRow}>
                  <ThemedText style={styles.playerName}>{player.name}</ThemedText>
                  {player.isCurrentUser && (
                    <View style={[styles.youBadge, { backgroundColor: primaryColor }]}>
                      <ThemedText style={styles.youBadgeText}>YOU</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.playerUsername}>{player.username}</ThemedText>
                <TouchableOpacity style={styles.strategyButton}>
                  <ThemedText style={styles.strategyText}>{player.strategy}</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.playerScore}>
                <ThemedText style={styles.scoreValue}>{player.iqScore}</ThemedText>
                <View
                  style={[
                    styles.scoreChange,
                    {
                      backgroundColor: player.change.startsWith('+') ? successColor + '20' : colors.danger + '20',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.scoreChangeText,
                      { color: player.change.startsWith('+') ? successColor : colors.danger },
                    ]}
                  >
                    {player.change}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: primaryColor }]}
          >
            <ThemedText style={styles.primaryButtonText}>Invite Friends</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor }]}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>
              View All Leagues
            </ThemedText>
          </TouchableOpacity>
        </View>

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
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  leagueCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  leagueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leagueName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  leagueDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
  },
  leagueBadge: {
    fontSize: 48,
  },
  leagueStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  leagueStat: {
    flex: 1,
    alignItems: 'center',
  },
  leagueStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  leagueStatValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  leagueStatLabel: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 12,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  leaderboardSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  playerRank: {
    width: 32,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerUsername: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 6,
  },
  strategyButton: {
    alignSelf: 'flex-start',
  },
  strategyText: {
    fontSize: 12,
    opacity: 0.5,
  },
  playerScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreChange: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
