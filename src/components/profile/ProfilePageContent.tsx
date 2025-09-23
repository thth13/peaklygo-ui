'use client';

import { Suspense } from 'react';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { RightSidebarSkeleton } from '@/components/layout/RightSidebarSkeleton';
import { LeftSidebar } from '@/components/layout/sidebar';
import { PaginatedProfileContent } from '@/components/profile/PaginatedProfileContent';
import { ProfileContentSkeleton } from '@/components/profile/ProfileContentSkeleton';
import MobileProfileHeader from '@/components/profile/MobileProfileHeader';
import { Goal, ProfileStats, PaginatedGoalsResponse, UserProfile } from '@/types';
import { useViewMode } from '@/context/ViewModeContext';

interface ProfilePageContentProps {
  userId: string;
  profile: UserProfile;
  stats: ProfileStats;
  isMyProfile: boolean;
  goalsData: Goal[] | PaginatedGoalsResponse;
}

export function ProfilePageContent({ userId, profile, stats, isMyProfile, goalsData }: ProfilePageContentProps) {
  const { showRightSidebar } = useViewMode();

  return (
    <main className="max-w-7xl mx-auto mt-6 px-2 md:px-4 flex">
      <LeftSidebar userId={userId} />
      <div id="main-content" className={`w-full px-2 md:px-6 ${showRightSidebar ? 'flex-1' : 'flex-1'}`}>
        <MobileProfileHeader profile={profile} stats={stats} isMyProfile={isMyProfile} userId={userId} />
        <Suspense fallback={<ProfileContentSkeleton />}>
          <PaginatedProfileContent userId={userId} isMyProfile={isMyProfile} initialGoals={goalsData} />
        </Suspense>
      </div>
      {showRightSidebar && (
        <Suspense fallback={<RightSidebarSkeleton />}>
          <RightSidebar stats={stats} />
        </Suspense>
      )}
    </main>
  );
}
