import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Radii, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { PENDING_SIGNUP_KEY } from '@/src/constants/auth';

const c = Colors.light;

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();
    const trimmedDate = dateOfBirth.trim();

    if (!trimmedFirstName) {
      setError('First name is required');
      return;
    }
    if (!trimmedLastName) {
      setError('Last name is required');
      return;
    }
    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!trimmedDate) {
      setError('Date of birth is required');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      setError('Date of birth must be in YYYY-MM-DD format');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const signUpData = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        username: trimmedUsername,
        dateOfBirth: trimmedDate,
      };

      await AsyncStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(signUpData));

      await signUp.create({
        emailAddress,
        password,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Could not create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError('Verification could not be completed. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText type="headline-lg" style={styles.title}>Verify Email</ThemedText>
            <ThemedText type="body-lg" style={styles.subtitle}>
              We&apos;ve sent a verification code to {emailAddress}
            </ThemedText>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <ThemedText type="body-md" style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <ThemedText type="label-lg" style={styles.label}>Verification Code</ThemedText>
              <TextInput
                style={styles.input}
                value={code}
                placeholder="Enter 6-digit code"
                placeholderTextColor={c.onSurfaceVariant}
                keyboardType="number-pad"
                onChangeText={setCode}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={onVerifyPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={c.onPrimary} />
              ) : (
                <ThemedText type="title-md" style={styles.buttonText}>Verify</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <ThemedText type="headline-lg" style={styles.title}>Create Account</ThemedText>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText type="body-md" style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <ThemedText type="label-lg" style={styles.label}>First Name</ThemedText>
              <TextInput
                style={styles.input}
                value={firstName}
                placeholder="First name"
                placeholderTextColor={c.onSurfaceVariant}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <ThemedText type="label-lg" style={styles.label}>Last Name</ThemedText>
              <TextInput
                style={styles.input}
                value={lastName}
                placeholder="Last name"
                placeholderTextColor={c.onSurfaceVariant}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="label-lg" style={styles.label}>Username</ThemedText>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={username}
              placeholder="Username"
              placeholderTextColor={c.onSurfaceVariant}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="label-lg" style={styles.label}>Date of Birth</ThemedText>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={c.onSurfaceVariant}
              onChangeText={setDateOfBirth}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="label-lg" style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              placeholder="Enter your email"
              placeholderTextColor={c.onSurfaceVariant}
              onChangeText={setEmailAddress}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="label-lg" style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Create a password"
              placeholderTextColor={c.onSurfaceVariant}
              secureTextEntry={true}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={onSignUpPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={c.onPrimary} />
            ) : (
              <ThemedText type="title-md" style={styles.buttonText}>Continue</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText type="body-md" style={styles.footerText}>
            Already have an account?{' '}
          </ThemedText>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <ThemedText type="label-lg" style={styles.linkText}>Sign in</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: c.onSurface,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: c.onSurfaceVariant,
  },
  form: {
    gap: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  label: {
    color: c.onSurface,
  },
  input: {
    backgroundColor: c.surfaceContainerHigh,
    borderRadius: Radii.sm,
    padding: Spacing.md,
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    color: c.onSurface,
  },
  button: {
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: c.primary,
  },
  buttonText: {
    color: c.onPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    color: c.onSurfaceVariant,
  },
  linkText: {
    color: c.primary,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: Radii.sm,
    backgroundColor: c.danger + '20',
  },
  errorText: {
    color: c.danger,
    textAlign: 'center',
  },
});
