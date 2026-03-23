import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

const c = Colors.light;

interface SignOutButtonProps {
  style?: object;
}

export function SignOutButton({ style }: SignOutButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
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
      style={[styles.button, style]}
      onPress={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={c.onPrimary} size="small" />
      ) : (
        <ThemedText type="label-lg" style={styles.buttonText}>
          Sign Out
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radii.lg,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    backgroundColor: c.danger,
  },
  buttonText: {
    color: c.onPrimary,
  },
});
