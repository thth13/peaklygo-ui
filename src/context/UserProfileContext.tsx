'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from '@/lib/api/profile';
import Cookies from 'js-cookie';
import { UserProfile } from '../types';

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  isLoading: true,
  error: null,
  refetchProfile: async () => {},
});

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getProfile(userId);

      setProfile(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Ошибка загрузки профиля';
      setError(errorMessage);
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchProfile = async (): Promise<void> => {
    const userId = Cookies.get('userId');
    if (userId) {
      await fetchProfile(userId);
    }
  };

  useEffect(() => {
    const userId = Cookies.get('userId');

    if (userId) {
      fetchProfile(userId);
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        refetchProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
