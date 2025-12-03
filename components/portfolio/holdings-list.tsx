import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StockHolding } from '@/types/portfolio';

interface HoldingsListProps {
  holdings: StockHolding[];
}

export function HoldingsList({ holdings }: HoldingsListProps) {
  const cardBackground = useThemeColor({}, 'cardBackground');

  if (holdings.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyIcon}>📊</ThemedText>
        <ThemedText style={styles.emptyText}>No stock holdings yet</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Use lesson rewards to buy stocks and start building your portfolio
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Current Holdings</ThemedText>
      <FlatList
        data={holdings}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <View style={[styles.holdingCard, { backgroundColor: cardBackground }]}>
            <View style={styles.holdingHeader}>
              <View>
                <ThemedText style={styles.symbol}>{item.symbol}</ThemedText>
                <ThemedText style={styles.name}>{item.name}</ThemedText>
              </View>
              <View style={styles.valueContainer}>
                <ThemedText style={styles.totalValue}>${item.totalValue.toFixed(2)}</ThemedText>
                <ThemedText
                  style={[
                    styles.changePercent,
                    { color: item.changePercent >= 0 ? '#10b981' : '#ef4444' },
                  ]}
                >
                  {item.changePercent >= 0 ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </ThemedText>
              </View>
            </View>
            <View style={styles.holdingDetails}>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Shares</ThemedText>
                <ThemedText style={styles.detailValue}>{item.shares}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Avg Price</ThemedText>
                <ThemedText style={styles.detailValue}>${item.averagePrice.toFixed(2)}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Current</ThemedText>
                <ThemedText style={styles.detailValue}>${item.currentPrice.toFixed(2)}</ThemedText>
              </View>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  holdingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    opacity: 0.7,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  holdingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
