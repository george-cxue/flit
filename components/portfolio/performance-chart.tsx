import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PortfolioSnapshot, TimeFrame } from '@/types/portfolio';

interface PerformanceChartProps {
  portfolioHistory: PortfolioSnapshot[];
  sp500History: PortfolioSnapshot[];
  timeFrame: TimeFrame;
}

const filterDataByTimeFrame = (data: PortfolioSnapshot[], timeFrame: TimeFrame): PortfolioSnapshot[] => {
  const now = Date.now();

  if (timeFrame === 'ALL') {
    return data;
  }

  if (timeFrame === 'YTD') {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1).getTime();
    return data.filter((point) => point.timestamp >= yearStart);
  }

  const cutoff = {
    '1D': now - 24 * 60 * 60 * 1000,
    '1W': now - 7 * 24 * 60 * 60 * 1000,
    '1M': now - 30 * 24 * 60 * 60 * 1000,
    '3M': now - 90 * 24 * 60 * 60 * 1000,
    '1Y': now - 365 * 24 * 60 * 60 * 1000,
    '5Y': now - 5 * 365 * 24 * 60 * 60 * 1000,
  }[timeFrame];

  return data.filter((point) => point.timestamp >= cutoff!);
};

const normalizeData = (data: PortfolioSnapshot[]): PortfolioSnapshot[] => {
  if (data.length === 0) return [];
  const baseValue = data[0].value;
  return data.map((point) => ({
    timestamp: point.timestamp,
    value: ((point.value - baseValue) / baseValue) * 100,
  }));
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
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

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

    return {
      labels,
      datasets: [
        {
          data: normalizedPortfolio.map(p => p.value),
          color: () => primaryColor,
          strokeWidth: 3,
        },
        {
          data: normalizedSP500.map(p => p.value),
          color: () => '#888',
          strokeWidth: 2,
        },
      ],
      legend: ['Portfolio', 'S&P 500'],
    };
  }, [portfolioHistory, sp500History, timeFrame, primaryColor]);

  const performanceChange = useMemo(() => {
    const filteredPortfolio = filterDataByTimeFrame(portfolioHistory, timeFrame);
    const filteredSP500 = filterDataByTimeFrame(sp500History, timeFrame);

    if (filteredPortfolio.length === 0 || filteredSP500.length === 0) {
      return { portfolio: 0, sp500: 0 };
    }

    const portfolioChange = ((filteredPortfolio[filteredPortfolio.length - 1].value - filteredPortfolio[0].value) / filteredPortfolio[0].value) * 100;
    const sp500Change = ((filteredSP500[filteredSP500.length - 1].value - filteredSP500[0].value) / filteredSP500[0].value) * 100;

    return {
      portfolio: portfolioChange,
      sp500: sp500Change,
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
                { color: performanceChange.portfolio >= 0 ? '#10b981' : '#ef4444' },
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
                { color: performanceChange.sp500 >= 0 ? '#10b981' : '#ef4444' },
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
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            decimalPlaces: 1,
            color: () => textColor,
            labelColor: () => textColor,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: borderColor,
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
          <View style={[styles.legendDot, { backgroundColor: '#888' }]} />
          <ThemedText style={styles.legendText}>S&P 500</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    marginBottom: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.8,
  },
});
