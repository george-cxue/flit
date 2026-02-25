import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/src/services/api';
import { useAuthContext } from '@/contexts/auth-context';

const ONBOARDING_KEY = '@flit_onboarding_completed';
const ONBOARDING_NAME_KEY = '@flit_onboarding_name';

export function useOnboarding() {
  const { userId, syncUser } = useAuthContext();
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
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);

      if (userId) {
        await apiClient.put(`/users/${userId}`, {
          onboardingComplete: true,
        });
        await syncUser();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
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