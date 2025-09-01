'use client';

import { useState } from 'react';
import { ProfileContent } from './ProfileContent';
import { getGoals } from '@/lib/api/goal';
import { Goal, PaginatedGoalsResponse } from '@/types';
import { GOALS_PER_PAGE } from '@/constants';

interface PaginatedProfileContentProps {
  userId: string;
  isMyProfile: boolean;
  initialGoals: Goal[] | PaginatedGoalsResponse;
}

export function PaginatedProfileContent({ userId, isMyProfile, initialGoals }: PaginatedProfileContentProps) {
  const [goalsData, setGoalsData] = useState<Goal[] | PaginatedGoalsResponse>(initialGoals);
  const [loading, setLoading] = useState(false);

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      const data = await getGoals(userId, { page, limit: GOALS_PER_PAGE });
      setGoalsData(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with server-provided data - no need for additional useEffect

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <ProfileContent goalsData={goalsData} isMyProfile={isMyProfile} onPageChange={handlePageChange} />;
}
