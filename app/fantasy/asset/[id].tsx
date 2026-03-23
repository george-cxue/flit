import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { MarketService } from '@/src/services/fantasy/marketService';
import { Asset } from '@/src/types/fantasy';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

const c = Colors.light;

export default function AssetScreen() {
    const { id } = useLocalSearchParams(); // Asset ID
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                if (typeof id === 'string') {
                    const data = await MarketService.getAssetById(id);
                    setAsset(data || null);
                }
            } catch (error) {
                setAsset(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAsset();
    }, [id]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={c.primary} />
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
                        <ThemedText style={{ color: asset.changePercent >= 0 ? c.success : c.danger, textAlign: 'right' }}>
                            {asset.changePercent > 0 ? '+' : ''}{asset.changePercent}%
                        </ThemedText>
                    </View>
                </View>

                {/* Lock Status */}
                {asset.isLocked && (
                    <View style={styles.lockCard}>
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
                <View style={styles.card}>
                    <SettingRow label="Type" value={asset.type} />
                    <SettingRow label="Tier" value={asset.tier} />
                    <SettingRow label="Risk Level" value="Moderate" />
                </View>

                {/* Chart Placeholder */}
                <View style={styles.chartContainer}>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    assetName: {
        ...Typography['title-md'],
        color: c.onSurfaceVariant,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    lockCard: {
        padding: Spacing.md,
        borderRadius: Radii.md,
        marginBottom: Spacing.lg,
        backgroundColor: c.surfaceContainerLow,
    },
    lockTitle: {
        fontFamily: 'Inter_600SemiBold',
        marginBottom: Spacing.sm,
        color: c.warning,
    },
    lockText: {
        marginBottom: Spacing.sm,
        color: c.warning,
    },
    lessonItem: {
        marginLeft: Spacing.sm,
        color: c.warning,
        fontFamily: 'Inter_600SemiBold',
    },
    card: {
        padding: Spacing.md,
        borderRadius: Radii.md,
        marginBottom: Spacing.lg,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    settingLabel: {
        color: c.onSurfaceVariant,
    },
    settingValue: {
        fontFamily: 'Inter_600SemiBold',
    },
    chartContainer: {
        height: 200,
        borderRadius: Radii.md,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    chartPlaceholder: {
        color: c.onSurfaceVariant,
        fontStyle: 'italic',
    },
});
