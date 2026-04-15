import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PortfolioSnapshot, TimeFrame } from '@/types/portfolio';
import { fixedLightPalette, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';

const c = fixedLightPalette;

interface PerformanceChartProps {
  portfolioHistory: PortfolioSnapshot[];
  sp500History: PortfolioSnapshot[];
  timeFrame: TimeFrame;
}

const filterDataByTimeFrame = (data: PortfolioSnapshot[], timeFrame: TimeFrame): PortfolioSnapshot[] => {
  if (data.length === 0) return [];

  const now = Date.now();

  if (timeFrame === 'ALL') {
    return data;
  }

  if (timeFrame === 'YTD') {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1).getTime();
    const filtered = data.filter((point) => point.timestamp >= yearStart);

    // If filter removed all points or left only 1, include the point just before the cutoff
    if (filtered.length < 2 && data.length >= 2) {
      const beforeCutoff = data.filter(p => p.timestamp < yearStart);
      if (beforeCutoff.length > 0) {
        return [beforeCutoff[beforeCutoff.length - 1], ...filtered];
      }
    }

    return filtered.length > 0 ? filtered : data;
  }

  const cutoff = {
    '1D': now - 24 * 60 * 60 * 1000,
    '1W': now - 7 * 24 * 60 * 60 * 1000,
    '1M': now - 30 * 24 * 60 * 60 * 1000,
    '3M': now - 90 * 24 * 60 * 60 * 1000,
    '1Y': now - 365 * 24 * 60 * 60 * 1000,
    '5Y': now - 5 * 365 * 24 * 60 * 60 * 1000,
  }[timeFrame];

  const filtered = data.filter((point) => point.timestamp >= cutoff!);

  // If filter removed all points or left only 1, include the point just before the cutoff
  // This ensures we always have at least 2 points to show percentage change
  if (filtered.length < 2 && data.length >= 2) {
    const beforeCutoff = data.filter(p => p.timestamp < cutoff!);
    if (beforeCutoff.length > 0) {
      // Add the most recent point before the cutoff as the baseline
      return [beforeCutoff[beforeCutoff.length - 1], ...filtered];
    }
  }

  // If we still have less than 2 points, return all data we have
  return filtered.length > 0 ? filtered : data;
};

const normalizeData = (data: PortfolioSnapshot[]): PortfolioSnapshot[] => {
  if (data.length === 0) return [];
  const baseValue = Number(data[0].value);
  if (!Number.isFinite(baseValue) || baseValue === 0) return data.map((p) => ({ ...p, value: 0 }));
  return data.map((point) => {
    const v = Number(point.value);
    const normalized = Number.isFinite(v) ? ((v - baseValue) / baseValue) * 100 : 0;
    return { timestamp: point.timestamp, value: normalized };
  });
};

const sampleData = (data: PortfolioSnapshot[], maxPoints: number = 10): PortfolioSnapshot[] => {
  if (data.length <= maxPoints) return data;

  const interval = Math.ceil(data.length / maxPoints);
  const sampled: PortfolioSnapshot[] = [];

  for (let i = 0; i < data.length; i += interval) {
    sampled.push(data[i]);
  }

  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
};

export function PerformanceChart({ portfolioHistory, sp500History, timeFrame }: PerformanceChartProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const chartLabelColor = c.text;
  const chartBg = c.surfaceContainerLowest;
  const styles = createStyles();

  const chartData = useMemo(() => {
    const filteredPortfolio = filterDataByTimeFrame(portfolioHistory, timeFrame);
    const filteredSP500 = filterDataByTimeFrame(sp500History, timeFrame);

    const maxPoints = 10; // Limit to 10 points for better mobile performance
    const sampledPortfolio = sampleData(filteredPortfolio, maxPoints);
    const sampledSP500 = sampleData(filteredSP500, maxPoints);

    const normalizedPortfolio = normalizeData(sampledPortfolio);
    const normalizedSP500 = normalizeData(sampledSP500);

    const labels = sampledPortfolio.map((point) => {
      const date = new Date(point.timestamp);
      if (timeFrame === '1D') {
        return date.toLocaleTimeString('en-US', { hour: 'numeric' });
      } else if (timeFrame === '1W' || timeFrame === '1M') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
    });

    const safeNum = (v: number) => (Number.isFinite(v) ? v : 0);
    return {
      labels,
      datasets: [
        {
          data: normalizedPortfolio.length > 0 ? normalizedPortfolio.map(p => safeNum(p.value)) : [0],
          color: () => primaryColor,
          strokeWidth: 3,
        },
        {
          data: normalizedSP500.length > 0 ? normalizedSP500.map(p => safeNum(p.value)) : [0],
          color: () => c.onSurfaceVariant,
          strokeWidth: 2,
        },
      ],
    };
  }, [portfolioHistory, sp500History, timeFrame, primaryColor]);

  const performanceChange = useMemo(() => {
    const filteredPortfolio = filterDataByTimeFrame(portfolioHistory, timeFrame);
    const filteredSP500 = filterDataByTimeFrame(sp500History, timeFrame);

    if (filteredPortfolio.length === 0 || filteredSP500.length === 0) {
      return { portfolio: 0, sp500: 0 };
    }

    const p0 = Number(filteredPortfolio[0].value);
    const pLast = Number(filteredPortfolio[filteredPortfolio.length - 1].value);
    const s0 = Number(filteredSP500[0].value);
    const sLast = Number(filteredSP500[filteredSP500.length - 1].value);

    const portfolioChange = Number.isFinite(p0) && p0 !== 0 ? ((pLast - p0) / p0) * 100 : 0;
    const sp500Change = Number.isFinite(s0) && s0 !== 0 ? ((sLast - s0) / s0) * 100 : 0;

    return {
      portfolio: Number.isFinite(portfolioChange) ? portfolioChange : 0,
      sp500: Number.isFinite(sp500Change) ? sp500Change : 0,
    };
  }, [portfolioHistory, sp500History, timeFrame]);

  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            <ThemedText style={styles.performanceLabel}>Your Portfolio</ThemedText>
            <ThemedText
              style={[
                styles.performanceValue,
                { color: performanceChange.portfolio >= 0 ? c.success : c.danger },
              ]}
            >
              {performanceChange.portfolio >= 0 ? '+' : ''}
              {performanceChange.portfolio.toFixed(2)}%
            </ThemedText>
          </View>
          <View style={styles.performanceItem}>
            <ThemedText style={styles.performanceLabel}>S&P 500</ThemedText>
            <ThemedText
              style={[
                styles.performanceValue,
                { color: performanceChange.sp500 >= 0 ? c.success : c.danger },
              ]}
            >
              {performanceChange.sp500 >= 0 ? '+' : ''}
              {performanceChange.sp500.toFixed(2)}%
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: chartBg,
            backgroundGradientFrom: chartBg,
            backgroundGradientTo: chartBg,
            decimalPlaces: 1,
            color: () => chartLabelColor,
            labelColor: () => chartLabelColor,
            style: {
              borderRadius: Radii.md,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: c.surfaceContainerHigh,
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={false}
          withShadow={false}
          fromZero={false}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: primaryColor }]} />
          <ThemedText style={styles.legendText}>Your Portfolio</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: c.onSurfaceVariant }]} />
          <ThemedText style={styles.legendText}>S&P 500</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const createStyles = () => StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  header: {
    marginBottom: Spacing.md,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  performanceValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    lineHeight: 28,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  chart: {
    borderRadius: Radii.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: Radii.full,
  },
  legendText: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
  },
});
