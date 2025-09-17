'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useUserProfile } from '@/context/UserProfileContext';
import { getProfile, getProfileStats } from '@/lib/api/profile';
import { ProfileStats, UserProfile } from '@/types';
import { LeftSidebarContent } from './LeftSidebarContent';
import { LeftSidebarSkeleton } from './LeftSidebarSkeleton';
import { LeftSidebarError } from './LeftSidebarError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faArchive } from '@fortawesome/free-solid-svg-icons';
import LinkWithProgress from '@/components/Link';

interface LeftSidebarProps {
  userId?: string;
}

export const LeftSidebar = ({ userId }: LeftSidebarProps) => {
  const { profile: currentUserProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const pathname = usePathname();

  const actualUserId = userId || myUserId;
  const isMyProfile = !!myUserId && myUserId === actualUserId;

  const isActivePage = (path: string) => {
    if (path === `/profile/${myUserId}` && pathname === `/profile/${myUserId}`) {
      return true;
    }
    if (path === `/profile/${myUserId}/archive` && pathname === `/profile/${myUserId}/archive`) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const userId = Cookies.get('userId');
    setMyUserId(userId || null);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (actualUserId) {
          const [profileData, statsData] = await Promise.all([getProfile(actualUserId), getProfileStats(actualUserId)]);
          setProfile(profileData);
          setStats(statsData);
        } else if (currentUserProfile) {
          setProfile(currentUserProfile);
          const statsData = await getProfileStats(currentUserProfile._id);
          setStats(statsData);
        } else {
          setProfile(null);
          setStats(null);
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Ошибка загрузки данных';
        setError(errorMessage);
        console.error('Failed to fetch user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (profileError) {
      setError(profileError);
      setIsLoading(false);
      return;
    }

    fetchUserData();
  }, [userId, actualUserId, currentUserProfile, profileLoading, profileError]);

  return (
    <div id="left-sidebar" className="w-1/4 pr-6 hidden md:block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
        {isLoading ? (
          <LeftSidebarSkeleton />
        ) : error ? (
          <LeftSidebarError error={error} />
        ) : (
          <LeftSidebarContent
            profile={profile}
            stats={stats}
            isMyProfile={isMyProfile}
            userId={actualUserId || undefined}
          />
        )}
      </div>

      <div id="navigation-menu" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors">
        <nav>
          <ul className="space-y-1">
            {myUserId ? (
              <>
                <li>
                  <LinkWithProgress
                    href={`/profile/${myUserId}`}
                    className={`flex items-center py-2 px-3 rounded-md font-medium cursor-pointer text-sm transition-colors ${
                      isActivePage(`/profile/${myUserId}`)
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={faBullseye} className="w-4 mr-3 text-base" />
                    <span>Мои цели</span>
                  </LinkWithProgress>
                </li>
                <li>
                  <LinkWithProgress
                    href={`/profile/${myUserId}/archive`}
                    className={`flex items-center py-2 px-3 rounded-md font-medium cursor-pointer text-sm transition-colors ${
                      isActivePage(`/profile/${myUserId}/archive`)
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={faArchive} className="w-4 mr-3 text-base" />
                    <span>Архивные цели</span>
                  </LinkWithProgress>
                </li>
              </>
            ) : (
              // Показываем скелетон навигации пока userId загружается
              <>
                <li>
                  <div className="flex items-center py-2 px-3 rounded-md animate-pulse">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </li>
                <li>
                  <div className="flex items-center py-2 px-3 rounded-md animate-pulse">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                </li>
              </>
            )}
            {/* <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium cursor-pointer text-sm transition-colors">
                <FontAwesomeIcon icon={faTrophy} className="w-4 mr-3 text-base" />
                <span>Мои челленджи</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium cursor-pointer text-sm transition-colors">
                <FontAwesomeIcon icon={faUsers} className="w-4 mr-3 text-base" />
                <span>Подписки</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium cursor-pointer text-sm transition-colors">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 mr-3 text-base" />
                <span>Сообщения</span>
                <span className="ml-auto bg-primary-500 dark:bg-primary-400 text-white text-xs px-2 py-0.5 rounded-full">
                  3
                </span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium cursor-pointer text-sm transition-colors">
                <FontAwesomeIcon icon={faChartLine} className="w-4 mr-3 text-base" />
                <span>Прогресс</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium cursor-pointer text-sm transition-colors">
                <FontAwesomeIcon icon={faPeopleGroup} className="w-4 mr-3 text-base" />
                <span>Групповые цели</span>
              </span>
            </li> */}
          </ul>
        </nav>
      </div>
    </div>
  );
};
