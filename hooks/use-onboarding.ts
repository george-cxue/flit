import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@flit_onboarding_completed';
const ONBOARDING_NAME_KEY = '@flit_onboarding_name';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [profileName, setProfileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const entries = await AsyncStorage.multiGet([ONBOARDING_KEY, ONBOARDING_NAME_KEY]);
      const onboardingValue = entries.find(([key]) => key === ONBOARDING_KEY)?.[1];
      const storedName = entries.find(([key]) => key === ONBOARDING_NAME_KEY)?.[1];
      setHasCompletedOnboarding(onboardingValue === 'true');
      setProfileName(storedName ?? '');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
      setProfileName('');
    } finally {
      setIsLoading(false);
    }
  };

  const persistName = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await AsyncStorage.setItem(ONBOARDING_NAME_KEY, trimmed);
      setProfileName(trimmed);
    } catch (error) {
      console.error('Error saving onboarding name:', error);
    }
  };

  const completeOnboarding = async (name?: string) => {
    try {
      if (name && name.trim()) {
        await persistName(name);
      } else if (!profileName) {
        await persistName('Investor');
      }
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.multiRemove([ONBOARDING_KEY, ONBOARDING_NAME_KEY]);
      setHasCompletedOnboarding(false);
      setProfileName('');
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  };

  return {
    hasCompletedOnboarding,
    profileName,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    saveProfileName: persistName,
  };
}