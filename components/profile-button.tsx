import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ProfileButtonProps {
  style?: object;
}

export function ProfileButton({ style }: ProfileButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
        style={[styles.button, { backgroundColor: colors.primary }, style]}
        onPress={() => setDropdownVisible(true)}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <MaterialIcons name="person" size={24} color="#FFFFFF" />
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
            style={[styles.dropdown, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemWithBorder, { borderBottomColor: colors.border }]}
              onPress={handleViewProfile}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                View Profile
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={20} color={colors.danger} />
              <Text style={[styles.menuItemText, { color: colors.danger }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 20,
  },
  dropdown: {
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemWithBorder: {
    borderBottomWidth: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
