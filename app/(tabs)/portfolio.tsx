import { useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLessons, PORTFOLIO_BASE } from '@/hooks/use-lessons';

// Fixed percentage allocations — dollar amounts are derived from portfolioBalance.
const HOLDING_ALLOCATIONS = [
  {
    name: 'S&P 500 Index Fund',
    ticker: 'VOO',
    type: 'Index Fund',
    pct: 26.5,
    change: 8.2,
    colorKey: 'primary' as const,
  },
  {
    name: 'Tech Growth Stocks',
    ticker: 'Portfolio',
    type: 'Stocks',
    pct: 18.3,
    change: 12.5,
    colorKey: 'primaryLight' as const,
  },
  {
    name: 'Total Stock Market',
    ticker: 'VTI',
    type: 'Index Fund',
    pct: 16.6,
    change: 5.1,
    color: '#10B981',
  },
  {
    name: 'High-Yield Savings',
    ticker: 'HYSA',
    type: 'Savings',
    pct: 20.4,
    change: 4.5,
    color: '#6366F1',
  },
  {
    name: 'Emerging Markets',
    ticker: 'VWO',
    type: 'Index Fund',
    pct: 10.2,
    change: -2.3,
    color: '#F59E0B',
  },
  {
    name: 'Bond Index Fund',
    ticker: 'BND',
    type: 'Bonds',
    pct: 8.1,
    change: 1.8,
    color: '#8B5CF6',
  },
] as const;

export default function PortfolioScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const primaryColor = useThemeColor({}, 'primary' as any);
  const successColor = useThemeColor({}, 'success' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const { portfolioBalance, reload } = useLessons();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const earned = portfolioBalance - PORTFOLIO_BASE;

  // Resolve color and compute dollar amount for each holding
  const holdings = HOLDING_ALLOCATIONS.map((h) => ({
    ...h,
    amount: Math.round(portfolioBalance * (h.pct / 100)),
    color: 'colorKey' in h ? (colors[h.colorKey] as string) : h.color,
  }));

  // Summarise allocations by asset type
  const allocationByType = holdings.reduce<Record<string, { pct: number; color: string }>>(
    (acc, h) => {
      if (!acc[h.type]) acc[h.type] = { pct: 0, color: h.color };
      acc[h.type].pct += h.pct;
      return acc;
    },
    {}
  );
  const allocationSummary = Object.entries(allocationByType).sort((a, b) => b[1].pct - a[1].pct);

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
            Portfolio
          </ThemedText>
        </View>

        {/* Total Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: primaryColor }]}>
          <ThemedText style={styles.balanceLabel}>Total Portfolio Value</ThemedText>
          <ThemedText style={styles.balanceAmount}>${portfolioBalance.toLocaleString()}</ThemedText>
          <View style={styles.balanceChange}>
            {earned > 0 ? (
              <>
                <ThemedText style={styles.changeText}>
                  +${earned.toLocaleString()} ({((earned / PORTFOLIO_BASE) * 100).toFixed(1)}%)
                </ThemedText>
                <ThemedText style={styles.changeLabel}>Earned from lessons</ThemedText>
              </>
            ) : (
              <ThemedText style={styles.changeLabel}>
                Complete lessons to grow your portfolio
              </ThemedText>
            )}
          </View>

          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Starting Balance</ThemedText>
              <ThemedText style={styles.statValue}>${PORTFOLIO_BASE.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Earned from Lessons</ThemedText>
              <ThemedText style={styles.statValue}>
                {earned > 0 ? `+$${earned.toLocaleString()}` : '$0'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Asset Allocation */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Asset Allocation
          </ThemedText>

          {/* Stacked bar */}
          <View style={styles.pieChart}>
            <View style={styles.pieRow}>
              {holdings.map((h, i) => (
                <View
                  key={i}
                  style={[styles.pieSegment, { width: `${h.pct}%`, backgroundColor: h.color }]}
                />
              ))}
            </View>
          </View>

          {/* Summary by type */}
          <View style={styles.allocationSummary}>
            {allocationSummary.map(([type, { pct, color }]) => (
              <View key={type} style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: color }]} />
                <ThemedText style={styles.summaryLabel}>{type}</ThemedText>
                <ThemedText style={styles.summaryValue}>{pct.toFixed(1)}%</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Holdings List */}
        <View style={styles.holdingsSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Your Holdings
          </ThemedText>

          {holdings.map((holding, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.holdingCard, { backgroundColor: cardBg, borderColor }]}
            >
              <View style={[styles.holdingIcon, { backgroundColor: holding.color + '20' }]}>
                <View style={[styles.holdingIconDot, { backgroundColor: holding.color }]} />
              </View>

              <View style={styles.holdingInfo}>
                <ThemedText style={styles.holdingName}>{holding.name}</ThemedText>
                <View style={styles.holdingMeta}>
                  <ThemedText style={styles.holdingTicker}>{holding.ticker}</ThemedText>
                  <ThemedText style={styles.holdingDot}>•</ThemedText>
                  <ThemedText style={styles.holdingType}>{holding.type}</ThemedText>
                </View>
              </View>

              <View style={styles.holdingValues}>
                <ThemedText style={styles.holdingAmount}>
                  ${holding.amount.toLocaleString()}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.holdingChange,
                    { color: holding.change >= 0 ? successColor : colors.danger },
                  ]}
                >
                  {holding.change >= 0 ? '+' : ''}
                  {holding.change}%
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.primaryButtonText}>Allocate Funds</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor }]}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>
              Rebalance Portfolio
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Next Time Tick Info */}
        <View style={[styles.timeTickInfo, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.timeTickHeader}>
            <ThemedText type="defaultSemiBold" style={styles.timeTickTitle}>
              ⏰ Next Quarter Update
            </ThemedText>
            <ThemedText style={styles.timeTickTime}>2d 14h</ThemedText>
          </View>
          <ThemedText style={styles.timeTickDescription}>
            Your portfolio will be updated based on 3 months of simulated market performance.
            Make any adjustments now!
          </ThemedText>
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
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceChange: {
    marginBottom: 20,
  },
  changeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  changeLabel: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 13,
  },
  balanceStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  statLabel: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  pieChart: {
    marginBottom: 20,
  },
  pieRow: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pieSegment: {
    height: '100%',
  },
  allocationSummary: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  holdingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  holdingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  holdingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdingIconDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  holdingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  holdingTicker: {
    fontSize: 13,
    opacity: 0.6,
  },
  holdingDot: {
    opacity: 0.4,
    fontSize: 12,
  },
  holdingType: {
    fontSize: 13,
    opacity: 0.6,
  },
  holdingValues: {
    alignItems: 'flex-end',
  },
  holdingAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  holdingChange: {
    fontSize: 14,
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
  timeTickInfo: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  timeTickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeTickTitle: {
    fontSize: 16,
  },
  timeTickTime: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  timeTickDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  bottomPadding: {
    height: 20,
  },
});
