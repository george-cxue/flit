import { useClerk } from '@clerk/clerk-expo';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors, Radii, Spacing, AmbientShadow } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const c = Colors.light;

interface ProfileButtonProps {
  style?: object;
}

export function ProfileButton({ style }: ProfileButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSignOut = async () => {
    setDropdownVisible(false);
    if (isMountedRef.current) setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      if (isMountedRef.current) setIsSigningOut(false);
    }
  };

  const handleViewProfile = () => {
    setDropdownVisible(false);
    router.push('/profile');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={() => setDropdownVisible(true)}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <ActivityIndicator color={c.primary} size="small" />
        ) : (
          <MaterialIcons name="person" size={26} color={c.primary} />
        )}
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setDropdownVisible(false)}
        >
          <Pressable
            style={styles.dropdown}
            onPress={(e) => e.stopPropagation()}
          >
            <BlurView intensity={70} tint="light" style={styles.blurFill}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleViewProfile}
                activeOpacity={0.7}
              >
                <MaterialIcons name="person" size={20} color={c.primary} />
                <ThemedText type="label-lg" style={styles.menuItemText}>
                  View Profile
                </ThemedText>
                <MaterialIcons name="chevron-right" size={20} color={c.onSurfaceVariant} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <MaterialIcons name="logout" size={20} color={c.danger} />
                <ThemedText type="label-lg" style={[styles.menuItemText, { color: c.danger }]}>
                  Sign Out
                </ThemedText>
              </TouchableOpacity>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: Spacing.md,
  },
  dropdown: {
    minWidth: 200,
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: c.surfaceContainerLowest,
    ...AmbientShadow,
  },
  blurFill: {
    overflow: 'hidden',
    borderRadius: Radii.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm + 4,
  },
  divider: {
    height: 1,
    backgroundColor: c.surfaceContainerHigh,
    marginHorizontal: '10%',
  },
  menuItemText: {
    flex: 1,
    color: c.onSurface,
  },
});
