import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PerformanceChart } from '@/components/portfolio/performance-chart';
import { AssetAllocationComponent } from '@/components/portfolio/asset-allocation';
import { StockSearch } from '@/components/portfolio/stock-search';
import { HoldingsList } from '@/components/portfolio/holdings-list';
import { MOCK_LEAGUES, MOCK_SP500 } from '@/data/mock-portfolio';
import { AssetAllocation, Stock, TimeFrame } from '@/types/portfolio';
import { usePortfolio } from '@/contexts/portfolio-context';

export default function PortfolioScreen() {
  const {
    selectedLeagueId,
    setSelectedLeagueId,
    timeFrame,
    setTimeFrame,
    allocateFunds,
    buyStock,
    getCurrentPortfolio,
  } = usePortfolio();

  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const currentPortfolio = getCurrentPortfolio();
  const currentLeague = MOCK_LEAGUES.find((league) => league.id === selectedLeagueId);

  const handleAllocate = (asset: keyof AssetAllocation, amount: number) => {
    allocateFunds(selectedLeagueId, asset, amount);
  };

  const handleBuyStock = (stock: Stock, shares: number) => {
    buyStock(selectedLeagueId, stock, shares);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* League Selector */}
        <View style={[styles.leagueSelector, { backgroundColor: cardBackground }]}>
          <ThemedText style={styles.sectionLabel}>League</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueTabs}>
            {MOCK_LEAGUES.map((league) => (
              <TouchableOpacity
                key={league.id}
                style={[
                  styles.leagueTab,
                  selectedLeagueId === league.id && {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  },
                  selectedLeagueId !== league.id && { borderColor },
                ]}
                onPress={() => setSelectedLeagueId(league.id)}
              >
                <ThemedText
                  style={[
                    styles.leagueTabText,
                    selectedLeagueId === league.id && styles.leagueTabTextActive,
                  ]}
                >
                  {league.name}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.leagueMemberCount,
                    selectedLeagueId === league.id && styles.leagueMemberCountActive,
                  ]}
                >
                  {league.memberCount} members
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
              <ThemedText style={styles.balanceLabel}>Liquid Funds</ThemedText>
              <ThemedText style={styles.balanceValue}>
                ${currentPortfolio.liquidFunds.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText style={styles.balanceLabel}>Lesson Rewards</ThemedText>
              <ThemedText style={[styles.balanceValue, { color: primaryColor }]}>
                ${currentPortfolio.lessonRewards.toFixed(2)}
              </ThemedText>
            </View>
          </View>
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

        {/* Asset Allocation */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <AssetAllocationComponent
            allocation={currentPortfolio.allocation}
            liquidFunds={currentPortfolio.liquidFunds}
            onAllocate={handleAllocate}
          />
        </View>

        {/* Stock Search */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <StockSearch
            lessonRewards={currentPortfolio.lessonRewards}
            onBuyStock={handleBuyStock}
          />
        </View>

        {/* Holdings List */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <HoldingsList holdings={currentPortfolio.holdings} />
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
  },
  balanceItem: {
    alignItems: 'center',
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
