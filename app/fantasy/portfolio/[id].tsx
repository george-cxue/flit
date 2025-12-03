import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PortfolioService } from '@/src/services/fantasy/portfolioService';
import { Portfolio, PortfolioSlot } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PortfolioScreen() {
    const { id, userId, readonly } = useLocalSearchParams(); // League ID, optional userId, readonly flag
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
                const data = await PortfolioService.getPortfolioByLeagueId(id, targetUserId);
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
                <ThemedText>Portfolio not found. Join a league first.</ThemedText>
            </ThemedView>
        );
    }

    const activeSlots = portfolio.slots.filter(s => s.status === 'ACTIVE');
    const benchSlots = portfolio.slots.filter(s => s.status === 'BENCH');

    const renderSlot = (slot: PortfolioSlot) => (
        <TouchableOpacity
            key={slot.id}
            style={[
                styles.slotCard,
                { backgroundColor: cardBg, borderColor },
                selectedSlot === slot.id && { borderColor: primaryColor, borderWidth: 2 }
            ]}
            onPress={() => handleSlotPress(slot)}
        >
            <View style={styles.slotHeader}>
                <ThemedText style={styles.ticker}>{slot.asset?.ticker || 'Empty'}</ThemedText>
                <ThemedText style={styles.value}>${slot.currentValue.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.slotSub}>
                <ThemedText style={styles.assetName}>{slot.asset?.name || '-'}</ThemedText>
                <ThemedText style={{ color: slot.gainLossPercent >= 0 ? successColor : dangerColor }}>
                    {slot.gainLossPercent > 0 ? '+' : ''}{slot.gainLossPercent.toFixed(2)}%
                </ThemedText>
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
                            <ThemedText style={styles.statValue}>${portfolio.totalValue.toLocaleString()}</ThemedText>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <ThemedText style={styles.statLabel}>Weekly Return</ThemedText>
                            <ThemedText style={styles.statValue}>+{portfolio.weeklyReturn}%</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Active Lineup */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Starting Lineup</ThemedText>
                    {activeSlots.map(renderSlot)}
                </View>

                {/* Bench */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Bench</ThemedText>
                    {benchSlots.map(renderSlot)}
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
    slotCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    ticker: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
    },
    slotSub: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    assetName: {
        fontSize: 12,
        opacity: 0.7,
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
