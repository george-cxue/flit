import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stock } from '@/types/portfolio';
import { MOCK_STOCKS } from '@/data/mock-portfolio';

interface StockSearchProps {
  liquidFunds: number;
  onBuyStock: (stock: Stock, shares: number) => void;
}

export function StockSearch({ liquidFunds, onBuyStock }: StockSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [shares, setShares] = useState('1');
  const [showModal, setShowModal] = useState(false);

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return MOCK_STOCKS.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query) ||
        stock.sector.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchQuery]);

  const totalCost = useMemo(() => {
    if (!selectedStock) return 0;
    return selectedStock.currentPrice * parseInt(shares || '0');
  }, [selectedStock, shares]);

  const handleBuyStock = () => {
    if (selectedStock && shares) {
      const numShares = parseInt(shares);
      if (numShares > 0 && totalCost <= liquidFunds) {
        onBuyStock(selectedStock, numShares);
        setShares('1');
        setShowModal(false);
        setSelectedStock(null);
        setSearchQuery('');
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Buy Stocks</ThemedText>
        <ThemedText style={styles.subtitle}>
          Available Funds: ${liquidFunds.toFixed(2)}
        </ThemedText>
      </View>

      <View style={[styles.searchContainer, { borderColor: primaryColor }]}>
        <ThemedText style={styles.searchIcon}>🔍</ThemedText>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search stocks by symbol, name, or sector..."
          placeholderTextColor="#888"
        />
      </View>

      {filteredStocks.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: cardBackground }]}>
          <FlatList
            data={filteredStocks}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stockItem}
                onPress={() => {
                  setSelectedStock(item);
                  setShowModal(true);
                }}
              >
                <View style={styles.stockInfo}>
                  <ThemedText style={styles.stockSymbol}>{item.symbol}</ThemedText>
                  <ThemedText style={styles.stockName} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.stockSector}>{item.sector}</ThemedText>
                </View>
                <View style={styles.stockPrice}>
                  <ThemedText style={styles.priceValue}>${item.currentPrice.toFixed(2)}</ThemedText>
                  <ThemedText
                    style={[
                      styles.priceChange,
                      { color: item.changePercent >= 0 ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor }]}>
            {selectedStock && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <ThemedText style={styles.modalSymbol}>{selectedStock.symbol}</ThemedText>
                    <ThemedText style={styles.modalName}>{selectedStock.name}</ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <ThemedText style={styles.closeButton}>✕</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={[styles.priceCard, { backgroundColor: cardBackground }]}>
                  <ThemedText style={styles.currentPriceLabel}>Current Price</ThemedText>
                  <ThemedText style={styles.currentPriceValue}>
                    ${selectedStock.currentPrice.toFixed(2)}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.currentPriceChange,
                      { color: selectedStock.changePercent >= 0 ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {selectedStock.changePercent >= 0 ? '+' : ''}
                    {selectedStock.changePercent.toFixed(2)}% today
                  </ThemedText>
                </View>

                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Number of Shares</ThemedText>
                  <TextInput
                    style={[styles.sharesInput, { color: textColor, borderColor: primaryColor }]}
                    value={shares}
                    onChangeText={setShares}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor="#888"
                  />
                </View>

                <View style={[styles.costSummary, { backgroundColor: cardBackground }]}>
                  <View style={styles.costRow}>
                    <ThemedText style={styles.costLabel}>Total Cost</ThemedText>
                    <ThemedText style={styles.costValue}>${totalCost.toFixed(2)}</ThemedText>
                  </View>
                  <View style={styles.costRow}>
                    <ThemedText style={styles.costLabel}>Available Funds</ThemedText>
                    <ThemedText style={styles.costValue}>${liquidFunds.toFixed(2)}</ThemedText>
                  </View>
                  <View style={styles.costRow}>
                    <ThemedText style={styles.costLabel}>Remaining</ThemedText>
                    <ThemedText
                      style={[
                        styles.costValue,
                        { color: liquidFunds - totalCost >= 0 ? '#10b981' : '#ef4444' },
                      ]}
                    >
                      ${(liquidFunds - totalCost).toFixed(2)}
                    </ThemedText>
                  </View>
                </View>

                {totalCost > liquidFunds && (
                  <ThemedText style={styles.errorText}>
                    Insufficient funds to complete this purchase
                  </ThemedText>
                )}

                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    {
                      backgroundColor:
                        totalCost > liquidFunds || totalCost === 0 ? '#888' : primaryColor,
                    },
                  ]}
                  onPress={handleBuyStock}
                  disabled={totalCost > liquidFunds || totalCost === 0}
                >
                  <ThemedText style={styles.buyButtonText}>Buy {shares} Share{parseInt(shares) !== 1 ? 's' : ''}</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 12,
    borderRadius: 12,
    maxHeight: 300,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  stockName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  stockSector: {
    fontSize: 12,
    opacity: 0.6,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalSymbol: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalName: {
    fontSize: 16,
    opacity: 0.8,
  },
  closeButton: {
    fontSize: 24,
    opacity: 0.6,
  },
  priceCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  currentPriceLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  currentPriceValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  currentPriceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sharesInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  costSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  buyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
