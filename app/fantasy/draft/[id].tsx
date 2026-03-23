import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { MOCK_ASSETS } from '@/src/mocks/fantasy/assets';
import { DraftService } from '@/src/services/fantasy/draftService';
import { Asset, DraftState } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const c = Colors.light;

export default function DraftScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [draftState, setDraftState] = useState<DraftState | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [picking, setPicking] = useState(false);

    const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchDraftState = async () => {
        if (typeof id === 'string') {
            const state = await DraftService.getDraftState(id);
            setDraftState(state);

            // If it's our turn, refresh assets to ensure availability
            if (state.currentUserId === 'user_1') { // Mock current user check
                fetchAssets();
            }
        }
    };

    const fetchAssets = async () => {
        if (typeof id === 'string') {
            const data = await DraftService.getDraftableAssets(id, searchQuery);
            setAssets(data);
        }
    };

    useEffect(() => {
        fetchDraftState();
        fetchAssets();
        setLoading(false);

        // Poll for updates
        pollInterval.current = setInterval(fetchDraftState, 3000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [id]);

    useEffect(() => {
        fetchAssets();
    }, [searchQuery]);

    const handleStartDraft = async () => {
        if (!draftState || typeof id !== 'string') return;

        try {
            await DraftService.startDraft(id);
            await fetchDraftState();
            Alert.alert('Draft Started!', 'The draft is now live. Good luck!');
        } catch (error) {
            console.error('Failed to start draft:', error);
            Alert.alert('Error', 'Failed to start draft');
        }
    };

    const handlePick = async (asset: Asset) => {
        if (asset.isLocked) {
            Alert.alert(
                'Asset Locked',
                `You must complete the following lessons to draft this asset:\n${asset.requiredLessons.join(', ')}`
            );
            return;
        }

        if (!draftState || draftState.currentUserId !== 'user_1') return;

        setPicking(true);
        try {
            await DraftService.makePick(draftState.groupId, asset.id);
            // Refetch the draft state to get updated picks and current turn
            await fetchDraftState();
            await fetchAssets(); // Refresh list to remove picked asset
        } catch (error) {
            console.error('Pick failed:', error);
            Alert.alert('Error', 'Failed to make pick');
        } finally {
            setPicking(false);
        }
    };

    if (loading || !draftState) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={c.primary} />
            </ThemedView>
        );
    }

    const isMyTurn = draftState.currentUserId === 'user_1';
    const isDraftPending = draftState.status === 'pending';
    const isDraftCompleted = draftState.status === 'completed';

    // Show start draft screen if pending
    if (isDraftPending) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.centered, { flex: 1 }]}>
                    <ThemedText type="title" style={{ marginBottom: Spacing.md, textAlign: 'center' }}>
                        Draft Not Started
                    </ThemedText>
                    <ThemedText style={{ marginBottom: Spacing.lg, textAlign: 'center', color: c.onSurfaceVariant, paddingHorizontal: Spacing.xl }}>
                        The group admin needs to start the draft before picks can be made.
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStartDraft}
                    >
                        <ThemedText style={styles.startButtonText}>Start Draft</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    // Show completion message if draft is done
    if (isDraftCompleted) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.centered, { flex: 1 }]}>
                    <ThemedText type="title" style={{ marginBottom: Spacing.md, textAlign: 'center' }}>
                        Draft Complete!
                    </ThemedText>
                    <ThemedText style={{ marginBottom: Spacing.lg, textAlign: 'center', color: c.onSurfaceVariant, paddingHorizontal: Spacing.xl }}>
                        All picks have been made. Portfolios have been created.
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => router.back()}
                    >
                        <ThemedText style={styles.startButtonText}>Back to Group</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Draft Header / Status */}
            <View style={styles.header}>
                <View style={styles.roundInfo}>
                    <ThemedText style={styles.roundText}>Round {draftState.currentRound}</ThemedText>
                    <ThemedText style={styles.pickText}>Pick {draftState.currentPickNumber}</ThemedText>
                </View>

                <View style={styles.timerContainer}>
                    <ThemedText style={[styles.timer, { color: draftState.remainingTimeSeconds < 10 ? c.danger : c.onSurface }]}>
                        {draftState.remainingTimeSeconds}s
                    </ThemedText>
                    <ThemedText style={styles.onClockText}>
                        {isMyTurn ? 'YOU are on the clock!' : `Waiting for ${draftState.currentUserId}...`}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.headerDivider} />

            {/* Asset Selection */}
            <View style={styles.mainContent}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search assets..."
                        placeholderTextColor={c.onSurfaceVariant}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView style={styles.assetList}>
                    {assets.map((asset) => (
                        <TouchableOpacity
                            key={asset.id}
                            style={[
                                styles.assetCard,
                                asset.isLocked && styles.lockedAsset
                            ]}
                            onPress={() => isMyTurn && handlePick(asset)}
                            disabled={!isMyTurn || picking}
                        >
                            <View style={styles.assetInfo}>
                                <View style={styles.tickerRow}>
                                    <ThemedText style={styles.ticker}>{asset.ticker}</ThemedText>
                                    {asset.isLocked && <ThemedText style={styles.lockIcon}>🔒</ThemedText>}
                                </View>
                                <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
                                <View style={styles.badges}>
                                    <View style={styles.badge}>
                                        <ThemedText style={styles.badgeText}>{asset.type}</ThemedText>
                                    </View>
                                    <View style={[styles.badge, asset.tier !== 'Tier 1' && { backgroundColor: '#FFD700' }]}>
                                        <ThemedText style={styles.badgeText}>{asset.tier}</ThemedText>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.priceInfo}>
                                <ThemedText style={styles.price}>${asset.currentPrice.toFixed(2)}</ThemedText>
                                <ThemedText style={{ color: asset.changePercent >= 0 ? c.success : c.danger }}>
                                    {asset.changePercent > 0 ? '+' : ''}{asset.changePercent}%
                                </ThemedText>
                            </View>

                            {isMyTurn && !asset.isLocked && (
                                <View style={styles.pickButton}>
                                    <ThemedText style={styles.pickButtonText}>PICK</ThemedText>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Recent Picks Footer */}
            <View style={styles.footerDivider} />
            <View style={styles.footer}>
                <ThemedText style={styles.footerTitle}>Recent Picks</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {draftState.picks.slice(-5).reverse().map((pick, index) => (
                        <View key={index} style={styles.recentPick}>
                            <ThemedText style={styles.recentPickTicker}>
                                {MOCK_ASSETS.find(a => a.id === pick.assetId)?.ticker || 'Unknown'}
                            </ThemedText>
                            <ThemedText style={styles.recentPickUser}>{pick.userId}</ThemedText>
                        </View>
                    ))}
                </ScrollView>
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    headerDivider: {
        height: 1,
        backgroundColor: c.surfaceContainerHigh,
        marginHorizontal: '10%',
    },
    roundInfo: {
        alignItems: 'flex-start',
    },
    roundText: {
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
    },
    pickText: {
        ...Typography['title-lg'],
    },
    timerContainer: {
        alignItems: 'flex-end',
    },
    timer: {
        fontSize: 24,
        fontFamily: 'Inter_600SemiBold',
        fontVariant: ['tabular-nums'],
    },
    onClockText: {
        ...Typography['label-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    mainContent: {
        flex: 1,
    },
    searchContainer: {
        padding: Spacing.md,
    },
    searchInput: {
        height: 44,
        backgroundColor: c.surfaceContainerHigh,
        borderRadius: Radii.md,
        paddingHorizontal: Spacing.md,
        color: c.onSurface,
    },
    assetList: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    assetCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Radii.md,
        marginBottom: Spacing.sm,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    lockedAsset: {
        opacity: 0.6,
    },
    assetInfo: {
        flex: 1,
    },
    tickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ticker: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    lockIcon: {
        fontSize: 12,
    },
    assetName: {
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
        marginBottom: Spacing.xs,
    },
    badges: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: Radii.sm,
        backgroundColor: c.surfaceContainerHigh,
    },
    badgeText: {
        ...Typography['label-md'],
        fontSize: 10,
        color: c.onSurface,
        fontFamily: 'Inter_500Medium',
    },
    priceInfo: {
        alignItems: 'flex-end',
        marginRight: Spacing.md,
    },
    price: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    pickButton: {
        backgroundColor: c.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radii.lg,
    },
    pickButtonText: {
        color: c.onPrimary,
        ...Typography['label-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    footerDivider: {
        height: 1,
        backgroundColor: c.surfaceContainerHigh,
        marginHorizontal: '10%',
    },
    footer: {
        padding: Spacing.md,
        backgroundColor: c.surfaceContainerLow,
        height: 120,
    },
    footerTitle: {
        ...Typography['label-md'],
        fontFamily: 'Inter_600SemiBold',
        color: c.onSurfaceVariant,
        marginBottom: Spacing.sm,
    },
    recentPick: {
        width: 80,
        height: 60,
        borderRadius: Radii.sm,
        marginRight: Spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xs,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    recentPickTicker: {
        fontFamily: 'Inter_600SemiBold',
    },
    recentPickUser: {
        ...Typography['label-md'],
        fontSize: 10,
        color: c.onSurfaceVariant,
    },
    startButton: {
        backgroundColor: c.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radii.lg,
    },
    startButtonText: {
        color: c.onPrimary,
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
    },
});
