import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stock } from '@/types/portfolio';
import { apiClient } from '@/src/services/api';
import { Colors, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';
import { useThemeMode } from '@/contexts/theme-context';

interface StockSearchProps {
  groupId: string;
  liquidFunds: number;
  onBuyStock: (stock: Stock, shares: number) => Promise<void>;
}

export function StockSearch({ groupId, liquidFunds, onBuyStock }: StockSearchProps) {
  const { themeMode } = useThemeMode();
  const c = themeMode === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(c);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [shares, setShares] = useState('1');
  const [showModal, setShowModal] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  // Fetch stocks from group-specific assets API (only shows assets purchasable in this group)
  useEffect(() => {
    const fetchStocks = async () => {
      if (!searchQuery.trim() || !groupId) {
        setStocks([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.get(`/fantasy-groups/${groupId}/assets`, {
          params: { search: searchQuery, type: 'Stock' },
        });

        const assets = response.data?.assets ?? response.data ?? [];
        const mappedStocks: Stock[] = (Array.isArray(assets) ? assets : []).map((asset: any) => ({
          id: asset.id,
          symbol: asset.ticker ?? asset.symbol,
          name: asset.name,
          currentPrice: asset.currentPrice ?? 0,
          previousClose: asset.previousClose ?? asset.currentPrice ?? 0,
          changePercent: asset.changePercent ?? (asset.previousClose > 0
            ? ((asset.currentPrice - asset.previousClose) / asset.previousClose) * 100
            : 0),
          sector: asset.sector || 'Unknown',
          marketCap: asset.marketCap,
          tier: asset.tier,
        }));

        setStocks(mappedStocks.slice(0, 10));
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchStocks, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, groupId]);

  const filteredStocks = stocks;

  const totalCost = useMemo(() => {
    if (!selectedStock) return 0;
    return selectedStock.currentPrice * parseInt(shares || '0');
  }, [selectedStock, shares]);

  const handleBuyStock = async () => {
    if (!selectedStock) return;

    const numShares = parseInt(shares || '0', 10);
    if (numShares <= 0 || isNaN(numShares)) {
      alert('Please enter a valid number of shares (at least 1).');
      return;
    }
    if (totalCost > liquidFunds) {
      alert('Insufficient funds for this purchase.');
      return;
    }
    if (!selectedStock.id) {
      alert('This stock cannot be purchased. Try searching again.');
      return;
    }

    try {
      setPurchasing(true);
      await onBuyStock(selectedStock, numShares);
      setShares('1');
      setShowModal(false);
      setSelectedStock(null);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to purchase stock:', error);
      const msg = (error as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error
        || (error as { message?: string })?.message
        || 'Failed to purchase stock. Please try again.';
      alert(msg);
    } finally {
      setPurchasing(false);
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

      <View style={styles.searchContainer}>
        <View style={styles.searchIconWrapper}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
        </View>
        <TextInput
          style={[styles.searchInput, { backgroundColor: c.surfaceContainerHigh, color: textColor }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search stocks"
          placeholderTextColor={c.onSurfaceVariant}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Searching...</ThemedText>
        </View>
      )}

      {!loading && filteredStocks.length > 0 && (
        <View style={styles.resultsContainer}>
          {filteredStocks.map((item, index) => (
            <React.Fragment key={item.symbol}>
              {index > 0 && <View style={styles.separator} />}
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
                      { color: item.changePercent >= 0 ? c.success : c.danger },
                    ]}
                  >
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
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

                <View style={styles.priceCard}>
                  <ThemedText style={styles.currentPriceLabel}>Current Price</ThemedText>
                  <ThemedText style={styles.currentPriceValue}>
                    ${selectedStock.currentPrice.toFixed(2)}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.currentPriceChange,
                      { color: selectedStock.changePercent >= 0 ? c.success : c.danger },
                    ]}
                  >
                    {selectedStock.changePercent >= 0 ? '+' : ''}
                    {selectedStock.changePercent.toFixed(2)}% today
                  </ThemedText>
                </View>

                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputLabel}>Number of Shares</ThemedText>
                  <TextInput
                    style={[styles.sharesInput, { backgroundColor: c.surfaceContainerHigh, color: textColor }]}
                    value={shares}
                    onChangeText={setShares}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor={c.onSurfaceVariant}
                  />
                </View>

                <View style={styles.costSummary}>
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
                        { color: liquidFunds - totalCost >= 0 ? c.success : c.danger },
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
                        totalCost > liquidFunds || totalCost === 0 || purchasing ? c.onSurfaceVariant : primaryColor,
                    },
                  ]}
                  onPress={handleBuyStock}
                  disabled={totalCost > liquidFunds || totalCost === 0 || purchasing}
                >
                  {purchasing ? (
                    <ActivityIndicator color={c.onPrimary} />
                  ) : (
                    <ThemedText style={styles.buyButtonText}>
                      Buy {shares} Share{parseInt(shares) !== 1 ? 's' : ''}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const createStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchIconWrapper: {
    paddingLeft: Spacing.sm + 4,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: Radii.md,
    paddingLeft: 12,
    paddingRight: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  resultsContainer: {
    marginTop: Spacing.sm + 4,
    borderRadius: Radii.md,
    maxHeight: 300,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.sm + 4,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: 2,
  },
  stockName: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  stockSector: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: 2,
  },
  priceChange: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: c.surfaceContainerHigh,
    marginHorizontal: '10%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    padding: Spacing.lg,
    backgroundColor: c.surfaceContainerLow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalSymbol: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    color: c.onSurface,
    marginBottom: Spacing.xs,
  },
  modalName: {
    ...Typography['body-lg'],
    color: c.onSurfaceVariant,
  },
  closeButton: {
    fontSize: 24,
    color: c.onSurfaceVariant,
  },
  priceCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  currentPriceLabel: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  currentPriceValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: c.onSurface,
    marginBottom: Spacing.xs,
  },
  currentPriceChange: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: c.onSurface,
    marginBottom: Spacing.sm,
  },
  sharesInput: {
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  costSummary: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  costLabel: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
  },
  costValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: c.onSurface,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: c.danger,
    textAlign: 'center',
    marginBottom: Spacing.sm + 4,
  },
  buyButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  buyButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: c.onPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
    marginLeft: 10,
  },
});
