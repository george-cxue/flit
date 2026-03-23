import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AssetAllocation } from '@/types/portfolio';
import { Colors, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';

const c = Colors.light;

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
    icon: '\u{1F4B0}',
    color: '#10b981',
  },
  {
    key: 'bonds',
    name: 'Bonds',
    description: 'Fixed-income securities with moderate risk. Provides stable returns and portfolio balance.',
    risk: 'Low',
    liquidity: 'Medium',
    diversification: 'Medium',
    icon: '\u{1F4CA}',
    color: '#3b82f6',
  },
  {
    key: 'indexFunds',
    name: 'Index Funds',
    description: 'Diversified market exposure tracking major indices. Long-term growth with managed risk.',
    risk: 'Medium',
    liquidity: 'Medium',
    diversification: 'High',
    icon: '\u{1F4C8}',
    color: '#8b5cf6',
  },
];

export function AssetAllocationComponent({ allocation, liquidFunds, onAllocate }: AssetAllocationProps) {
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

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
        return c.success;
      case 'Medium':
        return c.warning;
      case 'High':
        return c.danger;
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
              style={styles.assetCard}
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
          <ThemedView style={styles.modalContent}>
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
                        placeholderTextColor={c.onSurfaceVariant}
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
  allocationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm + 4,
  },
  assetCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  assetIcon: {
    fontSize: 32,
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
  },
  riskText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: c.onPrimary,
  },
  assetName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: c.onSurface,
    marginBottom: Spacing.sm,
  },
  assetValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: c.onSurface,
    marginBottom: Spacing.xs,
  },
  assetPercentage: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
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
    maxHeight: '80%',
    backgroundColor: c.surfaceContainerLow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    color: c.onSurface,
  },
  closeButton: {
    fontSize: 24,
    color: c.onSurfaceVariant,
  },
  description: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
    marginBottom: 20,
  },
  characteristicsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
    marginBottom: Spacing.lg,
  },
  characteristic: {
    flex: 1,
    alignItems: 'center',
  },
  characteristicLabel: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
    marginBottom: 6,
  },
  characteristicBadge: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: Radii.sm + 4,
  },
  characteristicValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: c.onPrimary,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: c.onSurface,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceContainerHigh,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  currencySymbol: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: c.onSurface,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  inputHint: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
    marginTop: 6,
  },
  allocateButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  allocateButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: c.onPrimary,
  },
});
