'use client';

import { useState } from 'react';
import { ArchivedContent } from './ArchivedContent';
import { getArchivedGoals } from '@/lib/api/goal';
import { Goal, PaginatedGoalsResponse } from '@/types';
import { GOALS_PER_PAGE } from '@/constants';

interface ArchivedProfileContentProps {
  userId: string;
  isMyProfile: boolean;
  initialArchivedGoals: Goal[] | PaginatedGoalsResponse;
}

export function ArchivedProfileContent({ userId, isMyProfile, initialArchivedGoals }: ArchivedProfileContentProps) {
  const [archivedGoalsData, setArchivedGoalsData] = useState<Goal[] | PaginatedGoalsResponse>(initialArchivedGoals);
  const [loading, setLoading] = useState(false);

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      const data = await getArchivedGoals(userId, { page, limit: GOALS_PER_PAGE });
      setArchivedGoalsData(data);
    } catch (error) {
      console.error('Failed to fetch archived goals:', error);
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
    <ArchivedContent
      archivedGoalsData={archivedGoalsData}
      isMyProfile={isMyProfile}
      userId={userId}
      onPageChange={handlePageChange}
    />
  );
}
