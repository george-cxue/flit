import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SignOutButtonProps {
  style?: object;
}

export function SignOutButton({ style }: SignOutButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSignOut = async () => {
    if (isMountedRef.current) {
      setIsLoading(true);
    }
    try {
      await signOut();
      // Don't try to navigate - Clerk will handle the redirect
    } catch (err) {
      console.error('Error signing out:', JSON.stringify(err, null, 2));
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.danger }, style]}
      onPress={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.buttonText}>Sign Out</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});