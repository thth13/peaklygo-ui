import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faUser } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { IMAGE_URL } from '@/constants';
import { ProfileStats, UserProfile } from '@/types';

interface MobileProfileHeaderProps {
  profile: UserProfile | null;
  stats: ProfileStats | null;
  isMyProfile?: boolean;
  userId?: string;
}

export default function MobileProfileHeader({ profile, stats, isMyProfile, userId }: MobileProfileHeaderProps) {
  const t = useTranslations('sidebar');

  const username =
    typeof profile?.user === 'object'
      ? profile.user.username
      : profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user';

  return (
    <div className="md:hidden w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 transition-colors">
        <div className="relative flex items-center gap-3">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            {profile?.avatar ? (
              <Image
                src={`${IMAGE_URL}/${profile.avatar}`}
                alt="Profile"
                width={56}
                height={56}
                className="h-14 w-14 object-cover rounded-full"
              />
            ) : (
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-white text-lg" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
                {profile?.name || t('user')}
              </h2>
              {isMyProfile && userId && (
                <Link
                  href={`/profile/${userId}/edit`}
                  aria-label="Edit profile"
                  className="h-7 w-7 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                </Link>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">@{username}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center">
            <div className="text-green-500 dark:text-green-400 font-semibold text-base">
              {stats?.completedGoals || 0}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[11px]">{t('achieved')}</div>
          </div>
          <div className="text-center">
            <div className="text-primary-500 dark:text-primary-400 font-semibold text-base">
              {stats?.activeGoalsNow || 0}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[11px]">{t('inProgress')}</div>
          </div>
          <div className="text-center">
            <div className="text-orange-500 dark:text-orange-400 font-semibold text-base">
              {stats?.closedTasks || 0}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[11px]">{t('tasks')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
