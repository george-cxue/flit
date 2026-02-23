import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/src/services/api';
import { useAuth, useUser } from '@clerk/clerk-expo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ProfileUser {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
}

function formatDateForInput(isoDate: string | null): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, updateUserFromProfile } = useAuthContext();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const lastLoadedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) {
      router.replace('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const { data } = await apiClient.get<{ user: ProfileUser }>(
          `/users/${authUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(data.user);
        if (lastLoadedUserId.current !== authUser.id) {
          setFirstName(data.user.firstName ?? '');
          setLastName(data.user.lastName ?? '');
          setUsername(data.user.username ?? '');
          setDateOfBirth(formatDateForInput(data.user.dateOfBirth));
          lastLoadedUserId.current = authUser.id;
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load profile';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser?.id, router, getToken]);

  const handleSave = async () => {
    if (!profile?.id) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();
    const trimmedDate = dateOfBirth.trim();

    if (!trimmedUsername || trimmedUsername.length < 3) {
      setSaveError('Username must be at least 3 characters');
      return;
    }
    if (trimmedDate && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      setSaveError('Date of birth must be in YYYY-MM-DD format');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Update Clerk first so sync will use correct values (sync overwrites our backend with Clerk data)
      if (clerkUser) {
        await clerkUser.update({
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
        });
      }

      const token = await getToken();
      const payload: Record<string, string> = {
        firstName: trimmedFirstName || '',
        lastName: trimmedLastName || '',
        username: trimmedUsername,
      };
      if (trimmedDate) {
        payload.dateOfBirth = new Date(trimmedDate + 'T00:00:00.000Z').toISOString();
      }

      const { data } = await apiClient.put<{ user: ProfileUser }>(
        `/users/${profile.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(data.user);
      setIsEditing(false);
      updateUserFromProfile({
        firstName: data.user.firstName ?? undefined,
        lastName: data.user.lastName ?? undefined,
        username: data.user.username,
      });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      const msg = data?.message || data?.error || 'Failed to save profile';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setUsername(profile.username ?? '');
      setDateOfBirth(formatDateForInput(profile.dateOfBirth));
    }
    setIsEditing(false);
    setSaveError(null);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error ?? 'Profile not found'}
          </Text>
        </View>
      </View>
    );
  }

  const initials =
    profile.firstName && profile.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : profile.email[0]?.toUpperCase() ?? '?';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={[styles.editButton, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel} disabled={isSaving}>
            <Text style={[styles.editButton, { color: colors.icon }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar & name - Clerk-style */}
        <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {profile.firstName || profile.lastName
              ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
              : profile.username}
          </Text>
          {profile.email && (
            <Text style={[styles.email, { color: colors.icon }]}>{profile.email}</Text>
          )}
        </View>

        {/* Profile sections - Clerk-inspired */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.icon }]}>
            Personal Information
          </Text>

          {saveError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.danger + '20' }]}>
              <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                {saveError}
              </Text>
            </View>
          )}

          <View style={[styles.field, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.icon }]}>First Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.icon}
                autoCapitalize="words"
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {profile.firstName || '—'}
              </Text>
            )}
          </View>

          <View style={[styles.field, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.icon }]}>Last Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.icon}
                autoCapitalize="words"
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {profile.lastName || '—'}
              </Text>
            )}
          </View>

          <View style={[styles.field, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.icon }]}>Username</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={colors.icon}
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {profile.username}
              </Text>
            )}
          </View>

          <View style={[styles.field, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.icon }]}>Date of Birth</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.icon}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {profile.dateOfBirth
                  ? formatDateForInput(profile.dateOfBirth)
                  : '—'}
              </Text>
            )}
          </View>

          <View style={[styles.field]}>
            <Text style={[styles.label, { color: colors.icon }]}>Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{profile.email}</Text>
            <Text style={[styles.hint, { color: colors.icon }]}>
              Email cannot be changed here
            </Text>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  field: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
