import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MOCK_ASSETS } from '@/src/mocks/fantasy/assets';
import { DraftService } from '@/src/services/fantasy/draftService';
import { Asset, DraftState } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function DraftScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [draftState, setDraftState] = useState<DraftState | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [picking, setPicking] = useState(false);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);
    const textColor = useThemeColor({}, 'text' as any);
    const dangerColor = '#FF4444';

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
            await DraftService.makePick(draftState.leagueId, asset.id);
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
                <ActivityIndicator size="large" color={primaryColor} />
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
                    <ThemedText type="title" style={{ marginBottom: 16, textAlign: 'center' }}>
                        Draft Not Started
                    </ThemedText>
                    <ThemedText style={{ marginBottom: 24, textAlign: 'center', opacity: 0.7, paddingHorizontal: 32 }}>
                        The league admin needs to start the draft before picks can be made.
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: primaryColor }]}
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
                    <ThemedText type="title" style={{ marginBottom: 16, textAlign: 'center' }}>
                        🎉 Draft Complete!
                    </ThemedText>
                    <ThemedText style={{ marginBottom: 24, textAlign: 'center', opacity: 0.7, paddingHorizontal: 32 }}>
                        All picks have been made. Portfolios have been created.
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: primaryColor }]}
                        onPress={() => router.back()}
                    >
                        <ThemedText style={styles.startButtonText}>Back to League</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Draft Header / Status */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <View style={styles.roundInfo}>
                    <ThemedText style={styles.roundText}>Round {draftState.currentRound}</ThemedText>
                    <ThemedText style={styles.pickText}>Pick {draftState.currentPickNumber}</ThemedText>
                </View>

                <View style={styles.timerContainer}>
                    <ThemedText style={[styles.timer, { color: draftState.remainingTimeSeconds < 10 ? dangerColor : textColor }]}>
                        {draftState.remainingTimeSeconds}s
                    </ThemedText>
                    <ThemedText style={styles.onClockText}>
                        {isMyTurn ? 'YOU are on the clock!' : `Waiting for ${draftState.currentUserId}...`}
                    </ThemedText>
                </View>
            </View>

            {/* Asset Selection */}
            <View style={styles.mainContent}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.searchInput, { backgroundColor: cardBg, borderColor, color: textColor }]}
                        placeholder="Search assets..."
                        placeholderTextColor="#888"
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
                                { backgroundColor: cardBg, borderColor },
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
                                    <View style={[styles.badge, { backgroundColor: '#E0E0E0' }]}>
                                        <ThemedText style={styles.badgeText}>{asset.type}</ThemedText>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: asset.tier === 'Tier 1' ? '#E0E0E0' : '#FFD700' }]}>
                                        <ThemedText style={styles.badgeText}>{asset.tier}</ThemedText>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.priceInfo}>
                                <ThemedText style={styles.price}>${asset.currentPrice.toFixed(2)}</ThemedText>
                                <ThemedText style={{ color: asset.changePercent >= 0 ? '#4CAF50' : '#FF4444' }}>
                                    {asset.changePercent > 0 ? '+' : ''}{asset.changePercent}%
                                </ThemedText>
                            </View>

                            {isMyTurn && !asset.isLocked && (
                                <View style={[styles.pickButton, { backgroundColor: primaryColor }]}>
                                    <ThemedText style={styles.pickButtonText}>PICK</ThemedText>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Recent Picks Footer */}
            <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor: cardBg }]}>
                <ThemedText style={styles.footerTitle}>Recent Picks</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {draftState.picks.slice(-5).reverse().map((pick, index) => (
                        <View key={index} style={[styles.recentPick, { borderColor }]}>
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
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    roundInfo: {
        alignItems: 'flex-start',
    },
    roundText: {
        fontSize: 12,
        opacity: 0.7,
    },
    pickText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    timerContainer: {
        alignItems: 'flex-end',
    },
    timer: {
        fontSize: 24,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    onClockText: {
        fontSize: 12,
        fontWeight: '600',
    },
    mainContent: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
    },
    searchInput: {
        height: 44,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    assetList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    assetCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    lockIcon: {
        fontSize: 12,
    },
    assetName: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    badges: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        color: '#000',
        fontWeight: '600',
    },
    priceInfo: {
        alignItems: 'flex-end',
        marginRight: 12,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
    },
    pickButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    pickButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        height: 120,
    },
    footerTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.7,
    },
    recentPick: {
        width: 80,
        height: 60,
        borderWidth: 1,
        borderRadius: 8,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    recentPickTicker: {
        fontWeight: 'bold',
    },
    recentPickUser: {
        fontSize: 10,
        opacity: 0.7,
    },
    startButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
