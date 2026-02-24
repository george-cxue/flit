import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StockHolding } from '@/types/portfolio';

interface HoldingsListProps {
  holdings: StockHolding[];
  onSellStock?: (symbol: string, shares: number) => Promise<void>;
}

export function HoldingsList({ holdings, onSellStock }: HoldingsListProps) {
  const cardBackground = useThemeColor({}, 'cardBackground');
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
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.modalTitle}>Sell {selectedHolding?.symbol}</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              You own {selectedHolding?.shares} shares at ${selectedHolding?.currentPrice.toFixed(2)} each
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Number of shares to sell"
              placeholderTextColor="#888"
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
                  <ActivityIndicator color="#fff" />
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
  sellButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sellButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
