import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeagueService } from '@/src/services/fantasy/leagueService';
import { League } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View, Share, Platform } from 'react-native';
import { apiClient } from '@/src/services/api';

interface MemberWithPortfolio {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    name?: string;
    portfolioValue: number;
    returnPercent: number;
}

export default function LeagueDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [league, setLeague] = useState<League | null>(null);
    const [loading, setLoading] = useState(true);
    const [membersWithPortfolios, setMembersWithPortfolios] = useState<MemberWithPortfolio[]>([]);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);

    useEffect(() => {
        const fetchLeagueAndPortfolios = async () => {
            try {
                if (typeof id === 'string') {
                    const data = await LeagueService.getLeagueById(id);
                    setLeague(data || null);
                    
                    if (data) {
                        // Fetch portfolio data for all members
                        const portfolioPromises = data.members.map(async (member: any) => {
                            try {
                                const response = await apiClient.get(`/fantasy-leagues/${id}/portfolio/${member.id}`);
                                const portfolio = response.data;
                                
                                // Calculate total value the same way as portfolio context
                                const totalValue = portfolio.totalValue || portfolio.cashBalance;
                                const startingBalance = data.settings.startingBalance || 10000;
                                const returnPercent = ((totalValue - startingBalance) / startingBalance) * 100;
                                
                                return {
                                    ...member,
                                    portfolioValue: totalValue,
                                    returnPercent: returnPercent,
                                };
                            } catch (error) {
                                console.error(`Failed to fetch portfolio for member ${member.id}:`, error);
                                // Return member with starting balance as fallback
                                const startingBalance = data.settings.startingBalance || 10000;
                                return {
                                    ...member,
                                    portfolioValue: startingBalance,
                                    returnPercent: 0,
                                };
                            }
                        });
                        
                        const membersWithData = await Promise.all(portfolioPromises);
                        // Sort by portfolio value (highest to lowest)
                        const sortedMembers = membersWithData.sort((a, b) => b.portfolioValue - a.portfolioValue);
                        setMembersWithPortfolios(sortedMembers);
                    }
                }
            } catch (error) {
                setLeague(null);
            } finally {
                setLoading(false);
            }
        };
        fetchLeagueAndPortfolios();
    }, [id]);

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

    // Check if competition has started
    const now = new Date();
    const startDate = new Date(league.settings.startDate);
    const competitionStarted = now >= startDate;

    // Calculate end date based on competition period
    const getEndDate = () => {
        const end = new Date(startDate);
        switch (league.settings.competitionPeriod) {
            case '1_week': end.setDate(end.getDate() + 7); break;
            case '2_weeks': end.setDate(end.getDate() + 14); break;
            case '1_month': end.setMonth(end.getMonth() + 1); break;
            case '3_months': end.setMonth(end.getMonth() + 3); break;
            case '6_months': end.setMonth(end.getMonth() + 6); break;
            case '1_year': end.setFullYear(end.getFullYear() + 1); break;
        }
        return end;
    };

    const endDate = getEndDate();
    const competitionEnded = now >= endDate;

    const formatPeriod = (period: string) => {
        return period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const handleShareCode = async () => {
        if (!league.joinCode) return;

        try {
            await Share.share({
                message: `Join my league "${league.name}"! Use code: ${league.joinCode}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleStartCompetition = async () => {
        console.log('Start competition button pressed');

        try {
            console.log('Starting competition for league:', league.id);
            await LeagueService.startCompetition(league.id);
            console.log('Competition started successfully');

            // Reload the page to show updated status
            const updatedLeague = await LeagueService.getLeagueById(league.id);
            console.log('Updated league:', updatedLeague);
            if (updatedLeague) {
                setLeague(updatedLeague);
            }
            
            if (Platform.OS === 'web') {
                window.alert('Competition started! Status should now be ACTIVE.');
            } else {
                Alert.alert('Success', 'Competition started! Status should now be ACTIVE.');
            }
        } catch (error) {
            console.error('Start competition error:', error);
            if (Platform.OS === 'web') {
                window.alert('Failed to start competition. Please try again.');
            } else {
                Alert.alert('Error', 'Failed to start competition. Please try again.');
            }
        }
    };

    const handleLeaveLeague = () => {
        // Web-compatible confirmation
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(
                'Are you sure you want to leave this league? Your portfolio and all data for this league will be permanently deleted.'
            );
            if (confirmed) {
                performLeaveLeague();
            }
        } else {
            // Native alert for iOS/Android
            Alert.alert(
                'Leave League',
                'Are you sure you want to leave this league? Your portfolio and all data for this league will be permanently deleted.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Leave',
                        style: 'destructive',
                        onPress: performLeaveLeague,
                    },
                ]
            );
        }
    };

    const performLeaveLeague = async () => {
        try {
            console.log('Leaving league:', league.id);
            const result = await LeagueService.leaveLeague(league.id);
            console.log('Leave league result:', result);

            // Navigate back to league tab
            router.replace('/(tabs)/league');

            // Show success message after a short delay
            setTimeout(() => {
                const successMessage = result.leagueDeleted 
                    ? 'You left the league. The league was deleted as no members remain.'
                    : 'You have successfully left the league.';
                
                if (Platform.OS === 'web') {
                    window.alert(successMessage);
                } else {
                    Alert.alert('Success', successMessage);
                }
            }, 300);
        } catch (error) {
            console.error('Error leaving league:', error);
            const errorMessage = 'Failed to leave league. Please try again.';
            if (Platform.OS === 'web') {
                window.alert(errorMessage);
            } else {
                Alert.alert('Error', errorMessage);
            }
        }
    };

    const isAdmin = league.adminUserId === 'user_1'; // TODO: Get actual current user ID

    console.log('League admin check:', {
        adminUserId: league.adminUserId,
        isAdmin,
        competitionStarted
    });

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">{league.name}</ThemedText>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: competitionEnded ? '#9E9E9E' : competitionStarted ? '#4CAF50' : '#FFC107' }
                    ]}>
                        <ThemedText style={styles.statusText}>
                            {competitionEnded ? 'COMPLETED' : competitionStarted ? 'ACTIVE' : 'PENDING'}
                        </ThemedText>
                    </View>
                </View>

                {/* Competition Status */}
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Competition Period</ThemedText>
                    <ThemedText style={styles.periodText}>{formatPeriod(league.settings.competitionPeriod)}</ThemedText>
                    <View style={styles.dateRange}>
                        <ThemedText style={styles.dateText}>
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </ThemedText>
                    </View>

                    {!competitionStarted ? (
                        <View style={styles.notStartedContainer}>
                            <ThemedText style={styles.notStartedText}>
                                Competition starts on {startDate.toLocaleString()}
                            </ThemedText>
                            <ThemedText style={[styles.notStartedText, { marginTop: 8 }]}>
                                Players can start trading once the competition begins.
                            </ThemedText>

                            {isAdmin && (
                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: primaryColor, marginTop: 12 }]}
                                    onPress={handleStartCompetition}
                                >
                                    <ThemedText style={styles.primaryButtonText}>Start Competition Now</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: primaryColor, marginTop: 12 }]}
                            onPress={() => {
                                // Navigate to portfolio tab with this league selected
                                router.push({
                                    pathname: '/(tabs)/portfolio',
                                    params: { leagueId: league.id }
                                });
                            }}
                        >
                            <ThemedText style={styles.primaryButtonText}>
                                {competitionEnded ? 'View Final Results' : 'Manage Portfolio'}
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Join Code */}
                {league.joinCode && !competitionEnded && (
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                        <ThemedText type="subtitle" style={styles.cardTitle}>League Join Code</ThemedText>
                        <View style={styles.joinCodeContainer}>
                            <ThemedText style={styles.joinCodeText}>{league.joinCode}</ThemedText>
                            <TouchableOpacity
                                style={[styles.shareButton, { backgroundColor: primaryColor }]}
                                onPress={handleShareCode}
                            >
                                <ThemedText style={styles.shareButtonText}>Share</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <ThemedText style={styles.helperText}>
                            Share this code with friends to invite them to your league
                        </ThemedText>
                    </View>
                )}

                {/* Portfolio Rankings */}
                {competitionStarted && (
                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Portfolio Rankings</ThemedText>
                        {membersWithPortfolios.map((member, index) => {
                            const isCurrentUser = member.id === 'user_1'; // TODO: Get actual current user ID
                            const displayName = member.firstName && member.lastName 
                                ? `${member.firstName} ${member.lastName}` 
                                : member.name || member.username;

                            return (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[styles.rankingRow, { borderBottomColor: borderColor, backgroundColor: cardBg }]}
                                    onPress={() => {
                                        if (isCurrentUser) {
                                            // Navigate to portfolio tab for editing
                                            router.push({
                                                pathname: '/(tabs)/portfolio',
                                                params: { leagueId: league.id }
                                            });
                                        } else {
                                            // Navigate to read-only portfolio view
                                            router.push(`/fantasy/portfolio/${league.id}?userId=${member.id}&readonly=true`);
                                        }
                                    }}
                                >
                                    <View style={styles.rankInfo}>
                                        <View style={[
                                            styles.rankBadge,
                                            { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#E0E0E0' }
                                        ]}>
                                            <ThemedText style={[styles.rankText, { color: index < 3 ? '#000' : '#666' }]}>
                                                #{index + 1}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.memberInfo}>
                                            <ThemedText style={styles.memberAvatar}>{member.avatar || '👤'}</ThemedText>
                                            <View>
                                                <ThemedText style={styles.memberName}>
                                                    {displayName}
                                                    {isCurrentUser && ' (You)'}
                                                </ThemedText>
                                                <ThemedText style={styles.memberUsername}>@{member.username}</ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.performanceInfo}>
                                        <ThemedText style={styles.portfolioValue}>
                                            ${member.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </ThemedText>
                                        <ThemedText style={[
                                            styles.returnPercent,
                                            { color: member.returnPercent >= 0 ? '#4CAF50' : '#F44336' }
                                        ]}>
                                            {member.returnPercent >= 0 ? '+' : ''}{member.returnPercent.toFixed(2)}%
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Members */}
                {!competitionStarted && (
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
                )}

                {/* Settings Summary */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>League Settings</ThemedText>
                    <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor }]}>
                        <SettingRow label="League Size" value={`${league.settings.leagueSize} Players`} />
                        <SettingRow label="Starting Balance" value={`$${league.settings.startingBalance.toLocaleString()}`} />
                        <SettingRow label="Scoring" value={league.settings.scoringMethod} />
                        <SettingRow label="Trading" value={league.settings.tradingEnabled ? 'Enabled' : 'Disabled'} />
                    </View>
                </View>

                {/* Leave League */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.dangerButton, { borderColor: '#F44336' }]}
                        onPress={handleLeaveLeague}
                    >
                        <ThemedText style={[styles.dangerButtonText, { color: '#F44336' }]}>
                            Leave League
                        </ThemedText>
                    </TouchableOpacity>
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
    periodText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    dateRange: {
        marginBottom: 12,
    },
    dateText: {
        fontSize: 14,
        opacity: 0.7,
    },
    notStartedContainer: {
        marginTop: 12,
        padding: 16,
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderRadius: 8,
    },
    notStartedText: {
        fontSize: 14,
        opacity: 0.8,
        textAlign: 'center',
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    rankingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        borderBottomWidth: 1,
    },
    rankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: 'bold',
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
    performanceInfo: {
        alignItems: 'flex-end',
    },
    portfolioValue: {
        fontWeight: '700',
        fontSize: 16,
    },
    returnPercent: {
        fontSize: 14,
        fontWeight: '600',
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
    joinCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 8,
    },
    joinCodeText: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    shareButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    helperText: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
    dangerButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    dangerButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});
