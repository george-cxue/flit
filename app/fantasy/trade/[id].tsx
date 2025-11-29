import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TradeService } from '@/src/services/fantasy/tradeService';
import { Trade } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TradeScreen() {
    const { id } = useLocalSearchParams(); // League ID
    const router = useRouter();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);

    useEffect(() => {
        const fetchTrades = async () => {
            if (typeof id === 'string') {
                const data = await TradeService.getTrades(id);
                setTrades(data);
            }
            setLoading(false);
        };
        fetchTrades();
    }, [id]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">Trade Center</ThemedText>
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: primaryColor }]}
                        onPress={() => router.push(`/fantasy/trade/propose/${id}`)}
                    >
                        <ThemedText style={styles.createButtonText}>+ New Trade</ThemedText>
                    </TouchableOpacity>
                </View>

                {trades.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor }]}>
                        <ThemedText style={styles.emptyText}>No active trades.</ThemedText>
                        <ThemedText style={styles.emptySubtext}>Propose a trade to get started!</ThemedText>
                    </View>
                ) : (
                    trades.map((trade) => (
                        <View key={trade.id} style={[styles.tradeCard, { backgroundColor: cardBg, borderColor }]}>
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
        case 'accepted': return '#4CAF50';
        case 'rejected': return '#FF4444';
        case 'pending': return '#FFC107';
        default: return '#999';
    }
};

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
        alignItems: 'center',
        marginBottom: 24,
    },
    createButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        opacity: 0.6,
    },
    tradeCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    tradeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tradeId: {
        fontWeight: '600',
        opacity: 0.7,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tradeDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
    },
});
