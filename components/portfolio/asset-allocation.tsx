import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AssetAllocation } from '@/types/portfolio';

interface AssetAllocationProps {
  allocation: AssetAllocation;
  liquidFunds: number;
  onAllocate: (asset: keyof AssetAllocation, amount: number) => void;
}

interface AssetInfo {
  key: keyof AssetAllocation;
  name: string;
  description: string;
  risk: 'Low' | 'Medium' | 'High';
  liquidity: 'Low' | 'Medium' | 'High';
  diversification: 'Low' | 'Medium' | 'High';
  icon: string;
  color: string;
}

const ASSET_INFO: AssetInfo[] = [
  {
    key: 'savings',
    name: 'Savings Account',
    description: 'Low-risk, highly liquid cash reserves. Best for emergency funds and short-term goals.',
    risk: 'Low',
    liquidity: 'High',
    diversification: 'Low',
    icon: '💰',
    color: '#10b981',
  },
  {
    key: 'bonds',
    name: 'Bonds',
    description: 'Fixed-income securities with moderate risk. Provides stable returns and portfolio balance.',
    risk: 'Low',
    liquidity: 'Medium',
    diversification: 'Medium',
    icon: '📊',
    color: '#3b82f6',
  },
  {
    key: 'indexFunds',
    name: 'Index Funds',
    description: 'Diversified market exposure tracking major indices. Long-term growth with managed risk.',
    risk: 'Medium',
    liquidity: 'Medium',
    diversification: 'High',
    icon: '📈',
    color: '#8b5cf6',
  },
];

export function AssetAllocationComponent({ allocation, liquidFunds, onAllocate }: AssetAllocationProps) {
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');

  const totalAllocated = allocation.savings + allocation.bonds + allocation.indexFunds;

  const handleAllocate = () => {
    if (selectedAsset && amount) {
      const numAmount = parseFloat(amount);
      if (numAmount > 0 && numAmount <= liquidFunds) {
        onAllocate(selectedAsset.key, numAmount);
        setAmount('');
        setShowModal(false);
        setSelectedAsset(null);
      }
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return '#10b981';
      case 'Medium':
        return '#f59e0b';
      case 'High':
        return '#ef4444';
      default:
        return textColor;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Asset Allocation</ThemedText>
        <ThemedText style={styles.subtitle}>
          Available: ${liquidFunds.toFixed(2)}
        </ThemedText>
      </View>

      <View style={styles.allocationGrid}>
        {ASSET_INFO.map((asset) => {
          const value = allocation[asset.key];
          const percentage = totalAllocated > 0 ? (value / totalAllocated) * 100 : 0;

          return (
            <TouchableOpacity
              key={asset.key}
              style={[styles.assetCard, { backgroundColor: cardBackground }]}
              onPress={() => {
                setSelectedAsset(asset);
                setShowModal(true);
              }}
            >
              <View style={styles.assetHeader}>
                <ThemedText style={styles.assetIcon}>{asset.icon}</ThemedText>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(asset.risk) }]}>
                  <ThemedText style={styles.riskText}>{asset.risk} Risk</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
              <ThemedText style={styles.assetValue}>${value.toFixed(2)}</ThemedText>
              <ThemedText style={styles.assetPercentage}>{percentage.toFixed(1)}% of total</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor }]}>
            <ScrollView>
              {selectedAsset && (
                <>
                  <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>
                      {selectedAsset.icon} {selectedAsset.name}
                    </ThemedText>
                    <TouchableOpacity onPress={() => setShowModal(false)}>
                      <ThemedText style={styles.closeButton}>✕</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <ThemedText style={styles.description}>{selectedAsset.description}</ThemedText>

                  <View style={styles.characteristicsGrid}>
                    <View style={styles.characteristic}>
                      <ThemedText style={styles.characteristicLabel}>Risk Level</ThemedText>
                      <View style={[styles.characteristicBadge, { backgroundColor: getRiskColor(selectedAsset.risk) }]}>
                        <ThemedText style={styles.characteristicValue}>{selectedAsset.risk}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.characteristic}>
                      <ThemedText style={styles.characteristicLabel}>Liquidity</ThemedText>
                      <View style={[styles.characteristicBadge, { backgroundColor: primaryColor }]}>
                        <ThemedText style={styles.characteristicValue}>{selectedAsset.liquidity}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.characteristic}>
                      <ThemedText style={styles.characteristicLabel}>Diversification</ThemedText>
                      <View style={[styles.characteristicBadge, { backgroundColor: '#8b5cf6' }]}>
                        <ThemedText style={styles.characteristicValue}>{selectedAsset.diversification}</ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputSection}>
                    <ThemedText style={styles.inputLabel}>Amount to Allocate</ThemedText>
                    <View style={styles.inputContainer}>
                      <ThemedText style={styles.currencySymbol}>$</ThemedText>
                      <TextInput
                        style={[styles.input, { color: textColor }]}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor="#888"
                      />
                    </View>
                    <ThemedText style={styles.inputHint}>
                      Available: ${liquidFunds.toFixed(2)}
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    style={[styles.allocateButton, { backgroundColor: primaryColor }]}
                    onPress={handleAllocate}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > liquidFunds}
                  >
                    <ThemedText style={styles.allocateButtonText}>Allocate Funds</ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
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
  allocationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  assetCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetIcon: {
    fontSize: 32,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  assetValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  assetPercentage: {
    fontSize: 12,
    opacity: 0.6,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 24,
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 20,
  },
  characteristicsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  characteristic: {
    flex: 1,
    alignItems: 'center',
  },
  characteristicLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  characteristicBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  characteristicValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 6,
  },
  allocateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  allocateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
