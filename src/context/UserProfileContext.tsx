'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProfile } from '@/lib/api/profile';
import { AuthContext } from '@/context/AuthContext';
import { UserProfile } from '../types';

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  setTutorialCompleted: () => void;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  isLoading: true,
  error: null,
  refetchProfile: async () => {},
  setTutorialCompleted: () => {},
});

interface ErrorWithResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const errorWithResponse = error as ErrorWithResponse;
    if (errorWithResponse.response?.data?.message) {
      return errorWithResponse.response.data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Ошибка загрузки профиля';
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useContext(AuthContext);

  const fetchProfile = useCallback(async (targetUserId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProfile(targetUserId);
      setProfile(data);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchProfile = useCallback(async (): Promise<void> => {
    if (!userId) {
      return;
    }
    await fetchProfile(userId);
  }, [fetchProfile, userId]);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setError(null);
      setIsLoading(false);

      return;
    }
    void fetchProfile(userId);
  }, [fetchProfile, userId]);

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        refetchProfile,
        setTutorialCompleted: () => {
          setProfile((prev) => (prev ? { ...prev, user: { ...prev.user, tutorialCompleted: true } } : prev));
        },
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
