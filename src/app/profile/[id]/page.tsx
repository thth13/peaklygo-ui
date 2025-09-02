import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getGoals } from '@/lib/api/goal';
import { getProfileStats, getProfile } from '@/lib/api/profile';
import { GOALS_PER_PAGE } from '@/constants';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { RightSidebarSkeleton } from '@/components/layout/RightSidebarSkeleton';
import { LeftSidebar } from '@/components/layout/sidebar';
import { PaginatedProfileContent } from '@/components/profile/PaginatedProfileContent';
import { ProfileContentSkeleton } from '@/components/profile/ProfileContentSkeleton';
import { Goal, ProfileStats, PaginatedGoalsResponse, UserProfile } from '@/types';

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Profile({ params }: ProfilePageProps) {
  const { id } = await params;

  // Get userId from cookies on the server
  const cookieStore = await cookies();
  const myUserId = cookieStore.get('userId')?.value;

  const isMyProfile = myUserId === id;

  const data = await fetchUserProfile(id);
  if (!data) {
    notFound();
  }

  const {
    goalsData,
    stats,
    profile,
  }: { goalsData: Goal[] | PaginatedGoalsResponse; stats: ProfileStats; profile: UserProfile } = data;

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <LeftSidebar isProfilePage={true} profile={profile} stats={stats} isMyProfile={isMyProfile} userId={id} />
      <div id="main-content" className="w-3/5 px-6">
        <Suspense fallback={<ProfileContentSkeleton />}>
          <PaginatedProfileContent userId={id} isMyProfile={isMyProfile} initialGoals={goalsData} />
        </Suspense>
      </div>
      <Suspense fallback={<RightSidebarSkeleton />}>
        <RightSidebar stats={stats} />
      </Suspense>
    </main>
  );
}

async function fetchUserProfile(
  id: string,
): Promise<{ goalsData: Goal[] | PaginatedGoalsResponse; stats: ProfileStats; profile: UserProfile } | null> {
  try {
    const [goalsResponse, stats, profile] = await Promise.all([
      getGoals(id, { page: 1, limit: GOALS_PER_PAGE }),
      getProfileStats(id),
      getProfile(id),
    ]);

    return { goalsData: goalsResponse, stats, profile };
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}
