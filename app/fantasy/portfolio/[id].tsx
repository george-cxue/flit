import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow, AmbientShadow } from '@/constants/theme';
import { PortfolioService } from '@/src/services/fantasy/portfolioService';
import { Portfolio, PortfolioSlot } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppLoadingScreen } from '@/components/app-loading-screen';

const c = Colors.light;

export default function PortfolioScreen() {
    const { id, userId, readonly } = useLocalSearchParams(); // Group ID, optional userId, readonly flag
    const router = useRouter();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

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
        return <AppLoadingScreen />;
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
                selectedSlot === slot.id && { backgroundColor: c.surfaceContainerLow }
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
                        { color: slot.gainLossPercent >= 0 ? c.success : c.danger }
                    ]}>
                        {slot.gainLossPercent >= 0 ? '+' : ''}{slot.gainLossPercent.toFixed(2)}%
                    </ThemedText>
                </View>
            </View>
            <View style={styles.slotDivider} />
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
                <View style={styles.headerCard}>
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
                <View style={styles.actionBar}>
                    <ThemedText>Select another slot to swap</ThemedText>
                    <TouchableOpacity onPress={() => setSelectedSlot(null)}>
                        <ThemedText style={{ color: c.danger }}>Cancel</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.surface,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 80,
    },
    headerCard: {
        padding: Spacing.lg,
        borderRadius: Radii.md,
        marginBottom: Spacing.lg,
        backgroundColor: c.primary,
        ...AmbientShadow,
    },
    portfolioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    portfolioName: {
        color: c.onPrimary,
        fontSize: 24,
        fontFamily: 'Manrope_700Bold',
        flex: 1,
    },
    readOnlyBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Radii.sm,
    },
    readOnlyText: {
        color: c.onPrimary,
        ...Typography['label-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        ...Typography['label-md'],
        marginBottom: Spacing.xs,
    },
    statValue: {
        color: c.onPrimary,
        fontSize: 20,
        fontFamily: 'Manrope_700Bold',
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    emptyText: {
        ...Typography['body-md'],
        color: c.onSurfaceVariant,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: Spacing.md,
    },
    slotCard: {
        padding: Spacing.md,
        borderRadius: Radii.md,
        marginBottom: Spacing.md,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    slotHeaderLeft: {
        flex: 1,
    },
    slotHeaderRight: {
        alignItems: 'flex-end',
    },
    ticker: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
        marginBottom: Spacing.xs,
    },
    value: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    gainLoss: {
        ...Typography['body-md'],
        fontFamily: 'Inter_600SemiBold',
        marginTop: 2,
    },
    assetName: {
        ...Typography['body-md'],
        fontSize: 13,
        color: c.onSurfaceVariant,
    },
    slotDivider: {
        height: 1,
        backgroundColor: c.surfaceContainerHigh,
        marginHorizontal: '10%',
    },
    slotDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Spacing.md,
    },
    detailRow: {
        flex: 1,
        alignItems: 'center',
    },
    detailLabel: {
        ...Typography['label-md'],
        fontSize: 11,
        color: c.onSurfaceVariant,
        marginBottom: Spacing.xs,
    },
    detailValue: {
        ...Typography['body-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        backgroundColor: c.surfaceContainerLow,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
