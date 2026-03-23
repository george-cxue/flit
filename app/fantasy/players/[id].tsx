import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { WaiverService } from '@/src/services/fantasy/waiverService';
import { Asset } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const c = Colors.light;

export default function PlayersScreen() {
    const { id } = useLocalSearchParams(); // Group ID
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);

    const fetchAssets = async () => {
        if (typeof id === 'string') {
            const data = await WaiverService.getAvailableAssets(id, searchQuery);
            setAssets(data);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [id, searchQuery]);

    const handleClaim = async (asset: Asset) => {
        if (asset.isLocked) {
            Alert.alert(
                'Asset Locked',
                `You must complete the following lessons to unlock this asset:\n${asset.requiredLessons.join(', ')}`
            );
            return;
        }

        if (typeof id !== 'string') return;

        setClaiming(asset.id);
        try {
            await WaiverService.submitClaim(id, asset.id);
            Alert.alert('Success', 'Waiver claim submitted!');
        } catch (error) {
            console.error('Claim failed:', error);
            Alert.alert('Error', (error instanceof Error && error.message) ? error.message : 'Failed to submit claim');
        } finally {
            setClaiming(null);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search players..."
                    placeholderTextColor={c.onSurfaceVariant}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={c.primary} style={{ marginTop: Spacing.lg }} />
            ) : (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {assets.map((asset) => (
                        <TouchableOpacity
                            key={asset.id}
                            style={styles.assetCard}
                            onPress={() => router.push(`/fantasy/asset/${asset.id}`)}
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

                            <View style={styles.actionContainer}>
                                <ThemedText style={styles.price}>${asset.currentPrice.toFixed(2)}</ThemedText>
                                <TouchableOpacity
                                    style={[
                                        styles.claimButton,
                                        { opacity: asset.isLocked ? 0.5 : 1 }
                                    ]}
                                    onPress={() => handleClaim(asset)}
                                    disabled={claiming === asset.id}
                                >
                                    <ThemedText style={styles.claimButtonText}>
                                        {claiming === asset.id ? '...' : '+'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.surface,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingTop: 0,
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
    actionContainer: {
        alignItems: 'flex-end',
        gap: Spacing.sm,
    },
    price: {
        ...Typography['body-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    claimButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.primary,
    },
    claimButtonText: {
        color: c.onPrimary,
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        marginTop: -2,
    },
});
