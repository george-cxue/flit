import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing, Typography, SubtleShadow } from '@/constants/theme';
import { TradeService } from '@/src/services/fantasy/tradeService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const c = Colors.light;

export default function ProposeTradeScreen() {
    const { id } = useLocalSearchParams(); // Group ID
    const router = useRouter();
    const [recipientId, setRecipientId] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePropose = async () => {
        if (!recipientId) {
            Alert.alert('Error', 'Please enter a recipient ID');
            return;
        }

        setLoading(true);
        try {
            if (typeof id === 'string') {
                // Mocking asset selection for now
                await TradeService.proposeTrade(id, recipientId, ['asset_1'], ['asset_2']);
                Alert.alert('Success', 'Trade proposed!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            const message = (error instanceof Error && error.message) ? error.message : 'Failed to propose trade';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <ThemedText type="title" style={styles.title}>Propose Trade</ThemedText>

                <View style={styles.card}>
                    <ThemedText style={styles.label}>Trading Partner (User ID)</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. user_2"
                        placeholderTextColor={c.onSurfaceVariant}
                        value={recipientId}
                        onChangeText={setRecipientId}
                    />
                </View>

                <View style={styles.card}>
                    <ThemedText style={styles.placeholder}>Asset selection coming soon...</ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handlePropose}
                    disabled={loading}
                >
                    <ThemedText style={styles.buttonText}>{loading ? 'Sending...' : 'Send Proposal'}</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.surface,
    },
    content: {
        padding: Spacing.lg,
    },
    title: {
        marginBottom: Spacing.lg,
    },
    card: {
        padding: Spacing.lg,
        borderRadius: Radii.md,
        marginBottom: Spacing.lg,
        backgroundColor: c.surfaceContainerLowest,
        ...SubtleShadow,
    },
    label: {
        marginBottom: Spacing.sm,
        fontFamily: 'Inter_600SemiBold',
        color: c.onSurfaceVariant,
    },
    input: {
        height: 44,
        backgroundColor: c.surfaceContainerHigh,
        borderRadius: Radii.md,
        paddingHorizontal: Spacing.md,
        color: c.onSurface,
    },
    placeholder: {
        fontStyle: 'italic',
        color: c.onSurfaceVariant,
        textAlign: 'center',
    },
    button: {
        backgroundColor: c.primary,
        paddingVertical: Spacing.md,
        borderRadius: Radii.lg,
        alignItems: 'center',
    },
    buttonText: {
        color: c.onPrimary,
        ...Typography['title-md'],
        fontFamily: 'Inter_600SemiBold',
    },
});
