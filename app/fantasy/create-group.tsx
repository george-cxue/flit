import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { GroupService } from '@/src/services/fantasy/groupService';
import { GroupSettings, PortfolioAssetClass } from '@/src/types/fantasy';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '@/contexts/auth-context';
import { useLessons } from '@/hooks/use-lessons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const c = Colors.light;

export default function CreateGroupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId } = useAuthContext();
    const { portfolioBalance } = useLessons(userId);

    // Required Settings
    const [groupName, setGroupName] = useState('');
    const [groupSize, setGroupSize] = useState(12);
    const [startingBalanceInput, setStartingBalanceInput] = useState('1000');
    const [competitionPeriod, setCompetitionPeriod] = useState<'1_week' | '2_weeks' | '1_month' | '3_months' | '6_months' | '1_year'>('1_month');
    const [startDateValue, setStartDateValue] = useState(() => new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [enabledAssetClasses, setEnabledAssetClasses] = useState<PortfolioAssetClass[]>([
        'Stock',
        'Savings Account',
        'Bonds',
        'Index Funds',
    ]);

    const [loading, setLoading] = useState(false);

    const toggleAssetClass = (type: PortfolioAssetClass) => {
        if (enabledAssetClasses.includes(type)) {
            setEnabledAssetClasses(enabledAssetClasses.filter(t => t !== type));
        } else {
            setEnabledAssetClasses([...enabledAssetClasses, type]);
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (event.type === 'dismissed' || !selectedDate) {
            return;
        }
        setStartDateValue(selectedDate);
    };

    const handleCreate = async () => {
        const parsedStartingBalance = parseInt(startingBalanceInput.replace(/[^\d]/g, ''), 10);
        if (!Number.isFinite(parsedStartingBalance) || parsedStartingBalance < 1000 || parsedStartingBalance > 1000000) {
            Alert.alert('Error', 'Starting balance must be between $1,000 and $1,000,000');
            return;
        }

        if (!groupName.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }
        if (parsedStartingBalance > portfolioBalance) {
            Alert.alert(
                'Insufficient Learning Dollars',
                `Starting balance cannot exceed your learning dollars ($${portfolioBalance.toLocaleString()}).`
            );
            return;
        }
        if (enabledAssetClasses.length === 0) {
            Alert.alert('Error', 'Please enable at least one asset class');
            return;
        }

        setLoading(true);
        try {
            const settings: GroupSettings = {
                groupSize,
                startingBalance: parsedStartingBalance,
                competitionPeriod,
                startDate: new Date(
                    startDateValue.getFullYear(),
                    startDateValue.getMonth(),
                    startDateValue.getDate()
                ).toISOString(),
                scoringMethod: 'Total Return %',
                enabledAssetClasses,
                minAssetPrice: 1,
                allowShortSelling: false,
                tradingEnabled: true,
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
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.lg + insets.top }]}
            >
                <View style={styles.header}>
                    <ThemedText type="title">Create Group</ThemedText>
                </View>

                {/* REQUIRED SETTINGS */}
                <View style={styles.section}>
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
                            <TextInput
                                style={styles.balanceInput}
                                value={startingBalanceInput}
                                onChangeText={(text) => setStartingBalanceInput(text.replace(/[^\d]/g, ''))}
                                keyboardType="numeric"
                                placeholder="10000"
                                placeholderTextColor={c.onSurfaceVariant}
                            />
                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    onPress={() => {
                                        const parsed = parseInt(startingBalanceInput || '0', 10) || 0;
                                        setStartingBalanceInput(String(Math.max(1000, parsed - 1000)));
                                    }}
                                >
                                    <ThemedText style={styles.stepperBtn}>-</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const parsed = parseInt(startingBalanceInput || '0', 10) || 0;
                                        setStartingBalanceInput(String(Math.min(1000000, Math.max(1000, parsed + 1000))));
                                    }}
                                >
                                    <ThemedText style={styles.stepperBtn}>+</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ThemedText style={styles.helperText}>Enter any amount between $1,000 and $1,000,000</ThemedText>
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
                        <TouchableOpacity style={styles.dateDisplay} onPress={() => setShowDatePicker(true)}>
                            <ThemedText>{startDateValue.toLocaleDateString()}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Asset Classes</ThemedText>
                        <View style={styles.card}>
                            {(['Stock', 'Savings Account', 'Bonds', 'Index Funds'] as PortfolioAssetClass[]).map((type, index) => (
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

            <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <Pressable style={styles.datePickerOverlay} onPress={() => setShowDatePicker(false)}>
                    <Pressable style={styles.datePickerCard} onPress={(e) => e.stopPropagation()}>
                        <DateTimePicker
                            value={startDateValue}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            minimumDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                            textColor={Platform.OS === 'ios' ? c.onSurface : undefined}
                            themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
                            onChange={handleDateChange}
                        />
                        {Platform.OS === 'ios' && (
                            <View style={styles.datePickerActions}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <ThemedText type="label-lg" style={{ color: c.primary }}>Done</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
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
    balanceInput: {
        flex: 1,
        height: 40,
        borderRadius: Radii.md,
        backgroundColor: c.surfaceContainerLowest,
        paddingHorizontal: Spacing.sm,
        color: c.onSurface,
        fontSize: 16,
        marginRight: Spacing.sm,
    },
    dateDisplay: {
        height: 48,
        backgroundColor: c.surfaceContainerHigh,
        borderRadius: Radii.md,
        paddingHorizontal: Spacing.md,
        justifyContent: 'center',
    },
    datePickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    datePickerCard: {
        backgroundColor: c.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.lg,
    },
    datePickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Spacing.sm,
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
