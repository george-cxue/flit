import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PortfolioService } from '@/src/services/fantasy/portfolioService';
import { Portfolio, PortfolioSlot } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PortfolioScreen() {
    const { id, userId, readonly } = useLocalSearchParams(); // Group ID, optional userId, readonly flag
    const router = useRouter();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);
    const successColor = '#4CAF50';
    const dangerColor = '#FF4444';

    const isReadOnly = readonly === 'true';

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (typeof id === 'string') {
                const targetUserId = typeof userId === 'string' ? userId : undefined;
                const data = await PortfolioService.getPortfolioByGroupId(id, targetUserId);
                setPortfolio(data || null);
            }
            setLoading(false);
        };
        fetchPortfolio();
    }, [id, userId]);

    const handleSlotPress = (slot: PortfolioSlot) => {
        // In read-only mode, only allow viewing asset details
        if (isReadOnly) {
            if (slot.asset) {
                router.push(`/fantasy/asset/${slot.asset.id}`);
            }
            return;
        }

        if (selectedSlot) {
            // If a slot is already selected, this click is to SWAP
            if (selectedSlot === slot.id) {
                setSelectedSlot(null); // Deselect
            } else {
                Alert.alert('Swap', 'Swapping assets is simulated.');
                setSelectedSlot(null);
            }
        } else {
            // If no slot is selected, show options: Swap or View Details
            Alert.alert(
                'Asset Options',
                `Selected: ${slot.asset ? slot.asset.name : 'Empty Slot'}`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'View Details',
                        onPress: () => slot.asset && router.push(`/fantasy/asset/${slot.asset.id}`),
                        style: slot.asset ? 'default' : 'destructive' // visual cue if disabled
                    },
                    {
                        text: 'Select to Swap',
                        onPress: () => setSelectedSlot(slot.id)
                    }
                ]
            );
        }
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </ThemedView>
        );
    }

    if (!portfolio) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ThemedText>Portfolio not found. Join a group first.</ThemedText>
            </ThemedView>
        );
    }

    const renderSlot = (slot: PortfolioSlot) => (
        <TouchableOpacity
            key={slot.id}
            style={[
                styles.slotCard,
                { backgroundColor: cardBg, borderColor },
                selectedSlot === slot.id && { borderColor: primaryColor, borderWidth: 2 }
            ]}
            onPress={() => !isReadOnly && handleSlotPress(slot)}
            disabled={isReadOnly}
            activeOpacity={isReadOnly ? 1 : 0.7}
        >
            <View style={styles.slotHeader}>
                <View style={styles.slotHeaderLeft}>
                    <ThemedText style={styles.ticker}>{slot.asset?.ticker || 'Empty'}</ThemedText>
                    {slot.asset && (
                        <ThemedText style={styles.assetName}>{slot.asset.name}</ThemedText>
                    )}
                </View>
                <View style={styles.slotHeaderRight}>
                    <ThemedText style={styles.value}>${slot.totalValue.toFixed(2)}</ThemedText>
                    <ThemedText style={[
                        styles.gainLoss,
                        { color: slot.gainLossPercent >= 0 ? successColor : dangerColor }
                    ]}>
                        {slot.gainLossPercent >= 0 ? '+' : ''}{slot.gainLossPercent.toFixed(2)}%
                    </ThemedText>
                </View>
            </View>
            <View style={styles.slotDetails}>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Shares:</ThemedText>
                    <ThemedText style={styles.detailValue}>{slot.shares}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Avg Cost:</ThemedText>
                    <ThemedText style={styles.detailValue}>${slot.averageCost.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Current:</ThemedText>
                    <ThemedText style={styles.detailValue}>${slot.currentPrice.toFixed(2)}</ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header Stats */}
                <View style={[styles.headerCard, { backgroundColor: primaryColor }]}>
                    <View style={styles.portfolioHeader}>
                        <ThemedText style={styles.portfolioName}>{portfolio.name}</ThemedText>
                        {isReadOnly && (
                            <View style={styles.readOnlyBadge}>
                                <ThemedText style={styles.readOnlyText}>READ ONLY</ThemedText>
                            </View>
                        )}
                    </View>
                    <View style={styles.statsRow}>
                        <View>
                            <ThemedText style={styles.statLabel}>Total Value</ThemedText>
                            <ThemedText style={styles.statValue}>${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ThemedText>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <ThemedText style={styles.statLabel}>Cash Balance</ThemedText>
                            <ThemedText style={styles.statValue}>${portfolio.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Current Holdings */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Current Holdings</ThemedText>
                    {portfolio.slots.length > 0 ? (
                        portfolio.slots.map(renderSlot)
                    ) : (
                        <ThemedText style={styles.emptyText}>No holdings yet</ThemedText>
                    )}
                </View>

            </ScrollView>

            {!isReadOnly && selectedSlot && (
                <View style={[styles.actionBar, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
                    <ThemedText>Select another slot to swap</ThemedText>
                    <TouchableOpacity onPress={() => setSelectedSlot(null)}>
                        <ThemedText style={{ color: dangerColor }}>Cancel</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 80,
    },
    headerCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    portfolioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    portfolioName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
    },
    readOnlyBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    readOnlyText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        opacity: 0.5,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 16,
    },
    slotCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    slotHeaderLeft: {
        flex: 1,
    },
    slotHeaderRight: {
        alignItems: 'flex-end',
    },
    ticker: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
    },
    gainLoss: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    assetName: {
        fontSize: 13,
        opacity: 0.7,
    },
    slotDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    detailRow: {
        flex: 1,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 11,
        opacity: 0.6,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    slotSub: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
