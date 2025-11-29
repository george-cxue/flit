import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WaiverService } from '@/src/services/fantasy/waiverService';
import { Asset } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function PlayersScreen() {
    const { id } = useLocalSearchParams(); // League ID
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);
    const textColor = useThemeColor({}, 'text' as any);

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
            Alert.alert('Error', 'Failed to submit claim');
        } finally {
            setClaiming(null);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: cardBg, borderColor, color: textColor }]}
                    placeholder="Search players..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 20 }} />
            ) : (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {assets.map((asset) => (
                        <TouchableOpacity
                            key={asset.id}
                            style={[styles.assetCard, { backgroundColor: cardBg, borderColor }]}
                            onPress={() => router.push(`/fantasy/asset/${asset.id}`)}
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

                            <View style={styles.actionContainer}>
                                <ThemedText style={styles.price}>${asset.currentPrice.toFixed(2)}</ThemedText>
                                <TouchableOpacity
                                    style={[
                                        styles.claimButton,
                                        { backgroundColor: primaryColor, opacity: asset.isLocked ? 0.5 : 1 }
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 0,
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
    actionContainer: {
        alignItems: 'flex-end',
        gap: 8,
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
    },
    claimButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    claimButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: -2,
    },
});
