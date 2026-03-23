import React, { useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Typography, Radii, Spacing, AmbientShadow, SubtleShadow } from '@/constants/theme';
import { PerformanceChart } from '@/components/portfolio/performance-chart';
import { AssetAllocationComponent } from '@/components/portfolio/asset-allocation';
import { AssetAllocationManager } from '@/components/portfolio/asset-allocation-manager';
import { StockSearch } from '@/components/portfolio/stock-search';
import { HoldingsList } from '@/components/portfolio/holdings-list';
import { MOCK_SP500 } from '@/data/mock-portfolio';
import { AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';
import { usePortfolio } from '@/contexts/portfolio-context';
import { useLocalSearchParams } from 'expo-router';
import { GroupService } from '@/src/services/fantasy/groupService';
import { Group } from '@/src/types/fantasy';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthContext } from '@/contexts/auth-context';

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const { leagueId: paramLeagueId } = useLocalSearchParams();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuthContext();

  const {
    selectedLeagueId,
    setSelectedLeagueId,
    timeFrame,
    setTimeFrame,
    allocateFunds,
    buyStock,
    sellStock,
    getCurrentPortfolio,
    portfolios,
    loading,
    refreshPortfolios,
  } = usePortfolio();

  useFocusEffect(
    useCallback(() => {
      refreshPortfolios();
    }, [refreshPortfolios])
  );

  useEffect(() => {
    const fetchGroups = async () => {
      if (!authLoaded || !isSignedIn || !userId) {
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
  }, [authLoaded, isSignedIn, userId]);

  useEffect(() => {
    if (paramLeagueId && typeof paramLeagueId === 'string') {
      setSelectedLeagueId(paramLeagueId);
    }
  }, [paramLeagueId]);

  const c = Colors.light;
  const currentPortfolio = getCurrentPortfolio();

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText type="body-lg">Loading portfolios...</ThemedText>
      </ThemedView>
    );
  }

  if (!currentPortfolio) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }]}>
        <ThemedText type="body-lg" style={{ textAlign: 'center', marginBottom: Spacing.md }}>
          No portfolios found. Join or create a group to get started!
        </ThemedText>
      </ThemedView>
    );
  }

  const handleAllocate = (asset: keyof AssetAllocation, amount: number) => {
    allocateFunds(selectedLeagueId, asset, amount);
  };

  const handleBuyStock = async (stock: Stock, shares: number) => {
    await buyStock(selectedLeagueId, stock, shares);
  };

  const handleSellStock = async (symbol: string, shares: number) => {
    await sellStock(selectedLeagueId, symbol, shares);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top }}>
      <ThemedView style={styles.content}>
        {/* Group Selector */}
        <View style={[styles.leagueSelector, { backgroundColor: c.surfaceContainerLowest }]}>
          <ThemedText type="label-lg" style={styles.sectionLabel}>Group</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueTabs}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.leagueTab,
                  {
                    backgroundColor: selectedLeagueId === group.id ? c.primary : c.surfaceContainerLow,
                  },
                ]}
                onPress={() => setSelectedLeagueId(group.id)}
              >
                <ThemedText
                  type="label-lg"
                  style={[
                    styles.leagueTabText,
                    selectedLeagueId === group.id && styles.leagueTabTextActive,
                  ]}
                >
                  {group.name}
                </ThemedText>
                <ThemedText
                  type="label-md"
                  style={[
                    styles.leagueMemberCount,
                    selectedLeagueId === group.id && styles.leagueMemberCountActive,
                  ]}
                >
                  {group.members?.length || 0} members
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Portfolio Value */}
        <View style={[styles.valueCard, { backgroundColor: c.surfaceContainerLowest, ...AmbientShadow }]}>
          <ThemedText type="label-lg" style={styles.valueLabel}>Total Portfolio Value</ThemedText>
          <ThemedText style={styles.valueAmount}>
            ${currentPortfolio.totalValue.toFixed(2)}
          </ThemedText>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <ThemedText type="label-md" style={styles.balanceLabel}>Cash</ThemedText>
              <ThemedText type="title-md" style={styles.balanceValue}>
                ${currentPortfolio.liquidFunds.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText type="label-md" style={styles.balanceLabel}>Stocks</ThemedText>
              <ThemedText type="title-md" style={styles.balanceValue}>
                ${(currentPortfolio.totalValue - currentPortfolio.liquidFunds - currentPortfolio.allocation.savings - currentPortfolio.allocation.bonds - currentPortfolio.allocation.indexFunds).toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText type="label-md" style={styles.balanceLabel}>Other</ThemedText>
              <ThemedText type="title-md" style={styles.balanceValue}>
                ${(currentPortfolio.allocation.savings + currentPortfolio.allocation.bonds + currentPortfolio.allocation.indexFunds).toFixed(2)}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="label-md" style={styles.balanceNote}>
            Portfolio value is automatically updated every hour with real-time stock prices
          </ThemedText>
        </View>

        {/* Performance Chart */}
        <View style={[styles.chartCard, { backgroundColor: c.surfaceContainerLowest }]}>
          <PerformanceChart
            portfolioHistory={currentPortfolio.history}
            sp500History={currentPortfolio.baselines?.sp500 || MOCK_SP500.history}
            timeFrame={timeFrame}
          />
        </View>

        {/* Time Frame Selector — pill buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeFrameContainer}
        >
          {(['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'ALL'] as TimeFrame[]).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeFrameButton,
                {
                  backgroundColor: timeFrame === tf ? c.primary : c.surfaceContainerHigh,
                },
              ]}
              onPress={() => setTimeFrame(tf)}
            >
              <ThemedText
                type="label-lg"
                style={[
                  styles.timeFrameText,
                  timeFrame === tf && styles.timeFrameTextActive,
                ]}
              >
                {tf}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Other Assets */}
        <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest }]}>
          <AssetAllocationManager
            allocation={currentPortfolio.allocation}
            cashBalance={currentPortfolio.liquidFunds}
            onAllocate={allocateFunds.bind(null, selectedLeagueId)}
          />
        </View>

        {/* Stock Search */}
        <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest }]}>
          <StockSearch
            groupId={selectedLeagueId}
            liquidFunds={currentPortfolio.liquidFunds}
            onBuyStock={handleBuyStock}
          />
        </View>

        {/* Holdings List */}
        <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest }]}>
          <HoldingsList holdings={currentPortfolio.holdings} onSellStock={handleSellStock} />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md },

  leagueSelector: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    ...SubtleShadow,
  },
  sectionLabel: {
    color: Colors.light.onSurfaceVariant,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  leagueTabs: { flexDirection: 'row' },
  leagueTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.md,
    marginRight: 12,
    minWidth: 120,
    // No borderWidth
  },
  leagueTabText: {
    marginBottom: 2,
    color: Colors.light.onSurface,
  },
  leagueTabTextActive: { color: '#fff' },
  leagueMemberCount: {
    color: Colors.light.onSurfaceVariant,
  },
  leagueMemberCountActive: { color: '#fff', opacity: 0.8 },

  valueCard: {
    padding: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  valueLabel: {
    color: Colors.light.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  valueAmount: {
    lineHeight: 44,
    paddingTop: Platform.OS !== 'web' ? 4 : 0,
    fontSize: 36,
    fontFamily: Typography['display-md'].fontFamily,
    color: Colors.light.onSurface,
    marginBottom: Spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: 12,
  },
  balanceItem: { alignItems: 'center', flex: 1 },
  balanceLabel: {
    color: Colors.light.onSurfaceVariant,
    marginBottom: 4,
  },
  balanceValue: {},
  balanceNote: {
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  timeFrameContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  timeFrameButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    minWidth: 60,
    alignItems: 'center',
    // No borderWidth
  },
  timeFrameText: { color: Colors.light.onSurface },
  timeFrameTextActive: { color: '#fff' },

  chartCard: {
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    ...SubtleShadow,
  },
  section: {
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    ...SubtleShadow,
  },
});
