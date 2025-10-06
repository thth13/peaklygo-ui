'use client';

import { useState } from 'react';

import { CompletedContent } from '@/components/profile/CompletedContent';
import { getCompletedGoals } from '@/lib/api/goal';
import { Goal, PaginatedGoalsResponse } from '@/types';
import { GOALS_PER_PAGE } from '@/constants';

interface CompletedProfileContentProps {
  userId: string;
  isMyProfile: boolean;
  initialCompletedGoals: Goal[] | PaginatedGoalsResponse;
}

export function CompletedProfileContent({ userId, isMyProfile, initialCompletedGoals }: CompletedProfileContentProps) {
  const [completedGoalsData, setCompletedGoalsData] = useState<Goal[] | PaginatedGoalsResponse>(initialCompletedGoals);
  const [loading, setLoading] = useState(false);

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      const data = await getCompletedGoals(userId, { page, limit: GOALS_PER_PAGE });
      setCompletedGoalsData(data);
    } catch (error) {
      console.error('Failed to fetch completed goals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <CompletedContent
      completedGoalsData={completedGoalsData}
      isMyProfile={isMyProfile}
      userId={userId}
      onPageChange={handlePageChange}
    />
  );
}

