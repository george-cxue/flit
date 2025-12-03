import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LeagueService } from '@/src/services/fantasy/leagueService';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function JoinLeagueScreen() {
    const router = useRouter();
    const primaryColor = useThemeColor({}, 'primary' as any);
    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const borderColor = useThemeColor({}, 'border' as any);
    const textColor = useThemeColor({}, 'text' as any);

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
            const result = await LeagueService.joinByCode(joinCode.trim());
            Alert.alert(
                'Success',
                `You have joined ${result.league.name}!`,
                [
                    {
                        text: 'View League',
                        onPress: () => {
                            router.replace(`/fantasy/league/${result.league.id}`);
                        }
                    }
                ]
            );
        } catch (error: any) {
            let message = 'Failed to join league';
            if (error.message) {
                message = error.message;
            }
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">Join League</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Enter the 6-character code to join an existing league
                    </ThemedText>
                </View>

                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText style={styles.label}>League Join Code</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: cardBg, borderColor, color: textColor }]}
                        placeholder="e.g. ABC123"
                        placeholderTextColor="#888"
                        value={joinCode}
                        onChangeText={(text) => setJoinCode(text.toUpperCase())}
                        maxLength={6}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                    <ThemedText style={styles.helperText}>
                        Ask the league admin for the join code
                    </ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleJoin}
                    disabled={loading}
                >
                    <ThemedText style={styles.joinButtonText}>
                        {loading ? 'Joining...' : 'Join League'}
                    </ThemedText>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                    <ThemedText style={styles.dividerText}>OR</ThemedText>
                    <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                </View>

                <TouchableOpacity
                    style={[styles.createButton, { borderColor }]}
                    onPress={() => router.push('/fantasy/create-league')}
                >
                    <ThemedText style={styles.createButtonText}>Create New League</ThemedText>
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
        marginBottom: 32,
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        opacity: 0.7,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 4,
        textAlign: 'center',
    },
    helperText: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 8,
    },
    joinButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 12,
        opacity: 0.5,
    },
    createButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
