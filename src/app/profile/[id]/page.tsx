import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getGoals } from '@/lib/api/goal';
import { getProfileStats, getProfile } from '@/lib/api/profile';
import { GOALS_PER_PAGE, IMAGE_URL } from '@/constants';
import { Goal, ProfileStats, PaginatedGoalsResponse, UserProfile } from '@/types';
import { ViewModeProvider } from '@/context/ViewModeContext';
import { ProfilePageContent } from '@/components/profile/ProfilePageContent';

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations();

  try {
    const profile = await getProfile(id);

    const username =
      typeof profile?.user === 'object'
        ? profile.user.username
        : profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user';

    const title = `${profile.name} — ${t('profile.title')} | PeaklyGo`;
    const description =
      profile.description?.trim()?.slice(0, 200) || t('profile.meta.defaultDescription', { username });

    const avatarUrl = profile.avatar
      ? profile.avatar.startsWith('http')
        ? profile.avatar
        : `${IMAGE_URL}/${profile.avatar}`
      : null;

    return {
      title,
      description,
      alternates: {
        canonical: `/profile/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `/profile/${id}`,
        type: 'profile',
        images: avatarUrl ? [{ url: avatarUrl, alt: `${profile.name} avatar` }] : undefined,
      },
      twitter: {
        title,
        description,
        images: avatarUrl ? [avatarUrl] : undefined,
      },
    };
  } catch {
    return {
      title: `${t('profile.title')} — PeaklyGo`,
      description: t('profile.meta.fallbackDescription'),
      alternates: {
        canonical: `/profile/${id}`,
      },
    };
  }
}

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
    <ViewModeProvider>
      <ProfilePageContent userId={id} profile={profile} stats={stats} isMyProfile={isMyProfile} goalsData={goalsData} />
    </ViewModeProvider>
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
