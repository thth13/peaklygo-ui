'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProfile, getProfileStats } from '@/lib/api/profile';
import { AuthContext } from '@/context/AuthContext';
import { ProfileStats, UserProfile } from '../types';

interface UserProfileContextType {
  profile: UserProfile | null;
  userStats: ProfileStats | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  setTutorialCompleted: () => void;
  updateRatingOnStepCompletion: (payload: StepCompletionRatingPayload) => void;
  updateRatingOnGoalCompletion: (payload: GoalCompletionRatingPayload) => void;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  userStats: null,
  isLoading: true,
  error: null,
  refetchProfile: async () => {},
  setTutorialCompleted: () => {},
  updateRatingOnStepCompletion: () => {},
  updateRatingOnGoalCompletion: () => {},
});

interface ErrorWithResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface StepCompletionRatingPayload {
  goalValue: number;
  isCompleted: boolean;
}

export interface GoalCompletionRatingPayload {
  goalValue: number;
}

const calculateRatingDelta = (goalValue: number): number => goalValue;

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
  const [userStats, setUserStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useContext(AuthContext);

  const fetchProfile = useCallback(async (targetUserId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileData, statsData] = await Promise.all([getProfile(targetUserId), getProfileStats(targetUserId)]);
      setProfile(profileData);
      setUserStats(statsData);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch profile:', err);
      setProfile(null);
      setUserStats(null);
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
      setUserStats(null);
      setError(null);
      setIsLoading(false);

      return;
    }
    void fetchProfile(userId);
  }, [fetchProfile, userId]);

  const updateRatingOnStepCompletion = ({ goalValue, isCompleted }: StepCompletionRatingPayload): void => {
    setProfile((prev) => {
      if (!prev) {
        return prev;
      }
      const delta = calculateRatingDelta(goalValue);
      const newRating = isCompleted ? prev.rating + delta : Math.max(prev.rating - delta, 0);
      return {
        ...prev,
        rating: newRating,
      };
    });
    setUserStats((prev) => {
      if (!prev) {
        return prev;
      }
      const delta = calculateRatingDelta(goalValue);
      const newRating = isCompleted ? prev.rating + delta : Math.max(prev.rating - delta, 0);
      return {
        ...prev,
        rating: newRating,
      };
    });
  };

  const updateRatingOnGoalCompletion = ({ goalValue }: GoalCompletionRatingPayload): void => {
    setProfile((prev) => {
      if (!prev) {
        return prev;
      }
      const delta = calculateRatingDelta(goalValue);
      return {
        ...prev,
        rating: prev.rating + delta,
      };
    });
    setUserStats((prev) => {
      if (!prev) {
        return prev;
      }
      const delta = calculateRatingDelta(goalValue);
      return {
        ...prev,
        rating: prev.rating + delta,
      };
    });
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        userStats,
        isLoading,
        error,
        refetchProfile,
        setTutorialCompleted: () => {
          setProfile((prev) => (prev ? { ...prev, user: { ...prev.user, tutorialCompleted: true } } : prev));
        },
        updateRatingOnStepCompletion,
        updateRatingOnGoalCompletion,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
