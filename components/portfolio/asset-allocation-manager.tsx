import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AssetAllocation } from '@/types/portfolio';

interface AssetAllocationManagerProps {
  allocation: AssetAllocation;
  cashBalance: number;
  onAllocate: (assetType: keyof AssetAllocation, amount: number) => Promise<void>;
}

export function AssetAllocationManager({ allocation, cashBalance, onAllocate }: AssetAllocationManagerProps) {
  const cardBackground = useThemeColor({}, 'cardBackground');
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
          <View key={assetType} style={[styles.assetCard, { backgroundColor: cardBackground }]}>
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
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
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
                  placeholderTextColor="#888"
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
                      <ActivityIndicator color="#fff" />
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
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  assetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  assetDetails: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  assetBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sellButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
