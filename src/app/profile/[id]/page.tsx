import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getGoals } from '@/lib/api/goal';
import { getProfileStats } from '@/lib/api/profile';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { RightSidebarSkeleton } from '@/components/layout/RightSidebarSkeleton';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileContentSkeleton } from '@/components/profile/ProfileContentSkeleton';
import { Goal, ProfileStats } from '@/types';

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

  const { goals, stats }: { goals: Goal[]; stats: ProfileStats } = data;

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <LeftSidebar userId={id} stats={stats} />
      <div id="main-content" className="w-3/5 px-6">
        <Suspense fallback={<ProfileContentSkeleton />}>
          <ProfileContent goals={goals} isMyProfile={isMyProfile} />
        </Suspense>
      </div>
      <Suspense fallback={<RightSidebarSkeleton />}>
        <RightSidebar stats={stats} />
      </Suspense>
    </main>
  );
}

async function fetchUserProfile(id: string): Promise<{ goals: Goal[]; stats: ProfileStats } | null> {
  try {
    const [goals, stats] = await Promise.all([getGoals(id), getProfileStats(id)]);

    return { goals, stats };
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}
