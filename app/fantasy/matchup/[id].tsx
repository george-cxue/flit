import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MatchupService } from '@/src/services/fantasy/matchupService';
import { Matchup } from '@/src/types/fantasy';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

export default function MatchupScreen() {
    const { id } = useLocalSearchParams(); // League ID
    const [matchup, setMatchup] = useState<Matchup | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);
    const successColor = '#4CAF50';
    const dangerColor = '#FF4444';

    useEffect(() => {
        const fetchMatchup = async () => {
            try {
                if (typeof id === 'string') {
                    const data = await MatchupService.getCurrentMatchup(id);
                    setMatchup(data);
                }
            } catch (error) {
                console.error('Failed to fetch matchup:', error);
                // Optionally, set an error state here to display a message to the user
            } finally {
                setLoading(false);
            }
        };
        fetchMatchup();
    }, [id]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={primaryColor} />
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

                <View style={[styles.matchupCard, { backgroundColor: cardBg, borderColor }]}>
                    {/* User A (You) */}
                    <View style={styles.teamContainer}>
                        <ThemedText style={styles.avatar}>{matchup.userAAvatar}</ThemedText>
                        <ThemedText style={styles.teamName}>{matchup.userAPortfolioName}</ThemedText>
                        <ThemedText style={[styles.score, { color: isUserAWinning ? successColor : undefined }]}>
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
                        <ThemedText style={[styles.score, { color: isUserBWinning ? successColor : undefined }]}>
                            {matchup.scoreB.toFixed(2)}%
                        </ThemedText>
                        {isUserBWinning && <ThemedText style={styles.winningIndicator}>Winning</ThemedText>}
                    </View>
                </View>

                {/* Detailed Stats (Placeholder) */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Matchup Details</ThemedText>
                    <View style={[styles.detailsCard, { backgroundColor: cardBg, borderColor }]}>
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
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    matchupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    teamContainer: {
        flex: 1,
        alignItems: 'center',
    },
    avatar: {
        fontSize: 32,
        marginBottom: 8,
    },
    teamName: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        height: 40, // Fixed height for alignment
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    winningIndicator: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    vsContainer: {
        paddingHorizontal: 12,
    },
    vsText: {
        fontSize: 16,
        fontWeight: 'bold',
        opacity: 0.5,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    detailsCard: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    placeholderText: {
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
