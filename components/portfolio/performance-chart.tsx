import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const cutoff = {
    '1D': now - 24 * 60 * 60 * 1000,
    '1W': now - 7 * 24 * 60 * 60 * 1000,
    '1M': now - 30 * 24 * 60 * 60 * 1000,
  }[timeFrame];

  return data.filter((point) => point.timestamp >= cutoff);
};

const normalizeData = (data: PortfolioSnapshot[]): PortfolioSnapshot[] => {
  if (data.length === 0) return [];
  const baseValue = data[0].value;
  return data.map((point) => ({
    timestamp: point.timestamp,
    value: ((point.value - baseValue) / baseValue) * 100, // Convert to percentage change
  }));
};

export function PerformanceChart({ portfolioHistory, sp500History, timeFrame }: PerformanceChartProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const chartData = useMemo(() => {
    const filteredPortfolio = filterDataByTimeFrame(portfolioHistory, timeFrame);
    const filteredSP500 = filterDataByTimeFrame(sp500History, timeFrame);

    const normalizedPortfolio = normalizeData(filteredPortfolio);
    const normalizedSP500 = normalizeData(filteredSP500);

    // Combine both datasets
    return normalizedPortfolio.map((point, index) => ({
      timestamp: point.timestamp,
      portfolio: point.value,
      sp500: normalizedSP500[index]?.value || 0,
      date: new Date(point.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [portfolioHistory, sp500History, timeFrame]);

  const performanceChange = useMemo(() => {
    if (chartData.length === 0) return { portfolio: 0, sp500: 0 };
    const lastPoint = chartData[chartData.length - 1];
    return {
      portfolio: lastPoint.portfolio,
      sp500: lastPoint.sp500,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <ThemedView
          style={[
            styles.tooltip,
            { backgroundColor, borderColor, shadowColor: textColor },
          ]}
        >
          <ThemedText style={styles.tooltipLabel}>{payload[0].payload.date}</ThemedText>
          <ThemedText style={[styles.tooltipValue, { color: primaryColor }]}>
            Portfolio: {payload[0].value.toFixed(2)}%
          </ThemedText>
          <ThemedText style={[styles.tooltipValue, { color: '#888' }]}>
            S&P 500: {payload[1].value.toFixed(2)}%
          </ThemedText>
        </ThemedView>
      );
    }
    return null;
  };

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
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis
              dataKey="date"
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 10 }}
              tickLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="portfolio"
              stroke={primaryColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="sp500"
              stroke="#888"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: primaryColor }]} />
          <ThemedText style={styles.legendText}>Your Portfolio</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotDashed, { borderColor: '#888' }]} />
          <ThemedText style={styles.legendText}>S&P 500 Baseline</ThemedText>
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
    height: 250,
    marginVertical: 8,
  },
  tooltip: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: '600',
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
  legendDotDashed: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 12,
    opacity: 0.8,
  },
});
