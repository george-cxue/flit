import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PerformanceChart } from '@/components/portfolio/performance-chart';
import { AssetAllocationComponent } from '@/components/portfolio/asset-allocation';
import { StockSearch } from '@/components/portfolio/stock-search';
import { HoldingsList } from '@/components/portfolio/holdings-list';
import { MOCK_LEAGUES, MOCK_PORTFOLIOS, MOCK_SP500 } from '@/data/mock-portfolio';
import { TimeFrame, AssetAllocation, Stock } from '@/types/portfolio';

export default function PortfolioScreen() {
  const [selectedLeagueId, setSelectedLeagueId] = useState(MOCK_LEAGUES[0].id);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  const [portfolios, setPortfolios] = useState(MOCK_PORTFOLIOS);

  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const currentPortfolio = portfolios[selectedLeagueId];
  const currentLeague = MOCK_LEAGUES.find((league) => league.id === selectedLeagueId);

  const handleAllocate = (asset: keyof AssetAllocation, amount: number) => {
    setPortfolios((prev) => ({
      ...prev,
      [selectedLeagueId]: {
        ...prev[selectedLeagueId],
        liquidFunds: prev[selectedLeagueId].liquidFunds - amount,
        allocation: {
          ...prev[selectedLeagueId].allocation,
          [asset]: prev[selectedLeagueId].allocation[asset] + amount,
        },
        totalValue: prev[selectedLeagueId].totalValue + amount,
      },
    }));
  };

  const handleBuyStock = (stock: Stock, shares: number) => {
    const totalCost = stock.currentPrice * shares;
    setPortfolios((prev) => {
      const existingHolding = prev[selectedLeagueId].holdings.find(
        (h) => h.symbol === stock.symbol
      );

      let updatedHoldings;
      if (existingHolding) {
        const totalShares = existingHolding.shares + shares;
        const newAveragePrice =
          (existingHolding.averagePrice * existingHolding.shares + totalCost) / totalShares;

        updatedHoldings = prev[selectedLeagueId].holdings.map((h) =>
          h.symbol === stock.symbol
            ? {
                ...h,
                shares: totalShares,
                averagePrice: newAveragePrice,
                totalValue: stock.currentPrice * totalShares,
                changePercent: ((stock.currentPrice - newAveragePrice) / newAveragePrice) * 100,
              }
            : h
        );
      } else {
        updatedHoldings = [
          ...prev[selectedLeagueId].holdings,
          {
            symbol: stock.symbol,
            name: stock.name,
            shares,
            averagePrice: stock.currentPrice,
            currentPrice: stock.currentPrice,
            totalValue: totalCost,
            changePercent: 0,
          },
        ];
      }

      return {
        ...prev,
        [selectedLeagueId]: {
          ...prev[selectedLeagueId],
          lessonRewards: prev[selectedLeagueId].lessonRewards - totalCost,
          holdings: updatedHoldings,
          totalValue: prev[selectedLeagueId].totalValue + totalCost,
        },
      };
    });
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

        {/* Time Frame Selector */}
        <View style={styles.timeFrameContainer}>
          {(['1D', '1W', '1M'] as TimeFrame[]).map((tf) => (
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
        </View>

        {/* Performance Chart */}
        <View style={[styles.chartCard, { backgroundColor: cardBackground }]}>
          <PerformanceChart
            portfolioHistory={currentPortfolio.history}
            sp500History={MOCK_SP500.history}
            timeFrame={timeFrame}
          />
        </View>

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
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timeFrameButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
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
