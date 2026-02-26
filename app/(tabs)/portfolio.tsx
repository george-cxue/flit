import React, { useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
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

export default function PortfolioScreen() {
  const { leagueId: paramLeagueId } = useLocalSearchParams();
  const [groups, setGroups] = React.useState<Group[]>([]);

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

  // Refresh portfolios whenever this tab gains focus
  useFocusEffect(
    useCallback(() => {
      refreshPortfolios();
    }, [refreshPortfolios])
  );

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await GroupService.getGroups();
        setGroups(data);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      }
    };
    fetchGroups();
  }, []);

  // Pre-select group if passed as parameter
  useEffect(() => {
    if (paramLeagueId && typeof paramLeagueId === 'string') {
      setSelectedLeagueId(paramLeagueId);
    }
  }, [paramLeagueId]);

  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const currentPortfolio = getCurrentPortfolio();

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading portfolios...</ThemedText>
      </ThemedView>
    );
  }

  if (!currentPortfolio) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
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
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Group Selector */}
        <View style={[styles.leagueSelector, { backgroundColor: cardBackground }]}>
          <ThemedText style={styles.sectionLabel}>Group</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueTabs}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.leagueTab,
                  selectedLeagueId === group.id && {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  },
                  selectedLeagueId !== group.id && { borderColor },
                ]}
                onPress={() => setSelectedLeagueId(group.id)}
              >
                <ThemedText
                  style={[
                    styles.leagueTabText,
                    selectedLeagueId === group.id && styles.leagueTabTextActive,
                  ]}
                >
                  {group.name}
                </ThemedText>
                <ThemedText
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
        <View style={[styles.valueCard, { backgroundColor: cardBackground }]}>
          <ThemedText style={styles.valueLabel}>Total Portfolio Value</ThemedText>
          <ThemedText style={styles.valueAmount}>
            ${currentPortfolio.totalValue.toFixed(2)}
          </ThemedText>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <ThemedText style={styles.balanceLabel}>Cash</ThemedText>
              <ThemedText style={styles.balanceValue}>
                ${currentPortfolio.liquidFunds.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText style={styles.balanceLabel}>Stocks</ThemedText>
              <ThemedText style={styles.balanceValue}>
                ${(currentPortfolio.totalValue - currentPortfolio.liquidFunds - currentPortfolio.allocation.savings - currentPortfolio.allocation.bonds - currentPortfolio.allocation.indexFunds).toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText style={styles.balanceLabel}>Other</ThemedText>
              <ThemedText style={styles.balanceValue}>
                ${(currentPortfolio.allocation.savings + currentPortfolio.allocation.bonds + currentPortfolio.allocation.indexFunds).toFixed(2)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.balanceNote}>
            Portfolio value is automatically updated every hour with real-time stock prices
          </ThemedText>
        </View>

        {/* Performance Chart */}
        <View style={[styles.chartCard, { backgroundColor: cardBackground }]}>
          <PerformanceChart
            portfolioHistory={currentPortfolio.history}
            sp500History={MOCK_SP500.history}
            timeFrame={timeFrame}
          />
        </View>

        {/* Time Frame Selector */}
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
                timeFrame === tf && { backgroundColor: primaryColor },
                timeFrame !== tf && { borderColor },
              ]}
              onPress={() => setTimeFrame(tf)}
            >
              <ThemedText
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

        {/* Other Assets - Buy/Sell */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <AssetAllocationManager
            allocation={currentPortfolio.allocation}
            cashBalance={currentPortfolio.liquidFunds}
            onAllocate={allocateFunds.bind(null, selectedLeagueId)}
          />
        </View>

        {/* Stock Search */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <StockSearch
            liquidFunds={currentPortfolio.liquidFunds}
            onBuyStock={handleBuyStock}
          />
        </View>

        {/* Holdings List */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <HoldingsList holdings={currentPortfolio.holdings} onSellStock={handleSellStock} />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  leagueSelector: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  leagueTabs: {
    flexDirection: 'row',
  },
  leagueTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    minWidth: 120,
  },
  leagueTabText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  leagueTabTextActive: {
    color: '#fff',
  },
  leagueMemberCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  leagueMemberCountActive: {
    color: '#fff',
    opacity: 0.8,
  },
  valueCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 12,
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceNote: {
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  timeFrameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeFrameTextActive: {
    color: '#fff',
  },
  chartCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
  },
});
