import { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Typography, Radii, Spacing, SubtleShadow } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/hooks/use-onboarding';

const c = Colors.light;

const onboardingSteps = [
  {
    title: 'Learn About Money',
    subtitle: 'Master financial concepts through bite-sized lessons',
    icon: '📚',
    description: 'Complete daily lessons on investing, budgeting, and wealth building',
  },
  {
    title: 'Earn & Invest',
    subtitle: 'Build your virtual portfolio with learning dollars',
    icon: '💰',
    description: 'Every lesson you complete earns virtual money to invest risk-free',
  },
  {
    title: 'Compete & Grow',
    subtitle: 'Challenge friends and climb the leagues',
    icon: '🏆',
    description: 'Track your Financial IQ and see how you stack up against others',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, profileName } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profileName) {
      setName(profileName);
    }
  }, [profileName]);

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrorMessage('');
    } else {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setErrorMessage('Please enter your name so we can personalize your experience.');
        return;
      }
      await completeOnboarding(trimmedName);
      router.replace('/(tabs)/home');
    }
  };

  const handleSkip = async () => {
    const trimmedName = name.trim() || 'Investor';
    await completeOnboarding(trimmedName);
    router.replace('/(tabs)/home');
  };

  const step = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentStep < onboardingSteps.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <ThemedText type="body-lg" style={styles.skipText}>Skip</ThemedText>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <ThemedText type="headline-md" style={styles.logoText}>flit</ThemedText>
          </View>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>{step.icon}</ThemedText>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <ThemedText type="headline-lg" style={styles.title}>
            {step.title}
          </ThemedText>
          <ThemedText type="body-lg" style={styles.subtitle}>{step.subtitle}</ThemedText>
          <ThemedText type="body-md" style={styles.description}>{step.description}</ThemedText>
        </View>

        {/* Features Cards */}
        {currentStep === 0 && (
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <ThemedText style={styles.featureIcon}>⚡</ThemedText>
              <ThemedText type="label-lg" style={styles.featureText}>5-min lessons</ThemedText>
            </View>
            <View style={styles.featureCard}>
              <ThemedText style={styles.featureIcon}>🎯</ThemedText>
              <ThemedText type="label-lg" style={styles.featureText}>Real strategies</ThemedText>
            </View>
            <View style={styles.featureCard}>
              <ThemedText style={styles.featureIcon}>🔒</ThemedText>
              <ThemedText type="label-lg" style={styles.featureText}>Risk-free</ThemedText>
            </View>
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.exampleCard}>
            <View style={styles.exampleRow}>
              <ThemedText type="body-md" style={styles.exampleLabel}>Complete lesson</ThemedText>
              <ThemedText type="label-lg" style={{ color: c.success }}>
                +$500
              </ThemedText>
            </View>
            <View style={styles.exampleRow}>
              <ThemedText type="body-md" style={styles.exampleLabel}>Pass quiz</ThemedText>
              <ThemedText type="label-lg" style={{ color: c.success }}>
                +$200
              </ThemedText>
            </View>
            <View style={styles.floatingDivider} />
            <View style={styles.exampleRow}>
              <ThemedText type="title-md" style={styles.exampleLabelBold}>Total earnings</ThemedText>
              <ThemedText type="title-lg" style={{ color: c.primary }}>
                $700
              </ThemedText>
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.leaguePreview}>
            <View style={styles.rankRow}>
              <ThemedText style={styles.rankEmoji}>🥇</ThemedText>
              <ThemedText type="title-md" style={styles.rankName}>Sarah</ThemedText>
              <ThemedText type="title-md" style={styles.rankScore}>923</ThemedText>
            </View>
            <View style={styles.rankRow}>
              <ThemedText style={styles.rankEmoji}>🥈</ThemedText>
              <ThemedText type="title-md" style={styles.rankName}>Marcus</ThemedText>
              <ThemedText type="title-md" style={styles.rankScore}>891</ThemedText>
            </View>
            <View style={[styles.rankRow, { backgroundColor: c.primary + '20' }]}>
              <ThemedText style={styles.rankEmoji}>🥉</ThemedText>
              <ThemedText type="title-md" style={styles.rankName}>You</ThemedText>
              <ThemedText type="title-md" style={[styles.rankScore, { color: c.primary }]}>847</ThemedText>
            </View>
          </View>
        )}

        {currentStep === onboardingSteps.length - 1 && (
          <View style={styles.nameCard}>
            <ThemedText type="title-md" style={styles.nameLabel}>
              What should we call you?
            </ThemedText>
            <TextInput
              style={[
                styles.nameInput,
                errorMessage ? { backgroundColor: c.danger + '10' } : undefined,
              ]}
              placeholder="Enter your first name"
              placeholderTextColor={c.onSurfaceVariant}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <ThemedText type="label-md" style={styles.nameHint}>We&apos;ll show this on your home page and leagues.</ThemedText>
            {errorMessage ? (
              <ThemedText type="label-md" style={styles.nameError}>{errorMessage}</ThemedText>
            ) : null}
          </View>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentStep ? c.primary : c.surfaceContainerHigh,
                  width: index === currentStep ? Spacing.lg : Spacing.sm,
                },
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <ThemedText type="title-md" style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? "Let's Start!" : 'Next'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    color: c.onSurfaceVariant,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
  logoText: {
    color: c.onPrimary,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 120,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: c.onSurface,
  },
  subtitle: {
    textAlign: 'center',
    color: c.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: 'center',
    color: c.onSurfaceVariant,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  featureCard: {
    flex: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  featureText: {
    textAlign: 'center',
    color: c.onSurface,
  },
  exampleCard: {
    width: '100%',
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exampleLabel: {
    color: c.onSurfaceVariant,
  },
  exampleLabelBold: {
    color: c.onSurface,
  },
  floatingDivider: {
    height: 1,
    backgroundColor: c.surfaceContainerHigh,
    marginHorizontal: '10%',
    marginVertical: Spacing.sm,
  },
  leaguePreview: {
    width: '100%',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  nameCard: {
    width: '100%',
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: c.surfaceContainerLowest,
    ...SubtleShadow,
  },
  nameLabel: {
    marginBottom: Spacing.md,
    color: c.onSurface,
  },
  nameInput: {
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Typography['body-lg'].fontFamily,
    fontSize: Typography['body-lg'].fontSize,
    backgroundColor: c.surfaceContainerHigh,
    color: c.onSurface,
  },
  nameHint: {
    marginTop: Spacing.sm,
    color: c.onSurfaceVariant,
  },
  nameError: {
    marginTop: Spacing.sm,
    color: c.danger,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.sm,
    marginBottom: Spacing.sm,
  },
  rankEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  rankName: {
    flex: 1,
    color: c.onSurface,
  },
  rankScore: {
    color: c.onSurface,
  },
  bottom: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dot: {
    height: Spacing.sm,
    borderRadius: Spacing.xs,
  },
  nextButton: {
    borderRadius: Radii.lg,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: c.primary,
  },
  nextButtonText: {
    color: c.onPrimary,
  },
});
