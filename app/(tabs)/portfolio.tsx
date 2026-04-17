import React, { useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Typography, Radii, Spacing, AmbientShadow, SubtleShadow } from '@/constants/theme';
import { PerformanceChart } from '@/components/portfolio/performance-chart';
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
import { useThemeMode } from '@/contexts/theme-context';
import { TopBar } from '@/components/top-bar';
import { AppLoadingScreen } from '@/components/app-loading-screen';

export default function PortfolioScreen() {
  const { leagueId: paramLeagueId } = useLocalSearchParams();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const handledRouteLeagueIdRef = React.useRef<string | null>(null);
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuthContext();
  const { themeMode } = useThemeMode();

  const {
    portfolios,
    selectedLeagueId,
    setSelectedLeagueId,
    timeFrame,
    setTimeFrame,
    allocateFunds,
    buyStock,
    sellStock,
    loading,
    refreshPortfolios,
  } = usePortfolio();

  const fetchGroups = useCallback(async () => {
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
  }, [authLoaded, isSignedIn, userId]);

  useFocusEffect(
    useCallback(() => {
      refreshPortfolios();
      fetchGroups();
    }, [refreshPortfolios, fetchGroups])
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (!paramLeagueId || typeof paramLeagueId !== 'string') {
      return;
    }
    if (handledRouteLeagueIdRef.current === paramLeagueId) {
      return;
    }
    handledRouteLeagueIdRef.current = paramLeagueId;
    if (selectedLeagueId !== paramLeagueId) {
      setSelectedLeagueId(paramLeagueId);
    }
    // Pull fresh data once for this route param.
    refreshPortfolios();
  }, [paramLeagueId, selectedLeagueId, setSelectedLeagueId, refreshPortfolios]);

  const isGroupActive = useCallback((group: Group) => {
    const startDateRaw = group.settings?.startDate;
    if (!startDateRaw) {
      return true;
    }
    const parsed = new Date(startDateRaw);
    if (Number.isNaN(parsed.getTime())) {
      return true;
    }
    return new Date() >= parsed;
  }, []);

  const activeGroups = React.useMemo(() => groups.filter(isGroupActive), [groups, isGroupActive]);
  const activeSelectedLeagueId = activeGroups.some((group) => group.id === selectedLeagueId)
    ? selectedLeagueId
    : activeGroups[0]?.id ?? '';

  const c = themeMode === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(c);
  const currentPortfolio = activeSelectedLeagueId ? portfolios[activeSelectedLeagueId] ?? null : null;
  const selectedGroup = activeGroups.find((group) => group.id === activeSelectedLeagueId);
  const enabledClasses = selectedGroup?.settings?.enabledAssetClasses ?? [];
  const selectedGroupStartDate = selectedGroup?.settings?.startDate ? new Date(selectedGroup.settings.startDate) : null;
  const isValidStartDate = !!selectedGroupStartDate && !Number.isNaN(selectedGroupStartDate.getTime());
  const competitionStarted = !isValidStartDate || new Date() >= (selectedGroupStartDate as Date);
  const hasModernAllocationClasses = enabledClasses.some(
    (assetClass) => assetClass === 'Savings Account' || assetClass === 'Bonds' || assetClass === 'Index Funds'
  );
  const stockEnabled = enabledClasses.length === 0 || enabledClasses.includes('Stock');
  const savingsEnabled =
    enabledClasses.length === 0 || (hasModernAllocationClasses ? enabledClasses.includes('Savings Account') : true);
  const bondsEnabled =
    enabledClasses.length === 0 || (hasModernAllocationClasses ? enabledClasses.includes('Bonds') : true);
  const indexFundsEnabled =
    enabledClasses.length === 0 || (hasModernAllocationClasses ? enabledClasses.includes('Index Funds') : true);
  const hasAnyAlternativeAssetEnabled = savingsEnabled || bondsEnabled || indexFundsEnabled;

  if (loading) {
    return <AppLoadingScreen message="Loading portfolios..." />;
  }

  if (activeGroups.length === 0) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }]}>
        <ThemedText type="body-lg" style={{ textAlign: 'center', marginBottom: Spacing.md }}>
          No active competitions yet.
        </ThemedText>
        <ThemedText type="body-md" style={{ textAlign: 'center', color: c.onSurfaceVariant }}>
          You can still view pending groups in the Groups tab.
        </ThemedText>
      </ThemedView>
    );
  }

  if (!selectedGroup) {
    return <AppLoadingScreen message="Loading active competition..." />;
  }

  if (!currentPortfolio) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }]}>
        <ThemedText type="body-lg" style={{ textAlign: 'center', marginBottom: Spacing.md }}>
          No active portfolio found.
        </ThemedText>
      </ThemedView>
    );
  }

  const holdingsValue = currentPortfolio.holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
  const otherAssetsValue =
    currentPortfolio.allocation.savings +
    currentPortfolio.allocation.bonds +
    currentPortfolio.allocation.indexFunds;
  const computedTotalValue = currentPortfolio.liquidFunds + holdingsValue + otherAssetsValue;

  const handleAllocate = async (asset: keyof AssetAllocation, amount: number) => {
    await allocateFunds(activeSelectedLeagueId, asset, amount);
  };

  const handleBuyStock = async (stock: Stock, shares: number) => {
    await buyStock(activeSelectedLeagueId, stock, shares);
  };

  const handleSellStock = async (symbol: string, shares: number) => {
    await sellStock(activeSelectedLeagueId, symbol, shares);
  };

  return (
    <ThemedView style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
        {/* Group Selector */}
        <View style={[styles.leagueSelector, { backgroundColor: c.surfaceContainerLowest }]}>
          <ThemedText type="label-lg" style={styles.sectionLabel}>Group</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueTabs}>
            {activeGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.leagueTab,
                  {
                    backgroundColor: activeSelectedLeagueId === group.id ? c.primary : c.surfaceContainerLow,
                  },
                ]}
                onPress={() => {
                  if (group.id !== activeSelectedLeagueId) {
                    setSelectedLeagueId(group.id);
                  }
                }}
              >
                <ThemedText
                  type="label-lg"
                  style={[
                    styles.leagueTabText,
                    activeSelectedLeagueId === group.id && styles.leagueTabTextActive,
                  ]}
                >
                  {group.name}
                </ThemedText>
                <ThemedText
                  type="label-md"
                  style={[
                    styles.leagueMemberCount,
                    activeSelectedLeagueId === group.id && styles.leagueMemberCountActive,
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
            ${computedTotalValue.toFixed(2)}
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
                ${holdingsValue.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText type="label-md" style={styles.balanceLabel}>Other</ThemedText>
              <ThemedText type="title-md" style={styles.balanceValue}>
                ${otherAssetsValue.toFixed(2)}
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
            currentPortfolioValue={computedTotalValue}
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

        {!competitionStarted && isValidStartDate ? (
          <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest, padding: Spacing.md }]}>
            <ThemedText type="label-lg" style={{ color: c.warning, marginBottom: Spacing.xs }}>
              Competition has not started yet
            </ThemedText>
            <ThemedText type="body-md" style={{ color: c.onSurfaceVariant }}>
              Trading is locked until {selectedGroupStartDate?.toLocaleDateString()}.
            </ThemedText>
          </View>
        ) : null}

        {/* Stock Search */}
        {stockEnabled && competitionStarted ? (
          <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest }]}>
            <StockSearch
              groupId={activeSelectedLeagueId}
              liquidFunds={currentPortfolio.liquidFunds}
              onBuyStock={handleBuyStock}
            />
          </View>
        ) : null}

        {/* Holdings List */}
        {stockEnabled ? (
          <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest, paddingHorizontal: 16 }]}>
            <HoldingsList holdings={currentPortfolio.holdings} onSellStock={competitionStarted ? handleSellStock : undefined} />
          </View>
        ) : null}

        {/* Other Assets */}
        {hasAnyAlternativeAssetEnabled && competitionStarted ? (
          <View style={[styles.section, { backgroundColor: c.surfaceContainerLowest, paddingHorizontal: 16 }]}>
            <AssetAllocationManager
              allocation={currentPortfolio.allocation}
              cashBalance={currentPortfolio.liquidFunds}
              bondsLockedUntil={currentPortfolio.bondsLockedUntil}
              enabledAssets={{
                savings: savingsEnabled,
                bonds: bondsEnabled,
                indexFunds: indexFundsEnabled,
              }}
              onAllocate={handleAllocate}
            />
          </View>
        ) : null}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: Spacing.md },

  leagueSelector: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    ...SubtleShadow,
  },
  sectionLabel: {
    color: c.onSurfaceVariant,
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
    color: c.onSurface,
  },
  leagueTabTextActive: { color: '#fff' },
  leagueMemberCount: {
    color: c.onSurfaceVariant,
  },
  leagueMemberCountActive: { color: '#fff', opacity: 0.8 },

  valueCard: {
    padding: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  valueLabel: {
    color: c.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  valueAmount: {
    lineHeight: 44,
    paddingTop: Platform.OS !== 'web' ? 4 : 0,
    fontSize: 36,
    fontFamily: Typography['display-md'].fontFamily,
    color: c.onSurface,
    marginBottom: Spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: 12,
  },
  balanceItem: { alignItems: 'center', flex: 1 },
  balanceLabel: {
    color: c.onSurfaceVariant,
    marginBottom: 4,
  },
  balanceValue: {},
  balanceNote: {
    color: c.onSurfaceVariant,
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
  timeFrameText: { color: c.onSurface },
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
