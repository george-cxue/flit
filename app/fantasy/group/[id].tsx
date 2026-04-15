import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow, AmbientShadow } from '@/constants/theme';
import { GroupService } from '@/src/services/fantasy/groupService';
import { Group } from '@/src/types/fantasy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '@/src/services/api';
import { useAuthContext } from '@/contexts/auth-context';

const c = Colors.light;

/** Splits names like "April 2026 Tournament" so the date and "Tournament" sit on two lines. */
function getTwoLineTournamentTitle(name: string): [string, string] | null {
    const m = name.match(/^(.+?\s+\d{4})\s+(Tournament)$/i);
    if (m) return [m[1], m[2]];
    const idx = name.indexOf(' Tournament');
    if (idx > 0) return [name.slice(0, idx), 'Tournament'];
    return null;
}

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

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthContext();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [membersWithPortfolios, setMembersWithPortfolios] = useState<MemberWithPortfolio[]>([]);

    useEffect(() => {
        const fetchGroupAndPortfolios = async () => {
            try {
                if (typeof id === 'string') {
                    const data = await GroupService.getGroupById(id);
                    setGroup(data || null);

                    if (data) {
                        // Fetch portfolio data for all members
                        const portfolioPromises = data.members.map(async (member: any) => {
                            try {
                                const response = await apiClient.get(`/fantasy-groups/${id}/portfolio/${member.id}`);
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
                setGroup(null);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupAndPortfolios();
    }, [id]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={c.primary} />
            </ThemedView>
        );
    }

    if (!group) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ThemedText>Group not found</ThemedText>
            </ThemedView>
        );
    }

    // Check if competition has started
    const now = new Date();
    const startDate = new Date(group.settings.startDate);
    const competitionStarted = now >= startDate;

    // Calculate end date based on competition period or use manually set endDate
    const getEndDate = () => {
        // Check if endDate was manually set (e.g., by ending the competition early)
        if (group.settings.endDate) {
            return new Date(group.settings.endDate);
        }

        const end = new Date(startDate);
        if (!group.settings.competitionPeriod) {
            // Default to 1 year if not specified
            end.setFullYear(end.getFullYear() + 1);
            return end;
        }
        switch (group.settings.competitionPeriod) {
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

    const formatPeriod = (period: string | undefined) => {
        if (!period) return 'Not specified';
        return period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const handleShareCode = async () => {
        if (!group.joinCode) return;

        try {
            await Share.share({
                message: `Join my group "${group.name}"! Use code: ${group.joinCode}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleStartCompetition = async () => {
        console.log('Start competition button pressed');

        try {
            console.log('Starting competition for group:', group.id);
            await GroupService.startCompetition(group.id);
            console.log('Competition started successfully');

            // Reload the page to show updated status
            const updatedGroup = await GroupService.getGroupById(group.id);
            console.log('Updated group:', updatedGroup);
            if (updatedGroup) {
                setGroup(updatedGroup);
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

    const handleLeaveGroup = () => {
        // Web-compatible confirmation
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(
                'Are you sure you want to leave this group? Your portfolio and all data for this group will be permanently deleted.'
            );
            if (confirmed) {
                performLeaveGroup();
            }
        } else {
            // Native alert for iOS/Android
            Alert.alert(
                'Leave Group',
                'Are you sure you want to leave this group? Your portfolio and all data for this group will be permanently deleted.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Leave',
                        style: 'destructive',
                        onPress: performLeaveGroup,
                    },
                ]
            );
        }
    };

    const performLeaveGroup = async () => {
        try {
            console.log('Leaving group:', group.id);
            const result = await GroupService.leaveGroup(group.id);
            console.log('Leave group result:', result);

            // Navigate back to group tab
            router.replace('/(tabs)/group');

            // Show success message after a short delay
            setTimeout(() => {
                const successMessage = result.groupDeleted
                    ? 'You left the group. The group was deleted as no members remain.'
                    : 'You have successfully left the group.';

                if (Platform.OS === 'web') {
                    window.alert(successMessage);
                } else {
                    Alert.alert('Success', successMessage);
                }
            }, 300);
        } catch (error) {
            console.error('Error leaving group:', error);
            const errorMessage = 'Failed to leave group. Please try again.';
            if (Platform.OS === 'web') {
                window.alert(errorMessage);
            } else {
                Alert.alert('Error', errorMessage);
            }
        }
    };

    const handleEndGroup = () => {
        // Web-compatible confirmation
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(
                'Are you sure you want to end this competition? This will immediately end the competition and cannot be undone.'
            );
            if (confirmed) {
                performEndGroup();
            }
        } else {
            // Native alert for iOS/Android
            Alert.alert(
                'End Competition',
                'Are you sure you want to end this competition? This will immediately end the competition and cannot be undone.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'End Competition',
                        style: 'destructive',
                        onPress: performEndGroup,
                    },
                ]
            );
        }
    };

    const performEndGroup = async () => {
        try {
            console.log('Ending group:', group.id);
            const result = await GroupService.endGroup(group.id);
            console.log('End group result:', result);

            // Reload the group to show updated status
            const updatedGroup = await GroupService.getGroupById(group.id);
            if (updatedGroup) {
                setGroup(updatedGroup);
            }

            // Show success message
            const successMessage = 'The competition has been ended. Final results are now available.';
            if (Platform.OS === 'web') {
                window.alert(successMessage);
            } else {
                Alert.alert('Success', successMessage);
            }
        } catch (error) {
            console.error('Error ending group:', error);
            const errorMessage = 'Failed to end competition. Please try again.';
            if (Platform.OS === 'web') {
                window.alert(errorMessage);
            } else {
                Alert.alert('Error', errorMessage);
            }
        }
    };

    const isAdmin = group.adminUserId === user?.id;

    console.log('Group admin check:', {
        adminUserId: group.adminUserId,
        currentUserId: user?.id,
        isAdmin,
        competitionStarted
    });

    const titleLines = getTwoLineTournamentTitle(group.name);

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.lg + insets.top }]}
            >
                <View style={styles.header}>
                    <View style={styles.titleColumn}>
                        {titleLines ? (
                            <>
                                <ThemedText type="title" style={styles.titleLine}>
                                    {titleLines[0]}
                                </ThemedText>
                                <ThemedText type="title" style={styles.titleLine}>
                                    {titleLines[1]}
                                </ThemedText>
                            </>
                        ) : (
                            <ThemedText type="title" style={styles.titleSingle}>
                                {group.name}
                            </ThemedText>
                        )}
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: competitionEnded ? c.onSurfaceVariant : competitionStarted ? c.success : c.warning }
                    ]}>
                        <ThemedText style={styles.statusText}>
                            {competitionEnded ? 'COMPLETED' : competitionStarted ? 'ACTIVE' : 'PENDING'}
                        </ThemedText>
                    </View>
                </View>

                {/* Competition Status */}
                <View style={styles.card}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Competition Period</ThemedText>
                    <ThemedText style={styles.periodText}>{formatPeriod(group.settings.competitionPeriod)}</ThemedText>
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
                            <ThemedText style={[styles.notStartedText, { marginTop: Spacing.sm }]}>
                                Players can start trading once the competition begins.
                            </ThemedText>

                            {isAdmin && (
                                <TouchableOpacity
                                    style={[styles.primaryButton, { marginTop: Spacing.md }]}
                                    onPress={handleStartCompetition}
                                >
                                    <ThemedText style={styles.primaryButtonText}>Start Competition Now</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.primaryButton, { marginTop: Spacing.md }]}
                            onPress={() => {
                                // Navigate to portfolio tab with this group selected
                                router.push({
                                    pathname: '/(tabs)/portfolio',
                                    params: { leagueId: group.id }
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
                {group.joinCode && !competitionEnded && (
                    <View style={styles.card}>
                        <ThemedText type="subtitle" style={styles.cardTitle}>Group Join Code</ThemedText>
                        <View style={styles.joinCodeContainer}>
                            <ThemedText style={styles.joinCodeText}>{group.joinCode}</ThemedText>
                            <TouchableOpacity
                                style={styles.shareButton}
                                onPress={handleShareCode}
                            >
                                <ThemedText style={styles.shareButtonText}>Share</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <ThemedText style={styles.helperText}>
                            Share this code with friends to invite them to your group
                        </ThemedText>
                    </View>
                )}

                {/* Portfolio Rankings */}
                {competitionStarted && (
                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Portfolio Rankings</ThemedText>
                        {membersWithPortfolios.map((member, index) => {
                            const isCurrentUser = member.id === user?.id;
                            const displayName = member.firstName && member.lastName
                                ? `${member.firstName} ${member.lastName}`
                                : member.name || member.username;

                            return (
                                <TouchableOpacity
                                    key={member.id}
                                    style={styles.rankingRow}
                                    onPress={() => {
                                        if (isCurrentUser) {
                                            // Navigate to portfolio tab for editing
                                            router.push({
                                                pathname: '/(tabs)/portfolio',
                                                params: { leagueId: group.id }
                                            });
                                        } else {
                                            // Navigate to read-only portfolio view
                                            router.push(`/fantasy/portfolio/${group.id}?userId=${member.id}&readonly=true`);
                                        }
                                    }}
                                >
                                    <View style={styles.rankInfo}>
                                        <View style={[
                                            styles.rankBadge,
                                            { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : c.surfaceContainerHigh }
                                        ]}>
                                            <ThemedText style={[styles.rankText, { color: index < 3 ? '#000' : c.onSurfaceVariant }]}>
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
                                            { color: member.returnPercent >= 0 ? c.success : c.danger }
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
                        {group.members.map((member, index) => (
                            <React.Fragment key={member.id}>
                                <View style={styles.memberRow}>
                                    <View style={styles.memberInfo}>
                                        <ThemedText style={styles.memberAvatar}>{member.avatar}</ThemedText>
                                        <View>
                                            <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                                            <ThemedText style={styles.memberUsername}>{member.username}</ThemedText>
                                        </View>
                                    </View>
                                    {member.id === group.adminUserId && (
                                        <View style={styles.adminBadge}>
                                            <ThemedText style={styles.adminText}>Admin</ThemedText>
                                        </View>
                                    )}
                                </View>
                                {index < group.members.length - 1 && (
                                    <View style={styles.floatingDivider} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                )}

                {/* Settings Summary */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Group Settings</ThemedText>
                    <View style={styles.settingsCard}>
                        <SettingRow label="Group Size" value={`${group.settings.groupSize} Players`} />
                        <SettingRow label="Starting Balance" value={`$${group.settings.startingBalance.toLocaleString()}`} />
                        <SettingRow label="Scoring" value={group.settings.scoringMethod} />
                        <SettingRow label="Trading" value={group.settings.tradingEnabled ? 'Enabled' : 'Disabled'} />
                    </View>
                </View>

                {/* Admin: End Group */}
                {isAdmin && !competitionEnded && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.dangerButton}
                            onPress={handleEndGroup}
                        >
                            <ThemedText style={styles.dangerButtonText}>
                                End Competition
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Leave Group */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.dangerButton}
                        onPress={handleLeaveGroup}
                    >
                        <ThemedText style={styles.dangerButtonText}>
                            Leave Group
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
        paddingHorizontal: Spacing.lg,
        paddingBottom: 40,
    },
    header: {
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    titleColumn: {
        flex: 1,
        minWidth: 0,
    },
    titleLine: {
        lineHeight: 34,
    },
    titleSingle: {
        flexShrink: 1,
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
    card: {
        padding: Spacing.lg,
        borderRadius: Radii.md,
        marginBottom: Spacing.lg,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    cardTitle: {
        marginBottom: Spacing.sm,
    },
    periodText: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
        marginBottom: Spacing.xs,
    },
    dateRange: {
        marginBottom: Spacing.md,
    },
    dateText: {
        ...Typography['body-md'],
        color: c.onSurfaceVariant,
    },
    notStartedContainer: {
        marginTop: Spacing.md,
        padding: Spacing.md,
        backgroundColor: c.surfaceContainerLow,
        borderRadius: Radii.sm,
    },
    notStartedText: {
        ...Typography['body-md'],
        color: c.onSurfaceVariant,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: c.primary,
        paddingVertical: Spacing.md,
        borderRadius: Radii.lg,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: c.onPrimary,
        fontFamily: 'Inter_600SemiBold',
        ...Typography['title-md'],
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    rankingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        borderRadius: Radii.md,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    rankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
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
        ...Typography['label-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    floatingDivider: {
        height: 1,
        backgroundColor: c.surfaceContainerHigh,
        marginHorizontal: '10%',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    memberAvatar: {
        fontSize: 24,
    },
    memberName: {
        fontFamily: 'Inter_600SemiBold',
    },
    memberUsername: {
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
    },
    performanceInfo: {
        alignItems: 'flex-end',
    },
    portfolioValue: {
        fontFamily: 'Inter_600SemiBold',
        ...Typography['title-md'],
    },
    returnPercent: {
        ...Typography['body-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    adminBadge: {
        backgroundColor: c.primaryContainer,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radii.sm,
    },
    adminText: {
        ...Typography['label-md'],
        fontFamily: 'Inter_600SemiBold',
        color: c.onPrimary,
    },
    settingsCard: {
        padding: Spacing.md,
        borderRadius: Radii.md,
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
    joinCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    joinCodeText: {
        fontSize: 24,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 2,
    },
    shareButton: {
        backgroundColor: c.primary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: Radii.lg,
    },
    shareButtonText: {
        color: c.onPrimary,
        fontFamily: 'Inter_600SemiBold',
        ...Typography['body-md'],
    },
    helperText: {
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
        marginTop: Spacing.xs,
    },
    dangerButton: {
        paddingVertical: 14,
        borderRadius: Radii.lg,
        alignItems: 'center',
        backgroundColor: c.surfaceContainerLow,
    },
    dangerButtonText: {
        fontFamily: 'Inter_600SemiBold',
        ...Typography['title-md'],
        color: c.danger,
    },
});
