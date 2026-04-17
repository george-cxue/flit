import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useThemeMode } from '@/contexts/theme-context';
import { PortfolioSnapshot, TimeFrame } from '@/types/portfolio';
import { Colors, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';

interface PerformanceChartProps {
  portfolioHistory: PortfolioSnapshot[];
  sp500History: PortfolioSnapshot[];
  timeFrame: TimeFrame;
  currentPortfolioValue?: number;
}

const filterDataByTimeFrame = (data: PortfolioSnapshot[], timeFrame: TimeFrame): PortfolioSnapshot[] => {
  if (data.length === 0) return [];

  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
  const now = Date.now();

  if (timeFrame === 'ALL') {
    return sorted;
  }

  const cutoffFor = (tf: TimeFrame): number => {
    if (tf === 'YTD') {
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, 0, 1).getTime();
    }
    const cutoff = {
      '1D': now - 24 * 60 * 60 * 1000,
      '1W': now - 7 * 24 * 60 * 60 * 1000,
      '1M': now - 30 * 24 * 60 * 60 * 1000,
      '3M': now - 90 * 24 * 60 * 60 * 1000,
      '1Y': now - 365 * 24 * 60 * 60 * 1000,
      '5Y': now - 5 * 365 * 24 * 60 * 60 * 1000,
      'ALL': 0,
    }[tf];
    return cutoff ?? 0;
  };

  const cutoff = cutoffFor(timeFrame);
  const beforeCutoff = sorted.filter((point) => point.timestamp < cutoff).at(-1);
  const inWindow = sorted.filter((point) => point.timestamp >= cutoff);

  // Anchor the chart/performance to this exact window like trading apps:
  // include one baseline point before cutoff (if available) for continuity,
  // then only data inside the selected window.
  if (inWindow.length > 0) {
    return beforeCutoff ? [beforeCutoff, ...inWindow] : inWindow;
  }

  // No points inside this time window; keep at most one anchor point
  // so percent change resolves to 0 instead of falling back to all-time.
  return beforeCutoff ? [beforeCutoff] : sorted.slice(-1);
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

const sortByTimestamp = (data: PortfolioSnapshot[]): PortfolioSnapshot[] =>
  [...data].sort((a, b) => a.timestamp - b.timestamp);

const getStepType = (timeFrame: TimeFrame): 'hour' | 'day' | 'month' => {
  if (timeFrame === '1D') return 'hour';
  if (timeFrame === '1W' || timeFrame === '1M' || timeFrame === '3M' || timeFrame === 'YTD') return 'day';
  return 'month';
};

const incrementDate = (date: Date, step: 'hour' | 'day' | 'month') => {
  if (step === 'hour') date.setHours(date.getHours() + 1);
  else if (step === 'day') date.setDate(date.getDate() + 1);
  else date.setMonth(date.getMonth() + 1);
};

const generateTimeline = (startTs: number, endTs: number, timeFrame: TimeFrame): number[] => {
  if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs < startTs) return [];

  const step = getStepType(timeFrame);
  const cursor = new Date(startTs);
  const end = new Date(endTs);
  const timeline: number[] = [];

  while (cursor.getTime() <= end.getTime()) {
    timeline.push(cursor.getTime());
    incrementDate(cursor, step);
  }

  if (timeline.length === 0 || timeline[timeline.length - 1] < endTs) {
    timeline.push(endTs);
  }

  return timeline;
};

const resampleToTimeline = (data: PortfolioSnapshot[], timeline: number[]): PortfolioSnapshot[] => {
  if (timeline.length === 0) return [];
  if (data.length === 0) return timeline.map((timestamp) => ({ timestamp, value: 0 }));

  const sorted = sortByTimestamp(data);
  let idx = 0;

  return timeline.map((timestamp) => {
    while (idx < sorted.length - 1 && sorted[idx + 1].timestamp <= timestamp) {
      idx += 1;
    }
    const point = sorted[idx] ?? sorted[0];
    return {
      timestamp,
      value: Number.isFinite(Number(point.value)) ? Number(point.value) : 0,
    };
  });
};

const sanitizeSeries = (data: PortfolioSnapshot[]): PortfolioSnapshot[] => {
  const sorted = sortByTimestamp(data);
  let lastKnown = 0;

  return sorted.map((point) => {
    const raw = Number(point.value);
    const isValid = Number.isFinite(raw) && raw > 0;
    const value = isValid ? raw : lastKnown > 0 ? lastKnown : 0;
    if (value > 0) {
      lastKnown = value;
    }
    return { timestamp: point.timestamp, value };
  });
};

const getLatestKnownValue = (data: PortfolioSnapshot[], fallback = 0): number => {
  for (let i = data.length - 1; i >= 0; i -= 1) {
    const v = Number(data[i].value);
    if (Number.isFinite(v) && v > 0) return v;
  }
  return fallback;
};

const getFirstKnownValue = (data: PortfolioSnapshot[], fallback = 0): number => {
  for (let i = 0; i < data.length; i += 1) {
    const v = Number(data[i].value);
    if (Number.isFinite(v) && v > 0) return v;
  }
  return fallback;
};

const applyCurrentValueToSeries = (
  data: PortfolioSnapshot[],
  currentValue: number
): PortfolioSnapshot[] => {
  if (!Number.isFinite(currentValue) || currentValue <= 0) {
    return data;
  }

  const sorted = sortByTimestamp(data);
  const now = Date.now();
  if (sorted.length === 0) {
    return [{ timestamp: now, value: currentValue }];
  }

  const last = sorted[sorted.length - 1];
  // If the latest point is fresh, overwrite it; otherwise append "now".
  if (now - last.timestamp <= 5 * 60 * 1000) {
    return [...sorted.slice(0, -1), { timestamp: now, value: currentValue }];
  }

  return [...sorted, { timestamp: now, value: currentValue }];
};


export function PerformanceChart({
  portfolioHistory,
  sp500History,
  timeFrame,
  currentPortfolioValue = 0,
}: PerformanceChartProps) {
  const { themeMode } = useThemeMode();
  const c = themeMode === 'dark' ? Colors.dark : Colors.light;
  const primaryColor = useThemeColor({}, 'tint');
  const chartLabelColor = c.text;
  const chartBg = c.surfaceContainerLowest;
  const styles = createStyles(c);

  const chartData = useMemo(() => {
    const filteredPortfolio = applyCurrentValueToSeries(
      sanitizeSeries(filterDataByTimeFrame(portfolioHistory, timeFrame)),
      currentPortfolioValue
    );
    const filteredSP500 = sanitizeSeries(filterDataByTimeFrame(sp500History, timeFrame));

    const firstTimestamp = filteredPortfolio[0]?.timestamp ?? filteredSP500[0]?.timestamp;
    const lastTimestamp =
      filteredPortfolio[filteredPortfolio.length - 1]?.timestamp ??
      filteredSP500[filteredSP500.length - 1]?.timestamp;

    if (!Number.isFinite(firstTimestamp) || !Number.isFinite(lastTimestamp)) {
      return {
        labels: [''],
        datasets: [
          { data: [0], color: () => primaryColor, strokeWidth: 3 },
          { data: [0], color: () => c.onSurfaceVariant, strokeWidth: 2 },
        ],
      };
    }

    const timeline = generateTimeline(firstTimestamp, lastTimestamp, timeFrame);
    const timelinePortfolio = resampleToTimeline(filteredPortfolio, timeline);
    const timelineSP500 = resampleToTimeline(filteredSP500, timeline);

    const normalizedPortfolio = normalizeData(timelinePortfolio);
    const normalizedSP500 = normalizeData(timelineSP500);

    const labels = timeline.map((timestamp) => {
      const date = new Date(timestamp);
      if (timeFrame === '1D') {
        return date.toLocaleTimeString('en-US', { hour: 'numeric' });
      } else if (timeFrame === '1W' || timeFrame === '1M' || timeFrame === '3M' || timeFrame === 'YTD') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
    });
    const targetLabelCount = timeFrame === '1D' ? 8 : 7;
    const labelStep = Math.max(1, Math.ceil(labels.length / targetLabelCount));
    const compactLabels = labels.map((label, i) =>
      i % labelStep === 0 || i === labels.length - 1 ? label : ''
    );

    const safeNum = (v: number) => (Number.isFinite(v) ? v : 0);
    return {
      labels: compactLabels,
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
  }, [portfolioHistory, sp500History, timeFrame, primaryColor, c.onSurfaceVariant, currentPortfolioValue]);

  const performanceStats = useMemo(() => {
    const filteredPortfolio = applyCurrentValueToSeries(
      sanitizeSeries(filterDataByTimeFrame(portfolioHistory, timeFrame)),
      currentPortfolioValue
    );
    const filteredSP500 = sanitizeSeries(filterDataByTimeFrame(sp500History, timeFrame));

    const p0 = getFirstKnownValue(filteredPortfolio, currentPortfolioValue);
    const pLast = getLatestKnownValue(filteredPortfolio, currentPortfolioValue);
    const s0 = getFirstKnownValue(filteredSP500, 0);
    const sLast = getLatestKnownValue(filteredSP500, 0);

    const portfolioChange =
      filteredPortfolio.length >= 2 && Number.isFinite(p0) && p0 !== 0 && Number.isFinite(pLast)
        ? ((pLast - p0) / p0) * 100
        : 0;
    const sp500Change =
      filteredSP500.length >= 2 && Number.isFinite(s0) && s0 !== 0 && Number.isFinite(sLast)
        ? ((sLast - s0) / s0) * 100
        : 0;

    return {
      portfolioChange: Number.isFinite(portfolioChange) ? portfolioChange : 0,
      sp500Change: Number.isFinite(sp500Change) ? sp500Change : 0,
      portfolioCurrent:
        Number.isFinite(currentPortfolioValue) && currentPortfolioValue > 0
          ? currentPortfolioValue
          : Number.isFinite(pLast)
            ? pLast
            : 0,
      sp500Current: Number.isFinite(sLast) ? sLast : 0,
    };
  }, [portfolioHistory, sp500History, timeFrame, currentPortfolioValue]);

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
                { color: performanceStats.portfolioChange >= 0 ? c.success : c.danger },
              ]}
            >
              {performanceStats.portfolioChange >= 0 ? '+' : ''}
              {performanceStats.portfolioChange.toFixed(2)}%
            </ThemedText>
            <ThemedText style={styles.currentValueText}>
              ${performanceStats.portfolioCurrent.toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.performanceItem}>
            <ThemedText style={styles.performanceLabel}>S&P 500</ThemedText>
            <ThemedText
              style={[
                styles.performanceValue,
                { color: performanceStats.sp500Change >= 0 ? c.success : c.danger },
              ]}
            >
              {performanceStats.sp500Change >= 0 ? '+' : ''}
              {performanceStats.sp500Change.toFixed(2)}%
            </ThemedText>
            <ThemedText style={styles.currentValueText}>
              ${performanceStats.sp500Current.toFixed(2)}
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
          verticalLabelRotation={timeFrame === '1D' ? 0 : 20}
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

const createStyles = (c: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
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
  currentValueText: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
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
