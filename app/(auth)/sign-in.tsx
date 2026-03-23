import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Colors, Typography, Radii, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

const c = Colors.light;

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

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
          <ThemedText type="headline-lg" style={styles.title}>Welcome Back</ThemedText>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText type="body-md" style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

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
              placeholder="Enter your password"
              placeholderTextColor={c.onSurfaceVariant}
              secureTextEntry={true}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={onSignInPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={c.onPrimary} />
            ) : (
              <ThemedText type="title-md" style={styles.buttonText}>Sign In</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText type="body-md" style={styles.footerText}>
            Don&apos;t have an account?{' '}
          </ThemedText>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <ThemedText type="label-lg" style={styles.linkText}>Sign up</ThemedText>
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
  form: {
    gap: Spacing.md,
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
