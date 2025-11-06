import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);

  const primaryColor = useThemeColor({}, 'primary' as any);
  const cardBg = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to main app
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const step = onboardingSteps[currentStep];

  return (
    <ThemedView style={styles.container}>
      {/* Skip Button */}
      {currentStep < onboardingSteps.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <ThemedText style={styles.skipText}>Skip</ThemedText>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.logoText}>flit</ThemedText>
          </View>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>{step.icon}</ThemedText>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <ThemedText type="title" style={styles.title}>
            {step.title}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{step.subtitle}</ThemedText>
          <ThemedText style={styles.description}>{step.description}</ThemedText>
        </View>

        {/* Features Cards */}
        {currentStep === 0 && (
          <View style={styles.featuresContainer}>
            <View style={[styles.featureCard, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.featureIcon}>⚡</ThemedText>
              <ThemedText style={styles.featureText}>5-min lessons</ThemedText>
            </View>
            <View style={[styles.featureCard, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.featureIcon}>🎯</ThemedText>
              <ThemedText style={styles.featureText}>Real strategies</ThemedText>
            </View>
            <View style={[styles.featureCard, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.featureIcon}>🔒</ThemedText>
              <ThemedText style={styles.featureText}>Risk-free</ThemedText>
            </View>
          </View>
        )}

        {currentStep === 1 && (
          <View style={[styles.exampleCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.exampleRow}>
              <ThemedText style={styles.exampleLabel}>Complete lesson</ThemedText>
              <ThemedText style={[styles.exampleValue, { color: colors.success }]}>
                +$500
              </ThemedText>
            </View>
            <View style={styles.exampleRow}>
              <ThemedText style={styles.exampleLabel}>Pass quiz</ThemedText>
              <ThemedText style={[styles.exampleValue, { color: colors.success }]}>
                +$200
              </ThemedText>
            </View>
            <View style={styles.exampleDivider} />
            <View style={styles.exampleRow}>
              <ThemedText style={styles.exampleLabelBold}>Total earnings</ThemedText>
              <ThemedText style={[styles.exampleValueBold, { color: primaryColor }]}>
                $700
              </ThemedText>
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={[styles.leaguePreview, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.rankRow}>
              <ThemedText style={styles.rankEmoji}>🥇</ThemedText>
              <ThemedText style={styles.rankName}>Sarah</ThemedText>
              <ThemedText style={styles.rankScore}>923</ThemedText>
            </View>
            <View style={styles.rankRow}>
              <ThemedText style={styles.rankEmoji}>🥈</ThemedText>
              <ThemedText style={styles.rankName}>Marcus</ThemedText>
              <ThemedText style={styles.rankScore}>891</ThemedText>
            </View>
            <View style={[styles.rankRow, { backgroundColor: primaryColor + '20' }]}>
              <ThemedText style={styles.rankEmoji}>🥉</ThemedText>
              <ThemedText style={styles.rankName}>You</ThemedText>
              <ThemedText style={[styles.rankScore, { color: primaryColor }]}>847</ThemedText>
            </View>
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
                  backgroundColor: index === currentStep ? primaryColor : borderColor,
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: primaryColor }]}
          onPress={handleNext}
        >
          <ThemedText style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? "Let's Start!" : 'Next'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
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
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    fontSize: 120,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  featureCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  exampleCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  exampleValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  exampleLabelBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  exampleValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exampleDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 8,
  },
  leaguePreview: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  rankEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  rankName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  rankScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'width 0.3s',
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
