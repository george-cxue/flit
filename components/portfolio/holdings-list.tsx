import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StockHolding } from '@/types/portfolio';
import { Colors, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';

const c = Colors.light;

interface HoldingsListProps {
  holdings: StockHolding[];
  onSellStock?: (symbol: string, shares: number) => Promise<void>;
}

export function HoldingsList({ holdings, onSellStock }: HoldingsListProps) {
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<StockHolding | null>(null);
  const [sellShares, setSellShares] = useState('');
  const [selling, setSelling] = useState(false);

  const handleSellPress = (holding: StockHolding) => {
    setSelectedHolding(holding);
    setSellShares('');
    setSellModalVisible(true);
  };

  const handleSellConfirm = async () => {
    if (!selectedHolding || !onSellStock) return;

    const shares = parseFloat(sellShares);
    if (isNaN(shares) || shares <= 0 || shares > selectedHolding.shares) {
      alert('Invalid number of shares');
      return;
    }

    try {
      setSelling(true);
      await onSellStock(selectedHolding.symbol, shares);
      setSellModalVisible(false);
      setSelectedHolding(null);
      setSellShares('');
    } catch (error) {
      console.error('Error selling stock:', error);
      alert('Failed to sell stock. Please try again.');
    } finally {
      setSelling(false);
    }
  };

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
          <View style={styles.holdingCard}>
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
                    { color: item.changePercent >= 0 ? c.success : c.danger },
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
            {onSellStock && (
              <TouchableOpacity
                style={styles.sellButton}
                onPress={() => handleSellPress(item)}
              >
                <ThemedText style={styles.sellButtonText}>Sell</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
        scrollEnabled={false}
      />

      <Modal
        visible={sellModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSellModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Sell {selectedHolding?.symbol}</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              You own {selectedHolding?.shares} shares at ${selectedHolding?.currentPrice.toFixed(2)} each
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Number of shares to sell"
              placeholderTextColor={c.onSurfaceVariant}
              keyboardType="numeric"
              value={sellShares}
              onChangeText={setSellShares}
              editable={!selling}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSellModalVisible(false)}
                disabled={selling}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSellConfirm}
                disabled={selling}
              >
                {selling ? (
                  <ActivityIndicator color={c.onPrimary} />
                ) : (
                  <ThemedText style={styles.confirmButtonText}>Sell</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: Spacing.sm + 4,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm + 4,
  },
  emptyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
    textAlign: 'center',
  },
  holdingCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm + 4,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 4,
  },
  symbol: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: 2,
  },
  name: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: 2,
  },
  changePercent: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  holdingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: c.onSurface,
  },
  sellButton: {
    marginTop: Spacing.sm + 4,
    backgroundColor: c.danger,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  sellButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: c.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: Spacing.lg,
    borderRadius: Radii.md,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: c.onSurface,
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: c.surfaceContainerHigh,
    borderRadius: Radii.md,
    padding: Spacing.sm + 4,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.md,
    color: c.onSurface,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: c.surfaceContainerHigh,
  },
  confirmButton: {
    backgroundColor: c.success,
  },
  cancelButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: c.onSurface,
  },
  confirmButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: c.onPrimary,
  },
});
