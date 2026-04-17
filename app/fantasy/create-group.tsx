import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { GroupService } from '@/src/services/fantasy/groupService';
import { AssetType, GroupSettings } from '@/src/types/fantasy';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '@/contexts/auth-context';
import { useLessons } from '@/hooks/use-lessons';

const c = Colors.light;

export default function CreateGroupScreen() {
    const router = useRouter();
    const { userId } = useAuthContext();
    const { portfolioBalance } = useLessons(userId);

    // Required Settings
    const [groupName, setGroupName] = useState('');
    const [groupSize, setGroupSize] = useState(12);
    const [startingBalance, setStartingBalance] = useState(10000);
    const [competitionPeriod, setCompetitionPeriod] = useState<'1_week' | '2_weeks' | '1_month' | '3_months' | '6_months' | '1_year'>('1_month');
    const [startDate] = useState(new Date(Date.now() + 86400000).toISOString()); // Default tomorrow

    // Advanced Settings Toggle
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced Settings (Defaults)
    const [scoringMethod, setScoringMethod] = useState<'Total Return %' | 'Absolute Gain $'>('Total Return %');
    const [enabledAssetClasses, setEnabledAssetClasses] = useState<AssetType[]>(['Stock']);
    const [minAssetPrice, setMinAssetPrice] = useState('1.00');
    const [allowShortSelling, setAllowShortSelling] = useState(false);
    const [tradingEnabled, setTradingEnabled] = useState(true);

    const [loading, setLoading] = useState(false);

    const toggleAssetClass = (type: AssetType) => {
        if (enabledAssetClasses.includes(type)) {
            setEnabledAssetClasses(enabledAssetClasses.filter(t => t !== type));
        } else {
            setEnabledAssetClasses([...enabledAssetClasses, type]);
        }
    };

    const handleCreate = async () => {
        if (!groupName.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }
        if (startingBalance > portfolioBalance) {
            Alert.alert(
                'Insufficient Learning Dollars',
                `Starting balance cannot exceed your learning dollars ($${portfolioBalance.toLocaleString()}).`
            );
            return;
        }

        setLoading(true);
        try {
            const settings: GroupSettings = {
                groupSize,
                startingBalance,
                competitionPeriod,
                startDate,
                scoringMethod,
                enabledAssetClasses,
                minAssetPrice: parseFloat(minAssetPrice) || 0,
                allowShortSelling,
                tradingEnabled,
            };

            const newGroup = await GroupService.createGroup(groupName, settings, portfolioBalance);

            // Navigate directly to the new group's detail page
            router.push(`/fantasy/group/${newGroup.id}`);
        } catch (error) {
            console.error('Failed to create group:', error);
            Alert.alert('Error', error instanceof Error && error.message ? error.message : 'Failed to create group');
            setLoading(false);
        }
    };

    const renderOptionButton = (
        label: string | number,
        isSelected: boolean,
        onPress: () => void
    ) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                { backgroundColor: c.secondaryContainer },
                isSelected && { backgroundColor: c.primary }
            ]}
            onPress={onPress}
        >
            <ThemedText style={[
                styles.optionText,
                { color: c.onSurface },
                isSelected && { color: c.onPrimary }
            ]}>{label}</ThemedText>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">Create Group</ThemedText>
                </View>

                {/* REQUIRED SETTINGS */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Required Settings</ThemedText>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Group Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Wall Street Warriors"
                            placeholderTextColor={c.onSurfaceVariant}
                            value={groupName}
                            onChangeText={setGroupName}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Group Size</ThemedText>
                        <View style={styles.optionsRow}>
                            {[4, 6, 8, 10, 12].map(size => (
                                <View key={size} style={{ flex: 1 }}>
                                    {renderOptionButton(size, groupSize === size, () => setGroupSize(size))}
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Starting Balance</ThemedText>
                        <View style={styles.row}>
                            <ThemedText>${startingBalance.toLocaleString()}</ThemedText>
                            <View style={styles.stepper}>
                                <TouchableOpacity onPress={() => setStartingBalance(Math.max(1000, startingBalance - 1000))}><ThemedText style={styles.stepperBtn}>-</ThemedText></TouchableOpacity>
                                <TouchableOpacity onPress={() => setStartingBalance(Math.min(1000000, startingBalance + 1000))}><ThemedText style={styles.stepperBtn}>+</ThemedText></TouchableOpacity>
                            </View>
                        </View>
                        <ThemedText style={styles.helperText}>Amount each player starts with</ThemedText>
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Competition Period</ThemedText>
                        <View style={styles.optionsRow}>
                            {[
                                { value: '1_week', label: '1 Week' },
                                { value: '2_weeks', label: '2 Weeks' },
                                { value: '1_month', label: '1 Month' },
                            ].map(period => (
                                <View key={period.value} style={{ flex: 1 }}>
                                    {renderOptionButton(period.label, competitionPeriod === period.value, () => setCompetitionPeriod(period.value as any))}
                                </View>
                            ))}
                        </View>
                        <View style={[styles.optionsRow, { marginTop: Spacing.sm }]}>
                            {[
                                { value: '3_months', label: '3 Months' },
                                { value: '6_months', label: '6 Months' },
                                { value: '1_year', label: '1 Year' },
                            ].map(period => (
                                <View key={period.value} style={{ flex: 1 }}>
                                    {renderOptionButton(period.label, competitionPeriod === period.value, () => setCompetitionPeriod(period.value as any))}
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Start Date</ThemedText>
                        <View style={styles.dateDisplay}>
                            <ThemedText>{new Date(startDate).toLocaleString()}</ThemedText>
                        </View>
                        <ThemedText style={styles.helperText}>Competition begins tomorrow (Mock)</ThemedText>
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Scoring Method</ThemedText>
                        <View style={styles.optionsRow}>
                            <View style={{ flex: 1 }}>
                                {renderOptionButton('Total Return %', scoringMethod === 'Total Return %', () => setScoringMethod('Total Return %'))}
                            </View>
                            <View style={{ flex: 1 }}>
                                {renderOptionButton('Absolute Gain $', scoringMethod === 'Absolute Gain $', () => setScoringMethod('Absolute Gain $'))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Asset Classes</ThemedText>
                        <View style={styles.card}>
                            {(['Stock', 'ETF', 'Commodity', 'REIT'] as AssetType[]).map((type, index) => (
                                <React.Fragment key={type}>
                                    <View style={styles.switchRow}>
                                        <ThemedText>{type}</ThemedText>
                                        <Switch
                                            value={enabledAssetClasses.includes(type)}
                                            onValueChange={() => toggleAssetClass(type)}
                                            trackColor={{ false: c.surfaceContainerHigh, true: c.primary }}
                                        />
                                    </View>
                                    {index < 3 && (
                                        <View style={styles.floatingDivider} />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ADVANCED SETTINGS TOGGLE */}
                <View style={styles.advancedToggleWrapper}>
                    <View style={styles.floatingDivider} />
                    <TouchableOpacity
                        style={styles.advancedToggle}
                        onPress={() => setShowAdvanced(!showAdvanced)}
                    >
                        <ThemedText type="defaultSemiBold">Advanced Settings</ThemedText>
                        <ThemedText>{showAdvanced ? '▲' : '▼'}</ThemedText>
                    </TouchableOpacity>
                    <View style={styles.floatingDivider} />
                </View>

                {/* ADVANCED SETTINGS SECTION */}
                {showAdvanced && (
                    <View style={styles.section}>
                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Min Asset Price ($)</ThemedText>
                            <TextInput
                                style={styles.input}
                                value={minAssetPrice}
                                onChangeText={setMinAssetPrice}
                                keyboardType="numeric"
                            />
                            <ThemedText style={styles.helperText}>Minimum stock price to be available</ThemedText>
                        </View>

                        <View style={[styles.switchRow, { paddingHorizontal: 0 }]}>
                            <View>
                                <ThemedText style={styles.label}>Trading Enabled</ThemedText>
                                <ThemedText style={[styles.helperText, { marginTop: 2 }]}>Allow buying/selling after start</ThemedText>
                            </View>
                            <Switch
                                value={tradingEnabled}
                                onValueChange={setTradingEnabled}
                                trackColor={{ false: c.surfaceContainerHigh, true: c.primary }}
                            />
                        </View>

                        <View style={[styles.switchRow, { paddingHorizontal: 0 }]}>
                            <View>
                                <ThemedText style={styles.label}>Allow Short Selling</ThemedText>
                                <ThemedText style={[styles.helperText, { marginTop: 2 }]}>Enable short positions (Advanced)</ThemedText>
                            </View>
                            <Switch
                                value={allowShortSelling}
                                onValueChange={setAllowShortSelling}
                                trackColor={{ false: c.surfaceContainerHigh, true: c.primary }}
                            />
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.createButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    <ThemedText style={styles.createButtonText}>
                        {loading ? 'Creating...' : 'Create Group'}
                    </ThemedText>
                </TouchableOpacity>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.surface,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 60,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    formGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography['label-lg'],
        color: c.onSurfaceVariant,
        marginBottom: Spacing.sm,
    },
    input: {
        height: 48,
        backgroundColor: c.surfaceContainerHigh,
        borderRadius: Radii.md,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: c.onSurface,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    optionButton: {
        paddingVertical: 10,
        borderRadius: Radii.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        ...Typography['label-md'],
    },
    card: {
        borderRadius: Radii.md,
        backgroundColor: c.surfaceContainerLowest,
        overflow: 'hidden',
        ...SubtleShadow,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    floatingDivider: {
        height: 1,
        backgroundColor: c.surfaceContainerHigh,
        marginHorizontal: '10%',
    },
    helperText: {
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
        marginTop: Spacing.xs,
    },
    advancedToggleWrapper: {
        marginBottom: Spacing.lg,
    },
    advancedToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    createButton: {
        backgroundColor: c.primary,
        paddingVertical: Spacing.md,
        borderRadius: Radii.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    createButtonText: {
        color: c.onPrimary,
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
        backgroundColor: c.surfaceContainerHigh,
        borderRadius: Radii.md,
        paddingHorizontal: Spacing.md,
    },
    dateDisplay: {
        height: 48,
        backgroundColor: c.surfaceContainerHigh,
        borderRadius: Radii.md,
        paddingHorizontal: Spacing.md,
        justifyContent: 'center',
    },
    stepper: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    stepperBtn: {
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
        paddingHorizontal: Spacing.sm,
    },
});
