import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeagueService } from '@/src/services/fantasy/leagueService';
import { League } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LeagueDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [league, setLeague] = useState<League | null>(null);
    const [loading, setLoading] = useState(true);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);

    useEffect(() => {
        const fetchLeague = async () => {
            if (typeof id === 'string') {
                const data = await LeagueService.getLeagueById(id);
                setLeague(data || null);
            }
            setLoading(false);
        };
        fetchLeague();
    }, [id]);

    const handleEnterDraft = () => {
        router.push(`/fantasy/draft/${id}`);
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </ThemedView>
        );
    }

    if (!league) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ThemedText>League not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">{league.name}</ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: league.status === 'active' ? '#4CAF50' : '#FFC107' }]}>
                        <ThemedText style={styles.statusText}>{league.status.toUpperCase()}</ThemedText>
                    </View>
                </View>

                {/* Draft Status */}
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Draft</ThemedText>
                    <ThemedText style={styles.draftDate}>
                        {new Date(league.settings.draftDate).toLocaleString()}
                    </ThemedText>

                    {league.status === 'pre-draft' || league.status === 'drafting' ? (
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                            onPress={handleEnterDraft}
                        >
                            <ThemedText style={styles.primaryButtonText}>
                                {league.status === 'drafting' ? 'Enter Draft Room' : 'Enter Draft Lobby'}
                            </ThemedText>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <ThemedText style={[styles.completedText, { marginBottom: 12 }]}>Draft Completed</ThemedText>
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                                onPress={() => router.push(`/fantasy/portfolio/${id}`)}
                            >
                                <ThemedText style={styles.primaryButtonText}>My Portfolio</ThemedText>
                            </TouchableOpacity>

                            {league.status === 'active' && (
                                <View style={{ gap: 12, marginTop: 12 }}>
                                    <TouchableOpacity
                                        style={[styles.secondaryButton, { borderColor: primaryColor }]}
                                        onPress={() => router.push(`/fantasy/matchup/${id}`)}
                                    >
                                        <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>View Matchup</ThemedText>
                                    </TouchableOpacity>

                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <TouchableOpacity
                                            style={[styles.secondaryButton, { borderColor: primaryColor, flex: 1 }]}
                                            onPress={() => router.push(`/fantasy/players/${id}`)}
                                        >
                                            <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>Players</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.secondaryButton, { borderColor: primaryColor, flex: 1 }]}
                                            onPress={() => router.push(`/fantasy/trade/${id}`)}
                                        >
                                            <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>Trade</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Members */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Members</ThemedText>
                    {league.members.map((member) => (
                        <View key={member.id} style={[styles.memberRow, { borderBottomColor: borderColor }]}>
                            <View style={styles.memberInfo}>
                                <ThemedText style={styles.memberAvatar}>{member.avatar}</ThemedText>
                                <View>
                                    <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                                    <ThemedText style={styles.memberUsername}>{member.username}</ThemedText>
                                </View>
                            </View>
                            {member.id === league.adminUserId && (
                                <View style={[styles.adminBadge, { borderColor: primaryColor }]}>
                                    <ThemedText style={[styles.adminText, { color: primaryColor }]}>Admin</ThemedText>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Settings Summary */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>League Settings</ThemedText>
                    <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor }]}>
                        <SettingRow label="Season Length" value={`${league.settings.seasonLength} Weeks`} />
                        <SettingRow label="Portfolio Size" value={`${league.settings.portfolioSize} Slots`} />
                        <SettingRow label="Scoring" value={league.settings.scoringMethod} />
                        <SettingRow label="Draft Type" value={league.settings.draftType} />
                    </View>
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
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    cardTitle: {
        marginBottom: 8,
    },
    draftDate: {
        fontSize: 16,
        marginBottom: 16,
        opacity: 0.8,
    },
    primaryButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    secondaryButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    completedText: {
        opacity: 0.6,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    memberAvatar: {
        fontSize: 24,
    },
    memberName: {
        fontWeight: '600',
    },
    memberUsername: {
        fontSize: 12,
        opacity: 0.6,
    },
    adminBadge: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    adminText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    settingsCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
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
});
