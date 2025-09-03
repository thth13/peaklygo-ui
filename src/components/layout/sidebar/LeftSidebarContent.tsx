import { UserProfile, ProfileStats } from '@/types';
import { RatingSummary } from '../RatingSummary';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats as ProfileStatsComponent } from './ProfileStats';
import { ProfileActions } from './ProfileActions';

interface LeftSidebarContentProps {
  profile: UserProfile | null;
  stats: ProfileStats | null;
  isMyProfile?: boolean;
  userId?: string;
}

export function LeftSidebarContent({ profile, stats, isMyProfile, userId }: LeftSidebarContentProps) {
  return (
    <>
      <ProfileHeader profile={profile} isMyProfile={isMyProfile} userId={userId} />

      {profile?.description && (
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">{profile.description}</p>
        </div>
      )}

      <RatingSummary rating={profile?.rating || 0} />

      <ProfileStatsComponent stats={stats} />

      <ProfileActions isMyProfile={isMyProfile} userId={userId} />
    </>
  );
}
