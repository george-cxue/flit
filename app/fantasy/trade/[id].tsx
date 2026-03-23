import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { TradeService } from '@/src/services/fantasy/tradeService';
import { Trade } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const c = Colors.light;

export default function TradeScreen() {
    const { id } = useLocalSearchParams(); // Group ID
    const router = useRouter();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                if (typeof id === 'string') {
                    const data = await TradeService.getTrades(id);
                    setTrades(data);
                }
            } catch (error) {
                console.error('Failed to fetch trades:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrades();
    }, [id]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={c.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">Trade Center</ThemedText>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push(`/fantasy/trade/propose/${id}`)}
                    >
                        <ThemedText style={styles.createButtonText}>+ New Trade</ThemedText>
                    </TouchableOpacity>
                </View>

                {trades.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ThemedText style={styles.emptyText}>No active trades.</ThemedText>
                        <ThemedText style={styles.emptySubtext}>Propose a trade to get started!</ThemedText>
                    </View>
                ) : (
                    trades.map((trade) => (
                        <View key={trade.id} style={styles.tradeCard}>
                            <View style={styles.tradeHeader}>
                                <ThemedText style={styles.tradeId}>Trade #{trade.id.slice(-4)}</ThemedText>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trade.status) }]}>
                                    <ThemedText style={styles.statusText}>{trade.status.toUpperCase()}</ThemedText>
                                </View>
                            </View>
                            <View style={styles.tradeDetails}>
                                <View>
                                    <ThemedText style={styles.label}>You Give:</ThemedText>
                                    <ThemedText>{trade.offeredAssets.length} Assets</ThemedText>
                                </View>
                                <View>
                                    <ThemedText style={styles.label}>You Get:</ThemedText>
                                    <ThemedText>{trade.requestedAssets.length} Assets</ThemedText>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </ThemedView>
    );
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'accepted': return c.success;
        case 'rejected': return c.danger;
        case 'pending': return c.warning;
        default: return c.onSurfaceVariant;
    }
};

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
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    createButton: {
        backgroundColor: c.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radii.lg,
    },
    createButtonText: {
        color: c.onPrimary,
        fontFamily: 'Inter_600SemiBold',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        borderRadius: Radii.md,
        backgroundColor: c.surfaceContainerLow,
    },
    emptyText: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
        marginBottom: Spacing.sm,
    },
    emptySubtext: {
        color: c.onSurfaceVariant,
    },
    tradeCard: {
        padding: Spacing.md,
        borderRadius: Radii.md,
        marginBottom: Spacing.md,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    tradeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    tradeId: {
        fontFamily: 'Inter_600SemiBold',
        color: c.onSurfaceVariant,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Radii.sm,
    },
    statusText: {
        color: c.onPrimary,
        ...Typography['label-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    tradeDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
        marginBottom: Spacing.xs,
    },
});
