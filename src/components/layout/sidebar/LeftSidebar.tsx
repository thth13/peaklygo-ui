'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  isProfilePage?: boolean;
  profile?: UserProfile | null;
  stats?: ProfileStats | null;
  isMyProfile?: boolean;
  userId?: string;
  overlay?: boolean;
  onClose?: () => void;
}

export const LeftSidebar = ({
  isProfilePage = false,
  profile: passedProfile,
  stats: passedStats,
  isMyProfile: passedIsMyProfile,
  userId: passedUserId,
  overlay = false,
  onClose,
}: LeftSidebarProps) => {
  const params = useParams();
  const { profile: currentUserProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params?.id as string;
  const myUserId = Cookies.get('userId');

  const actualUserId = isProfilePage && userId ? userId : myUserId;
  const isMyProfile = myUserId === actualUserId;

  // visible controls enter/exit animation for overlay mode
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isProfilePage && passedProfile && passedStats) {
      setProfile(passedProfile);
      setStats(passedStats);
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (actualUserId) {
          const [profileData, statsData] = await Promise.all([getProfile(actualUserId), getProfileStats(actualUserId)]);
          setProfile(profileData);
          setStats(statsData);
        } else {
          if (currentUserProfile) {
            setProfile(currentUserProfile);
            const statsData = await getProfileStats(currentUserProfile._id);
            setStats(statsData);
          }
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Ошибка загрузки данных';
        setError(errorMessage);
        console.error('Failed to fetch user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isProfilePage && profileError) {
      setError(profileError);
      setIsLoading(false);
      return;
    }

    fetchUserData();
  }, [
    isProfilePage,
    passedProfile,
    passedStats,
    userId,
    actualUserId,
    currentUserProfile,
    profileLoading,
    profileError,
  ]);

  useEffect(() => {
    if (overlay) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    }
    // ensure visible is reset when not in overlay mode
    setVisible(false);
  }, [overlay]);

  const startClose = () => {
    setVisible(false);
    const t = setTimeout(() => onClose && onClose(), 300);
    return () => clearTimeout(t);
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
            visible ? 'opacity-40' : 'opacity-0'
          }`}
          onClick={startClose}
          aria-hidden
        />

        <aside
          className={`fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-lg p-6 overflow-y-auto z-50 transform transition-transform duration-300 ${
            visible ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Меню</h2>
            <button aria-label="Close sidebar" onClick={startClose} className="text-gray-600 dark:text-gray-200">
              ✕
            </button>
          </div>

          <div className="mb-6">
            {isLoading ? (
              <LeftSidebarSkeleton />
            ) : error ? (
              <LeftSidebarError error={error} />
            ) : (
              <LeftSidebarContent
                profile={profile}
                stats={stats}
                isMyProfile={passedIsMyProfile !== undefined ? passedIsMyProfile : isMyProfile}
                userId={passedUserId || actualUserId || undefined}
              />
            )}
          </div>

          <div id="navigation-menu" className="transition-colors">
            <nav>
              <ul className="space-y-1">
                <li>
                  <LinkWithProgress
                    href={`/profile/${actualUserId || myUserId || ''}`}
                    className="flex items-center py-2 px-3 rounded-md text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 font-medium cursor-pointer text-sm transition-colors hover:bg-primary-100 dark:hover:bg-primary-800"
                  >
                    <FontAwesomeIcon icon={faBullseye} className="w-4 mr-3 text-base" />
                    <span>Мои цели</span>
                  </LinkWithProgress>
                </li>
                <li>
                  <LinkWithProgress
                    href={`/profile/${actualUserId || myUserId || ''}/archive`}
                    className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium cursor-pointer text-sm transition-colors"
                  >
                    <FontAwesomeIcon icon={faArchive} className="w-4 mr-3 text-base" />
                    <span>Архивные цели</span>
                  </LinkWithProgress>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    );
  }

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
            isMyProfile={passedIsMyProfile !== undefined ? passedIsMyProfile : isMyProfile}
            userId={passedUserId || actualUserId || undefined}
          />
        )}
      </div>

      <div id="navigation-menu" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors">
        <nav>
          <ul className="space-y-1">
            <li>
              <LinkWithProgress
                href={`/profile/${actualUserId || myUserId || ''}`}
                className="flex items-center py-2 px-3 rounded-md text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 font-medium cursor-pointer text-sm transition-colors hover:bg-primary-100 dark:hover:bg-primary-800"
              >
                <FontAwesomeIcon icon={faBullseye} className="w-4 mr-3 text-base" />
                <span>Мои цели</span>
              </LinkWithProgress>
            </li>
            <li>
              <LinkWithProgress
                href={`/profile/${actualUserId || myUserId || ''}/archive`}
                className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium cursor-pointer text-sm transition-colors"
              >
                <FontAwesomeIcon icon={faArchive} className="w-4 mr-3 text-base" />
                <span>Архивные цели</span>
              </LinkWithProgress>
            </li>
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
