import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  Colors,
  Typography,
  Radii,
  Spacing,
  AmbientShadow,
} from "@/constants/theme";
import { GroupService } from "@/src/services/fantasy/groupService";
import { Group } from "@/src/types/fantasy";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { usePortfolio } from "@/contexts/portfolio-context";
import { useAuthContext } from "@/contexts/auth-context";
import { TopBar } from "@/components/top-bar";
import { useLessons } from "@/hooks/use-lessons";
import { AppLoadingScreen } from "@/components/app-loading-screen";

export default function FantasyHubScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [tournament, setTournament] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningTournament, setJoiningTournament] = useState(false);

  const c = Colors.light;
  const { getPortfolioByLeague, setSelectedLeagueId, refreshPortfolios } =
    usePortfolio();
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuthContext();
  const { portfolioBalance } = useLessons(userId);

  const fetchGroups = async () => {
    if (!authLoaded || !isSignedIn || !userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await GroupService.getGroups();
      setGroups(data);
      const tournamentData = await GroupService.getActiveTournament();
      setTournament(tournamentData);
      await refreshPortfolios();
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [authLoaded, isSignedIn, userId]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const handleCreateGroup = () => {
    router.push("/fantasy/create-group");
  };

  const handleJoinGroup = () => {
    router.push("/fantasy/join-group");
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/fantasy/group/${groupId}`);
  };

  const isGroupActive = (group: Group) => {
    if (!group.settings?.startDate) {
      return group.status !== "pending";
    }
    const parsed = new Date(group.settings.startDate);
    if (Number.isNaN(parsed.getTime())) {
      return group.status !== "pending";
    }
    return new Date() >= parsed;
  };

  const handleJoinTournament = async () => {
    if (!tournament || joiningTournament) return;
    const requiredBalance = tournament.settings?.startingBalance || 10000;
    if (portfolioBalance < requiredBalance) {
      alert(
        `You need at least $${requiredBalance.toLocaleString()} in learning dollars to join this tournament. You currently have $${portfolioBalance.toLocaleString()}.`
      );
      return;
    }
    setJoiningTournament(true);
    try {
      await GroupService.joinTournament(tournament.id, portfolioBalance);
      await fetchGroups();
    } catch (error: any) {
      console.error("Failed to join tournament:", error);
      alert(error.message || "Failed to join tournament");
    } finally {
      setJoiningTournament(false);
    }
  };

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <ThemedView style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.primary}
          />
        }
      >
        {/* Monthly Tournament */}
        {tournament && (
          <View style={styles.section}>
            <View
              style={[
                styles.tournamentCard,
                { backgroundColor: c.surfaceContainerLowest },
              ]}
            >
              <View style={styles.tournamentHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="title-lg" style={styles.tournamentName}>
                    {tournament.name}
                  </ThemedText>
                  <ThemedText
                    type="body-md"
                    style={styles.tournamentDescription}
                  >
                    {tournament.description ||
                      "Open to everyone \u2022 No join code required"}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.tournamentBadge,
                    { backgroundColor: c.primary },
                  ]}
                >
                  <ThemedText
                    type="label-md"
                    style={styles.tournamentBadgeText}
                  >
                    LIVE
                  </ThemedText>
                </View>
              </View>

              {/* Stats — floating dividers instead of borders */}
              <View style={styles.tournamentStatsWrapper}>
                <View style={styles.floatingDivider} />
                <View style={styles.tournamentStats}>
                  <View style={styles.tournamentStat}>
                    <ThemedText
                      type="title-lg"
                      style={styles.tournamentStatValue}
                    >
                      {tournament.memberCount || 0}
                    </ThemedText>
                    <ThemedText
                      type="label-md"
                      style={styles.tournamentStatLabel}
                    >
                      Participants
                    </ThemedText>
                  </View>
                  <View style={styles.tournamentStat}>
                    <ThemedText
                      type="title-lg"
                      style={styles.tournamentStatValue}
                    >
                      Top 10
                    </ThemedText>
                    <ThemedText
                      type="label-md"
                      style={styles.tournamentStatLabel}
                    >
                      Win Rewards
                    </ThemedText>
                  </View>
                  <View style={styles.tournamentStat}>
                    <ThemedText
                      type="title-lg"
                      style={[styles.tournamentStatValue, { color: c.primary }]}
                    >
                      {new Date(
                        new Date().getFullYear(),
                        new Date().getMonth() + 1,
                        0,
                      ).getDate() - new Date().getDate()}
                      d
                    </ThemedText>
                    <ThemedText
                      type="label-md"
                      style={styles.tournamentStatLabel}
                    >
                      Remaining
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.floatingDivider} />
              </View>

              {tournament.isUserMember ? (
                <TouchableOpacity
                  style={[
                    styles.tournamentButton,
                    { backgroundColor: c.primary },
                  ]}
                  onPress={() => handleGroupPress(tournament.id)}
                >
                  <ThemedText
                    type="title-md"
                    style={styles.tournamentButtonText}
                  >
                    View Leaderboard
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.tournamentButton,
                    { backgroundColor: c.primary },
                  ]}
                  onPress={handleJoinTournament}
                  disabled={joiningTournament}
                >
                  <ThemedText
                    type="title-md"
                    style={styles.tournamentButtonText}
                  >
                    {joiningTournament ? "Joining..." : "Join Tournament"}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Active Groups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title-lg">Your Groups</ThemedText>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleJoinGroup}>
                <ThemedText
                  type="label-lg"
                  style={[styles.createLink, { color: c.primary }]}
                >
                  Join Group
                </ThemedText>
              </TouchableOpacity>
              <ThemedText type="label-md" style={styles.dividerDot}>
                {"\u2022"}
              </ThemedText>
              <TouchableOpacity onPress={handleCreateGroup}>
                <ThemedText
                  type="label-lg"
                  style={[styles.createLink, { color: c.primary }]}
                >
                  Create New
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {groups.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: c.surfaceContainerLow },
              ]}
            >
              <ThemedText type="body-lg" style={styles.emptyStateText}>
                You haven&apos;t joined any groups yet.
              </ThemedText>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: c.primary }]}
                  onPress={handleCreateGroup}
                >
                  <ThemedText type="title-md" style={styles.primaryButtonText}>
                    Create Group
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    { backgroundColor: c.secondaryContainer },
                  ]}
                  onPress={handleJoinGroup}
                >
                  <ThemedText
                    type="title-md"
                    style={[
                      styles.secondaryButtonText,
                      { color: c.onSecondaryContainer },
                    ]}
                  >
                    Join Group
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            groups.map((group) => {
              const portfolio = getPortfolioByLeague(group.id);
              const groupActive = isGroupActive(group);
              const startingBalance = group.settings?.startingBalance || 10000;
              const currentValue = portfolio?.totalValue || startingBalance;
              const dollarChange = currentValue - startingBalance;
              const percentChange = (dollarChange / startingBalance) * 100;

              return (
                <View
                  key={group.id}
                  style={[
                    styles.groupCard,
                    { backgroundColor: c.surfaceContainerLowest },
                  ]}
                >
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          group.status === "completed"
                            ? c.onSurfaceVariant
                            : group.status === "active"
                              ? c.success
                              : c.warning,
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 1,
                      },
                    ]}
                  >
                    <ThemedText type="label-md" style={styles.statusText}>
                      {group.status?.toUpperCase() || "PRE-DRAFT"}
                    </ThemedText>
                  </View>

                  {/* Group Info */}
                  <TouchableOpacity
                    onPress={() => handleGroupPress(group.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.groupCardHeader}>
                      <View style={styles.groupHeaderLeft}>
                        <ThemedText style={styles.groupIcon}>👥</ThemedText>
                        <View>
                          <ThemedText type="title-md" style={styles.groupName}>
                            {group.name}
                          </ThemedText>
                          <ThemedText
                            type="label-md"
                            style={styles.groupDetails}
                          >
                            {group.members?.length || 0} Members {"\u2022"} Week{" "}
                            {group.currentWeek || 0}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText style={styles.chevron}>›</ThemedText>
                    </View>
                  </TouchableOpacity>

                  {/* Portfolio Section — floating divider instead of borderTop */}
                  {portfolio && groupActive && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLeagueId(group.id);
                        router.push("/(tabs)/portfolio");
                      }}
                      activeOpacity={0.7}
                      style={styles.portfolioSection}
                    >
                      <View style={styles.floatingDivider} />
                      <View style={styles.portfolioHeader}>
                        <ThemedText style={styles.portfolioIcon}>💼</ThemedText>
                        <View style={styles.portfolioContent}>
                          <ThemedText
                            type="label-md"
                            style={styles.portfolioLabel}
                          >
                            My Portfolio
                          </ThemedText>
                          <View style={styles.portfolioValueContainer}>
                            <ThemedText
                              type="title-lg"
                              style={styles.portfolioValueLarge}
                            >
                              ${currentValue.toFixed(2)}
                            </ThemedText>
                            <View style={styles.portfolioChange}>
                              <ThemedText
                                type="label-lg"
                                style={[
                                  styles.portfolioChangeText,
                                  {
                                    color:
                                      dollarChange >= 0 ? c.success : c.danger,
                                  },
                                ]}
                              >
                                {dollarChange >= 0 ? "+$" : "-$"}
                                {Math.abs(dollarChange).toFixed(2)}
                              </ThemedText>
                              <ThemedText
                                type="label-md"
                                style={[
                                  styles.portfolioChangePercent,
                                  {
                                    color:
                                      percentChange >= 0 ? c.success : c.danger,
                                  },
                                ]}
                              >
                                ({percentChange >= 0 ? "+" : ""}
                                {percentChange.toFixed(2)}%)
                              </ThemedText>
                            </View>
                          </View>
                        </View>
                        <ThemedText style={styles.chevron}>›</ThemedText>
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
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },

  header: { marginBottom: Spacing.md },
  title: { marginBottom: 4 },
  subtitle: { color: Colors.light.onSurfaceVariant },

  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dividerDot: { color: Colors.light.onSurfaceVariant },
  createLink: {},

  // Empty state — tonal bg, no dashed border
  emptyState: {
    padding: Spacing.lg,
    borderRadius: Radii.md,
    alignItems: "center",
    // No borderWidth, no borderStyle: 'dashed'
  },
  emptyStateText: {
    marginBottom: Spacing.md,
    color: Colors.light.onSurfaceVariant,
  },
  buttonRow: { flexDirection: "row", gap: 12 },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.lg,
  },
  primaryButtonText: { color: "#FFFFFF" },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    // No borderWidth
  },
  secondaryButtonText: {},

  // Group cards — no border, ambient shadow
  groupCard: {
    borderRadius: Radii.md,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
    ...AmbientShadow,
  },
  groupCardHeader: {
    padding: Spacing.md,
    paddingRight: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  groupIcon: { fontSize: 28 },
  groupName: { marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  statusText: {
    color: "#FFFFFF",
    fontFamily: Typography["label-md"].fontFamily,
    fontSize: 10,
  },
  groupDetails: { color: Colors.light.onSurfaceVariant },
  chevron: { fontSize: 32, color: Colors.light.onSurfaceVariant, opacity: 0.4 },

  // Portfolio section — floating divider
  portfolioSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  floatingDivider: {
    height: 1,
    backgroundColor: Colors.light.surfaceContainerHigh,
    marginHorizontal: "10%",
    marginBottom: Spacing.md,
  },
  portfolioHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  portfolioIcon: { fontSize: 24 },
  portfolioContent: { flex: 1 },
  portfolioLabel: {
    color: Colors.light.onSurfaceVariant,
    marginBottom: 4,
  },
  portfolioValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  portfolioValueLarge: {},
  portfolioChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  portfolioChangeText: {},
  portfolioChangePercent: {},

  // Tournament card — ambient shadow, no border
  tournamentCard: {
    borderRadius: Radii.md,
    padding: Spacing.lg,
    ...AmbientShadow,
  },
  tournamentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  tournamentName: { marginBottom: 6 },
  tournamentDescription: {
    color: Colors.light.onSurfaceVariant,
    lineHeight: 18,
  },
  tournamentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.sm,
  },
  tournamentBadgeText: {
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  tournamentStatsWrapper: {
    marginBottom: Spacing.md,
  },
  tournamentStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
  },
  tournamentStat: { alignItems: "center" },
  tournamentStatValue: { marginBottom: 4 },
  tournamentStatLabel: {
    color: Colors.light.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tournamentButton: {
    paddingVertical: 14,
    borderRadius: Radii.lg,
    alignItems: "center",
  },
  tournamentButtonText: { color: "#FFFFFF" },
});
