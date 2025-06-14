'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from '@/lib/api/profile';
import Cookies from 'js-cookie';
import { UserProfile } from '../types';

interface UserProfileContextType {
  profile: UserProfile | null;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
});

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async (userId: string) => {
    const data = await getProfile(userId);
    setProfile(data);
  };

  useEffect(() => {
    const userId = Cookies.get('userId');
    console.log(userId);
    if (userId) {
      fetchProfile(userId);
    }
  }, []);

  return <UserProfileContext.Provider value={{ profile }}>{children}</UserProfileContext.Provider>;
};

export const useUserProfile = () => useContext(UserProfileContext);
