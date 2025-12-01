import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TradeService } from '@/src/services/fantasy/tradeService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProposeTradeScreen() {
    const { id } = useLocalSearchParams(); // League ID
    const router = useRouter();
    const [recipientId, setRecipientId] = useState('');
    const [loading, setLoading] = useState(false);

    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);
    const textColor = useThemeColor({}, 'text' as any);

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

                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText style={styles.label}>Trading Partner (User ID)</ThemedText>
                    <TextInput
                        style={[styles.input, { borderColor, color: textColor }]}
                        placeholder="e.g. user_2"
                        placeholderTextColor="#888"
                        value={recipientId}
                        onChangeText={setRecipientId}
                    />
                </View>

                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText style={styles.placeholder}>Asset selection coming soon...</ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
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
    },
    content: {
        padding: 20,
    },
    title: {
        marginBottom: 24,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    placeholder: {
        fontStyle: 'italic',
        opacity: 0.6,
        textAlign: 'center',
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
