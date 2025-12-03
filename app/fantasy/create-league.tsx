import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeagueService } from '@/src/services/fantasy/leagueService';
import { AssetType, LeagueSettings } from '@/src/types/fantasy';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateLeagueScreen() {
    const router = useRouter();
    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);
    const textColor = useThemeColor({}, 'text' as any);

    // Required Settings
    const [leagueName, setLeagueName] = useState('');
    const [leagueSize, setLeagueSize] = useState(12);
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
        if (!leagueName.trim()) {
            Alert.alert('Error', 'Please enter a league name');
            return;
        }

        setLoading(true);
        try {
            const settings: LeagueSettings = {
                leagueSize,
                startingBalance,
                competitionPeriod,
                startDate,
                scoringMethod,
                enabledAssetClasses,
                minAssetPrice: parseFloat(minAssetPrice) || 0,
                allowShortSelling,
                tradingEnabled,
            };

            await LeagueService.createLeague(leagueName, settings);
            router.back();
        } catch (error) {
            console.error('Failed to create league:', error);
            Alert.alert('Error', error instanceof Error && error.message ? error.message : 'Failed to create league');
        } finally {
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
                { borderColor },
                isSelected && { backgroundColor: primaryColor, borderColor: primaryColor }
            ]}
            onPress={onPress}
        >
            <ThemedText style={[
                styles.optionText,
                isSelected && { color: '#FFF' }
            ]}>{label}</ThemedText>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">Create League</ThemedText>
                </View>

                {/* REQUIRED SETTINGS */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Required Settings</ThemedText>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>League Name</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: cardBg, borderColor, color: textColor }]}
                            placeholder="e.g. Wall Street Warriors"
                            placeholderTextColor="#888"
                            value={leagueName}
                            onChangeText={setLeagueName}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>League Size</ThemedText>
                        <View style={styles.optionsRow}>
                            {[4, 6, 8, 10, 12].map(size => (
                                <View key={size} style={{ flex: 1 }}>
                                    {renderOptionButton(size, leagueSize === size, () => setLeagueSize(size))}
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
                        <View style={[styles.optionsRow, { marginTop: 8 }]}>
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
                        <View style={[styles.input, { backgroundColor: cardBg, borderColor, justifyContent: 'center' }]}>
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
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                            {(['Stock', 'ETF', 'Commodity', 'REIT'] as AssetType[]).map((type) => (
                                <View key={type} style={[styles.switchRow, { borderBottomColor: borderColor }]}>
                                    <ThemedText>{type}</ThemedText>
                                    <Switch
                                        value={enabledAssetClasses.includes(type)}
                                        onValueChange={() => toggleAssetClass(type)}
                                        trackColor={{ false: '#767577', true: primaryColor }}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ADVANCED SETTINGS TOGGLE */}
                <TouchableOpacity
                    style={[styles.advancedToggle, { borderTopColor: borderColor, borderBottomColor: borderColor }]}
                    onPress={() => setShowAdvanced(!showAdvanced)}
                >
                    <ThemedText type="defaultSemiBold">Advanced Settings</ThemedText>
                    <ThemedText>{showAdvanced ? '▲' : '▼'}</ThemedText>
                </TouchableOpacity>

                {/* ADVANCED SETTINGS SECTION */}
                {showAdvanced && (
                    <View style={styles.section}>
                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Min Asset Price ($)</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: cardBg, borderColor, color: textColor }]}
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
                                trackColor={{ false: '#767577', true: primaryColor }}
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
                                trackColor={{ false: '#767577', true: primaryColor }}
                            />
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    <ThemedText style={styles.createButtonText}>
                        {loading ? 'Creating...' : 'Create League'}
                    </ThemedText>
                </TouchableOpacity>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    header: {
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    optionButton: {
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    helperText: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
    advancedToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        marginBottom: 24,
    },
    createButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    stepper: {
        flexDirection: 'row',
        gap: 16,
    },
    stepperBtn: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 8,
    },
});
