import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { MatchupService } from '@/src/services/fantasy/matchupService';
import { Matchup } from '@/src/types/fantasy';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

const c = Colors.light;

export default function MatchupScreen() {
    const { id } = useLocalSearchParams(); // Group ID
    const [matchup, setMatchup] = useState<Matchup | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatchup = async () => {
            try {
                if (typeof id === 'string') {
                    const data = await MatchupService.getCurrentMatchup(id);
                    setMatchup(data);
                }
            } catch (error) {
                console.error('Failed to fetch matchup:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatchup();
    }, [id]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={c.primary} />
            </ThemedView>
        );
    }

    if (!matchup) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ThemedText>No active matchup found.</ThemedText>
            </ThemedView>
        );
    }

    const isUserAWinning = matchup.scoreA > matchup.scoreB;
    const isUserBWinning = matchup.scoreB > matchup.scoreA;

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Week {matchup.week}</ThemedText>
                    <ThemedText style={styles.subtitle}>Head-to-Head</ThemedText>
                </View>

                <View style={styles.matchupCard}>
                    {/* User A (You) */}
                    <View style={styles.teamContainer}>
                        <ThemedText style={styles.avatar}>{matchup.userAAvatar}</ThemedText>
                        <ThemedText style={styles.teamName}>{matchup.userAPortfolioName}</ThemedText>
                        <ThemedText style={[styles.score, isUserAWinning && { color: c.success }]}>
                            {matchup.scoreA.toFixed(2)}%
                        </ThemedText>
                        {isUserAWinning && <ThemedText style={styles.winningIndicator}>Winning</ThemedText>}
                    </View>

                    <View style={styles.vsContainer}>
                        <ThemedText style={styles.vsText}>VS</ThemedText>
                    </View>

                    {/* User B (Opponent) */}
                    <View style={styles.teamContainer}>
                        <ThemedText style={styles.avatar}>{matchup.userBAvatar}</ThemedText>
                        <ThemedText style={styles.teamName}>{matchup.userBPortfolioName}</ThemedText>
                        <ThemedText style={[styles.score, isUserBWinning && { color: c.success }]}>
                            {matchup.scoreB.toFixed(2)}%
                        </ThemedText>
                        {isUserBWinning && <ThemedText style={styles.winningIndicator}>Winning</ThemedText>}
                    </View>
                </View>

                {/* Detailed Stats (Placeholder) */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Matchup Details</ThemedText>
                    <View style={styles.detailsCard}>
                        <ThemedText style={styles.placeholderText}>
                            Detailed asset performance breakdown coming soon.
                        </ThemedText>
                    </View>
                </View>

            </ScrollView>
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
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography['title-md'],
        color: c.onSurfaceVariant,
    },
    matchupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: Radii.md,
        marginBottom: Spacing.lg,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    teamContainer: {
        flex: 1,
        alignItems: 'center',
    },
    avatar: {
        fontSize: 32,
        marginBottom: Spacing.sm,
    },
    teamName: {
        ...Typography['body-md'],
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
        marginBottom: Spacing.sm,
        height: 40, // Fixed height for alignment
    },
    score: {
        fontSize: 24,
        fontFamily: 'Manrope_700Bold',
        marginBottom: Spacing.xs,
    },
    winningIndicator: {
        ...Typography['label-md'],
        color: c.success,
        fontFamily: 'Inter_600SemiBold',
    },
    vsContainer: {
        paddingHorizontal: Spacing.md,
    },
    vsText: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
        color: c.onSurfaceVariant,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    detailsCard: {
        padding: Spacing.lg,
        borderRadius: Radii.md,
        alignItems: 'center',
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    placeholderText: {
        color: c.onSurfaceVariant,
        fontStyle: 'italic',
    },
});
