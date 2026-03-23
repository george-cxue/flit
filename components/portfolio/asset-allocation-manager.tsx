import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AssetAllocation } from '@/types/portfolio';
import { Colors, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';

const c = Colors.light;

interface AssetAllocationManagerProps {
  allocation: AssetAllocation;
  cashBalance: number;
  onAllocate: (assetType: keyof AssetAllocation, amount: number) => Promise<void>;
}

export function AssetAllocationManager({ allocation, cashBalance, onAllocate }: AssetAllocationManagerProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<keyof AssetAllocation | null>(null);
  const [amount, setAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);
  const [processing, setProcessing] = useState(false);

  const assetInfo: Record<keyof AssetAllocation, { name: string; description: string; emoji: string }> = {
    savings: {
      name: 'Savings Account',
      description: 'Safe, liquid funds with low interest',
      emoji: '🏦',
    },
    bonds: {
      name: 'Bonds',
      description: 'Fixed income securities, moderate risk',
      emoji: '📜',
    },
    indexFunds: {
      name: 'Index Funds',
      description: 'Diversified market exposure, moderate risk',
      emoji: '📈',
    },
  };

  const handleOpenModal = (assetType: keyof AssetAllocation, buy: boolean) => {
    setSelectedAsset(assetType);
    setIsBuying(buy);
    setAmount('');
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedAsset) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const finalAmount = isBuying ? numAmount : -numAmount;

    // Check constraints
    if (isBuying && numAmount > cashBalance) {
      alert('Insufficient cash balance');
      return;
    }

    if (!isBuying && numAmount > allocation[selectedAsset]) {
      alert(`Insufficient ${assetInfo[selectedAsset].name} balance`);
      return;
    }

    try {
      setProcessing(true);
      await onAllocate(selectedAsset, finalAmount);
      setModalVisible(false);
      setSelectedAsset(null);
      setAmount('');
    } catch (error) {
      console.error('Error allocating funds:', error);
      alert('Failed to process transaction. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Other Assets</ThemedText>
      <ThemedText style={styles.subtitle}>
        Allocate your cash to low-risk investment options
      </ThemedText>

      {(Object.keys(assetInfo) as Array<keyof AssetAllocation>).map((assetType) => {
        const info = assetInfo[assetType];
        const balance = allocation[assetType];

        return (
          <View key={assetType} style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={styles.assetInfo}>
                <ThemedText style={styles.assetEmoji}>{info.emoji}</ThemedText>
                <View style={styles.assetDetails}>
                  <ThemedText style={styles.assetName}>{info.name}</ThemedText>
                  <ThemedText style={styles.assetDescription}>{info.description}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.assetBalance}>${balance.toFixed(2)}</ThemedText>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={() => handleOpenModal(assetType, true)}
              >
                <ThemedText style={styles.buttonText}>Buy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.sellButton]}
                onPress={() => handleOpenModal(assetType, false)}
                disabled={balance <= 0}
              >
                <ThemedText style={[styles.buttonText, balance <= 0 && styles.disabledText]}>
                  Sell
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAsset && (
              <>
                <ThemedText style={styles.modalTitle}>
                  {isBuying ? 'Buy' : 'Sell'} {assetInfo[selectedAsset].name}
                </ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  {isBuying
                    ? `Available cash: $${cashBalance.toFixed(2)}`
                    : `Current balance: $${allocation[selectedAsset].toFixed(2)}`}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Amount ($)"
                  placeholderTextColor={c.onSurfaceVariant}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  editable={!processing}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                    disabled={processing}
                  >
                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton, { backgroundColor: primaryColor }]}
                    onPress={handleConfirm}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color={c.onPrimary} />
                    ) : (
                      <ThemedText style={styles.confirmButtonText}>
                        {isBuying ? 'Buy' : 'Sell'}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography['body-md'],
    color: c.onSurfaceVariant,
    marginBottom: Spacing.sm + 4,
  },
  assetCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm + 4,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 4,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetEmoji: {
    fontSize: 32,
    marginRight: Spacing.sm + 4,
  },
  assetDetails: {
    flex: 1,
  },
  assetName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: c.onSurface,
    marginBottom: 2,
  },
  assetDescription: {
    ...Typography['label-md'],
    color: c.onSurfaceVariant,
  },
  assetBalance: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    lineHeight: 24,
    color: c.onSurface,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  sellButton: {
    backgroundColor: c.danger,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: c.onPrimary,
  },
  disabledText: {
    opacity: 0.5,
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
