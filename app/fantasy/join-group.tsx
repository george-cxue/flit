import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { GroupService } from '@/src/services/fantasy/groupService';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '@/contexts/auth-context';
import { useLessons } from '@/hooks/use-lessons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const c = Colors.light;

export default function JoinGroupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId } = useAuthContext();
    const { portfolioBalance } = useLessons(userId);

    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            Alert.alert('Error', 'Please enter a join code');
            return;
        }

        if (joinCode.trim().length !== 6) {
            Alert.alert('Error', 'Join code must be 6 characters');
            return;
        }

        setLoading(true);
        try {
            const result = await GroupService.joinByCode(joinCode.trim(), portfolioBalance);

            // Navigate directly to the group detail page
            router.push(`/fantasy/group/${result.group.id}`);

            // Show success message after navigation
            setTimeout(() => {
                Alert.alert('Success', `You have joined ${result.group.name}!`);
            }, 500);
        } catch (error: any) {
            let message = 'Failed to join group';
            if (error.message) {
                message = error.message;
            }
            Alert.alert('Error', message);
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.lg + insets.top }]}
            >
                <View style={styles.header}>
                    <ThemedText type="title">Join Group</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Enter the 6-character code to join an existing group
                    </ThemedText>
                </View>

                <View style={styles.card}>
                    <ThemedText style={styles.label}>Group Join Code</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. ABC123"
                        placeholderTextColor={c.onSurfaceVariant}
                        value={joinCode}
                        onChangeText={(text) => setJoinCode(text.toUpperCase())}
                        maxLength={6}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                    <ThemedText style={styles.helperText}>
                        Ask the group admin for the join code
                    </ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.joinButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleJoin}
                    disabled={loading}
                >
                    <ThemedText style={styles.joinButtonText}>
                        {loading ? 'Joining...' : 'Join Group'}
                    </ThemedText>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <ThemedText style={styles.dividerText}>OR</ThemedText>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/fantasy/create-group')}
                >
                    <ThemedText style={styles.createButtonText}>Create New Group</ThemedText>
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
        marginBottom: Spacing.xl,
    },
    subtitle: {
        marginTop: Spacing.sm,
        ...Typography['body-md'],
        color: c.onSurfaceVariant,
    },
    card: {
        padding: Spacing.lg,
        borderRadius: Radii.md,
        marginBottom: Spacing.lg,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    label: {
        ...Typography['label-lg'],
        color: c.onSurfaceVariant,
        marginBottom: Spacing.sm,
    },
    input: {
        height: 56,
        backgroundColor: c.surfaceContainerHigh,
        borderRadius: Radii.md,
        paddingHorizontal: Spacing.md,
        fontSize: 24,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 4,
        textAlign: 'center',
        color: c.onSurface,
    },
    helperText: {
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
        marginTop: Spacing.sm,
    },
    joinButton: {
        backgroundColor: c.primary,
        paddingVertical: Spacing.md,
        borderRadius: Radii.lg,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    joinButtonText: {
        color: c.onPrimary,
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: c.surfaceContainerHigh,
    },
    dividerText: {
        marginHorizontal: Spacing.md,
        ...Typography['label-md'],
        color: c.onSurfaceVariant,
    },
    createButton: {
        backgroundColor: c.secondaryContainer,
        paddingVertical: Spacing.md,
        borderRadius: Radii.lg,
        alignItems: 'center',
    },
    createButtonText: {
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
        color: c.onSecondaryContainer,
    },
});
