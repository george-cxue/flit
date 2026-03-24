import {
  View,
  Text,
  TextInput,
  Switch,
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
import { Colors, Typography, Radii, Spacing, AmbientShadow, SubtleShadow } from '@/constants/theme';
import { apiClient } from '@/src/services/api';
import { useAuth, useUser } from '@clerk/clerk-expo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeMode } from '@/contexts/theme-context';

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
  const c = Colors.light;
  const styles = createStyles(c);
  const { isDarkMode, toggleThemeMode } = useThemeMode();

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
      <View style={[styles.center, { backgroundColor: c.surface }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: c.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={c.onSurface} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: c.danger }]}>
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
      style={[styles.container, { backgroundColor: c.surface }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={c.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.onSurface }]}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={[styles.editButton, { color: c.primary }]}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel} disabled={isSaving}>
            <Text style={[styles.editButton, { color: c.onSurfaceVariant }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar & name */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: c.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.displayName, { color: c.onSurface }]}>
            {profile.firstName || profile.lastName
              ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
              : profile.username}
          </Text>
          {profile.email && (
            <Text style={[styles.email, { color: c.onSurfaceVariant }]}>{profile.email}</Text>
          )}
        </View>

        {/* Floating divider instead of borderBottom */}
        <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />

        {/* Profile sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>
            Personal Information
          </Text>

          {saveError && (
            <View style={[styles.errorBanner, { backgroundColor: c.danger + '20' }]}>
              <Text style={[styles.errorBannerText, { color: c.danger }]}>
                {saveError}
              </Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.onSurfaceVariant }]}>First Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: c.onSurface, backgroundColor: c.surfaceContainerHigh }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={c.onSurfaceVariant}
                autoCapitalize="words"
              />
            ) : (
              <Text style={[styles.value, { color: c.onSurface }]}>
                {profile.firstName || '\u2014'}
              </Text>
            )}
          </View>

          {/* Floating divider */}
          <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.onSurfaceVariant }]}>Last Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: c.onSurface, backgroundColor: c.surfaceContainerHigh }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={c.onSurfaceVariant}
                autoCapitalize="words"
              />
            ) : (
              <Text style={[styles.value, { color: c.onSurface }]}>
                {profile.lastName || '\u2014'}
              </Text>
            )}
          </View>

          {/* Floating divider */}
          <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.onSurfaceVariant }]}>Username</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: c.onSurface, backgroundColor: c.surfaceContainerHigh }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={c.onSurfaceVariant}
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.value, { color: c.onSurface }]}>
                {profile.username}
              </Text>
            )}
          </View>

          {/* Floating divider */}
          <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.onSurfaceVariant }]}>Date of Birth</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: c.onSurface, backgroundColor: c.surfaceContainerHigh }]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={c.onSurfaceVariant}
              />
            ) : (
              <Text style={[styles.value, { color: c.onSurface }]}>
                {profile.dateOfBirth
                  ? formatDateForInput(profile.dateOfBirth)
                  : '\u2014'}
              </Text>
            )}
          </View>

          {/* Floating divider */}
          <View style={{ height: 1, backgroundColor: c.surfaceContainerHigh, marginHorizontal: '10%' }} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.onSurfaceVariant }]}>Email</Text>
            <Text style={[styles.value, { color: c.onSurface }]}>{profile.email}</Text>
            <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>
              Email cannot be changed here
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Appearance</Text>
          <View style={styles.themeToggleRow}>
            <View>
              <Text style={[styles.value, { color: c.onSurface }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleThemeMode}
              trackColor={{ false: c.surfaceContainerHigh, true: c.primary + '66' }}
              thumbColor={isDarkMode ? c.primary : c.onSurfaceVariant}
              ios_backgroundColor={c.surfaceContainerHigh}
            />
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: c.primary }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={c.onPrimary} size="small" />
            ) : (
              <Text style={[styles.saveButtonText, { color: c.onPrimary }]}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: typeof Colors.light) => StyleSheet.create({
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    paddingTop: 56,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    fontFamily: Typography['title-lg'].fontFamily,
    fontSize: Typography['title-lg'].fontSize,
    lineHeight: Typography['title-lg'].lineHeight,
  },
  editButton: {
    fontFamily: Typography['title-md'].fontFamily,
    fontSize: Typography['title-md'].fontSize,
    lineHeight: Typography['title-md'].lineHeight,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm + 4,
    ...AmbientShadow,
  },
  avatarText: {
    color: c.onPrimary,
    fontFamily: Typography['headline-md'].fontFamily,
    fontSize: Typography['headline-md'].fontSize,
  },
  displayName: {
    fontFamily: Typography['title-lg'].fontFamily,
    fontSize: Typography['title-lg'].fontSize,
    lineHeight: Typography['title-lg'].lineHeight,
    marginBottom: Spacing.xs,
  },
  email: {
    fontFamily: Typography['body-md'].fontFamily,
    fontSize: Typography['body-md'].fontSize,
    lineHeight: Typography['body-md'].lineHeight,
  },
  section: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: c.surfaceContainerLowest,
    borderRadius: Radii.md,
    padding: Spacing.md,
    ...SubtleShadow,
  },
  sectionTitle: {
    fontFamily: Typography['label-md'].fontFamily,
    fontSize: Typography['label-md'].fontSize,
    lineHeight: Typography['label-md'].lineHeight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  field: {
    paddingVertical: Spacing.sm + 4,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontFamily: Typography['label-md'].fontFamily,
    fontSize: Typography['label-md'].fontSize,
    lineHeight: Typography['label-md'].lineHeight,
    marginBottom: Spacing.xs + 2,
  },
  value: {
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    lineHeight: Typography['body-lg'].lineHeight,
  },
  input: {
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    lineHeight: Typography['body-lg'].lineHeight,
    borderRadius: Radii.sm,
    padding: Spacing.sm + 4,
  },
  hint: {
    fontFamily: Typography['label-md'].fontFamily,
    fontSize: Typography['label-md'].fontSize,
    lineHeight: Typography['label-md'].lineHeight,
    marginTop: Spacing.xs,
  },
  errorBanner: {
    padding: Spacing.sm + 4,
    borderRadius: Radii.sm,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontFamily: Typography['body-md'].fontFamily,
    fontSize: Typography['body-md'].fontSize,
    lineHeight: Typography['body-md'].lineHeight,
  },
  errorText: {
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    lineHeight: Typography['body-lg'].lineHeight,
  },
  saveButton: {
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...AmbientShadow,
  },
  saveButtonText: {
    fontFamily: Typography['title-md'].fontFamily,
    fontSize: Typography['title-md'].fontSize,
    lineHeight: Typography['title-md'].lineHeight,
  },
  bottomPadding: {
    height: 40,
  },
});
