import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getArchivedGoals } from '@/lib/api/goal';
import { getProfileStats, getProfile } from '@/lib/api/profile';
import { GOALS_PER_PAGE } from '@/constants';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { RightSidebarSkeleton } from '@/components/layout/RightSidebarSkeleton';
import { LeftSidebar } from '@/components/layout/sidebar';
import { ArchivedProfileContent } from '@/components/profile/ArchivedProfileContent';
import { ProfileContentSkeleton } from '@/components/profile/ProfileContentSkeleton';
import { Goal, ProfileStats, PaginatedGoalsResponse, UserProfile } from '@/types';

type ArchivePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { id } = await params;

  // Get userId from cookies on the server
  const cookieStore = await cookies();
  const myUserId = cookieStore.get('userId')?.value;

  const isMyProfile = myUserId === id;

  const data = await fetchUserArchive(id);
  if (!data) {
    notFound();
  }

  const {
    archivedGoalsData,
    stats,
    profile,
  }: { archivedGoalsData: Goal[] | PaginatedGoalsResponse; stats: ProfileStats; profile: UserProfile } = data;

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <LeftSidebar isProfilePage={true} profile={profile} stats={stats} isMyProfile={isMyProfile} userId={id} />
      <div id="main-content" className="w-1/2 px-6">
        <Suspense fallback={<ProfileContentSkeleton />}>
          <ArchivedProfileContent userId={id} isMyProfile={isMyProfile} initialArchivedGoals={archivedGoalsData} />
        </Suspense>
      </div>
      <Suspense fallback={<RightSidebarSkeleton />}>
        <RightSidebar stats={stats} />
      </Suspense>
    </main>
  );
}

async function fetchUserArchive(
  id: string,
): Promise<{ archivedGoalsData: Goal[] | PaginatedGoalsResponse; stats: ProfileStats; profile: UserProfile } | null> {
  try {
    const [archivedGoalsResponse, stats, profile] = await Promise.all([
      getArchivedGoals(id, { page: 1, limit: GOALS_PER_PAGE }),
      getProfileStats(id),
      getProfile(id),
    ]);

    return { archivedGoalsData: archivedGoalsResponse, stats, profile };
  } catch (err) {
    console.error('Failed to fetch user archive:', err);
    return null;
  }
}
