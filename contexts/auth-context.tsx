import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { apiClient, setAuthTokenGetter, setCurrentUserIdGetter } from '@/src/services/api';
import { PENDING_SIGNUP_KEY } from '@/src/constants/auth';

interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  onboardingComplete: boolean;
  financialIQScore?: number;
  learningStreak?: number;
  totalLearningDollars?: number;
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: User | null;
  clerkUserId: string | null;
  syncError: string | null;
  clearSyncError: () => void;
  syncUser: () => Promise<void>;
  updateUserFromProfile: (profile: Pick<User, 'firstName' | 'lastName' | 'username'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoaded: clerkLoaded, isSignedIn, userId: clerkUserId, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const getTokenRef = useRef(getToken);
  const syncedForUserRef = useRef<string | null>(null);

  getTokenRef.current = getToken;

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    setCurrentUserIdGetter(() => user?.id || null);
  }, [user]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clerkId = clerkUser?.id;
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const clerkUsername = clerkUser?.username;
  const clerkFirstName = clerkUser?.firstName;
  const clerkLastName = clerkUser?.lastName;

  const syncUser = useCallback(async () => {
    if (!isSignedIn || !clerkId || !clerkEmail) {
      if (isMountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    try {
      let pendingData: { firstName?: string; lastName?: string; username?: string; dateOfBirth?: string } = {};
      try {
        const stored = await AsyncStorage.getItem(PENDING_SIGNUP_KEY);
        if (stored) {
          pendingData = JSON.parse(stored);
          await AsyncStorage.removeItem(PENDING_SIGNUP_KEY);
        }
      } catch {
        // Ignore parse errors
      }

      const syncUsername = pendingData.username || clerkUsername || clerkEmail.split('@')[0];
      const syncFirstName = pendingData.firstName || clerkFirstName;
      const syncLastName = pendingData.lastName || clerkLastName;
      const syncDateOfBirth = pendingData.dateOfBirth;

      const payload: Record<string, string | undefined> = {
        clerkId,
        email: clerkEmail,
        username: syncUsername || undefined,
        firstName: syncFirstName || undefined,
        lastName: syncLastName || undefined,
        dateOfBirth: syncDateOfBirth || undefined,
      };

      const token = await getTokenRef.current();
      const response = await apiClient.post(
        '/users/sync',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // After sync, fetch full user data including stats
      const userId = response.data.user.id;
      const userDataResponse = await apiClient.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (isMountedRef.current) {
        setUser(userDataResponse.data.user);
        setSyncError(null);
        syncedForUserRef.current = clerkId;
      }
    } catch (err: unknown) {
      console.error('Failed to sync user:', err);
      if (isMountedRef.current) {
        setUser(null);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Failed to sync account. Please try again.';
        setSyncError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isSignedIn, clerkId, clerkEmail, clerkUsername, clerkFirstName, clerkLastName]);

  const updateUserFromProfile = useCallback((profile: Pick<User, 'firstName' | 'lastName' | 'username'>) => {
    setUser((prev) =>
      prev ? { ...prev, firstName: profile.firstName ?? undefined, lastName: profile.lastName ?? undefined, username: profile.username } : null
    );
  }, []);

  useEffect(() => {
    if (!clerkLoaded) return;

    if (isSignedIn && clerkId) {
      if (syncedForUserRef.current !== clerkId) {
        syncUser();
      }
    } else {
      syncedForUserRef.current = null;
      if (isMountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [clerkLoaded, isSignedIn, clerkId, syncUser]);

  const value: AuthContextType = {
    isLoaded: clerkLoaded && !isLoading,
    isSignedIn: !!isSignedIn,
    userId: user?.id || null,
    user,
    clerkUserId: clerkUserId || null,
    syncError,
    clearSyncError: () => setSyncError(null),
    syncUser,
    updateUserFromProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}