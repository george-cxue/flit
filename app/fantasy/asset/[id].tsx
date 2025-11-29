import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MarketService } from '@/src/services/fantasy/marketService';
import { Asset } from '@/src/types/fantasy';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

export default function AssetScreen() {
    const { id } = useLocalSearchParams(); // Asset ID
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);

    useEffect(() => {
        const fetchAsset = async () => {
            if (typeof id === 'string') {
                const data = await MarketService.getAssetDetails(id);
                setAsset(data || null);
            }
            setLoading(false);
        };
        fetchAsset();
    }, [id]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </ThemedView>
        );
    }

    if (!asset) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ThemedText>Asset not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <ThemedText type="title">{asset.ticker}</ThemedText>
                        <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
                    </View>
                    <View style={styles.priceContainer}>
                        <ThemedText type="title">${asset.currentPrice.toFixed(2)}</ThemedText>
                        <ThemedText style={{ color: asset.changePercent >= 0 ? '#4CAF50' : '#FF4444', textAlign: 'right' }}>
                            {asset.changePercent > 0 ? '+' : ''}{asset.changePercent}%
                        </ThemedText>
                    </View>
                </View>

                {/* Lock Status */}
                {asset.isLocked && (
                    <View style={[styles.lockCard, { borderColor: '#FFC107', backgroundColor: '#FFF8E1' }]}>
                        <ThemedText style={styles.lockTitle}>🔒 Asset Locked</ThemedText>
                        <ThemedText style={styles.lockText}>
                            Complete the following lessons to unlock this asset:
                        </ThemedText>
                        {asset.requiredLessons.map((lesson, index) => (
                            <ThemedText key={index} style={styles.lessonItem}>• {lesson}</ThemedText>
                        ))}
                    </View>
                )}

                {/* Details */}
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <SettingRow label="Type" value={asset.type} />
                    <SettingRow label="Tier" value={asset.tier} />
                    <SettingRow label="Risk Level" value="Moderate" />
                </View>

                {/* Chart Placeholder */}
                <View style={[styles.chartContainer, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText style={styles.chartPlaceholder}>Price Chart Coming Soon</ThemedText>
                </View>

            </ScrollView>
        </ThemedView>
    );
}

const SettingRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.settingRow}>
        <ThemedText style={styles.settingLabel}>{label}</ThemedText>
        <ThemedText style={styles.settingValue}>{value}</ThemedText>
    </View>
);

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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    assetName: {
        fontSize: 16,
        opacity: 0.7,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    lockCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    lockTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#F57F17',
    },
    lockText: {
        marginBottom: 8,
        color: '#F57F17',
    },
    lessonItem: {
        marginLeft: 8,
        color: '#F57F17',
        fontWeight: '600',
    },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    settingLabel: {
        opacity: 0.7,
    },
    settingValue: {
        fontWeight: '600',
    },
    chartContainer: {
        height: 200,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartPlaceholder: {
        opacity: 0.5,
        fontStyle: 'italic',
    },
});
