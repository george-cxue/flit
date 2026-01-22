import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { apiClient, setAuthTokenGetter } from '@/src/services/api';

interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  onboardingComplete: boolean;
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: User | null;
  clerkUserId: string | null;
  syncUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoaded: clerkLoaded, isSignedIn, userId: clerkUserId, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up the auth token getter for the API client
  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  const syncUser = async () => {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const response = await apiClient.post(
        '/users/sync',
        {
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          username: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0],
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to sync user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clerkLoaded) {
      if (isSignedIn && clerkUser) {
        syncUser();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);

  const value: AuthContextType = {
    isLoaded: clerkLoaded && !isLoading,
    isSignedIn: !!isSignedIn,
    userId: user?.id || null,
    user,
    clerkUserId: clerkUserId || null,
    syncUser,
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
