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
import { faBullseye, faArchive, faCrown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import LinkWithProgress from '@/components/Link';

interface LeftSidebarProps {
  userId?: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    if (typeof apiError.message === 'string') {
      return apiError.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
};

export const LeftSidebar = ({ userId }: LeftSidebarProps) => {
  const t = useTranslations('sidebar');
  const defaultErrorMessage = t('error.dataLoadingError');
  const notFoundProfileMessage = t('error.profileNotFound');
  const {
    profile: currentUserProfile,
    isLoading: profileLoading,
    error: profileError,
    userStats: currentUserStats,
  } = useUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const pathname = usePathname();

  const actualUserId = userId || myUserId;
  const isMyProfile = !!myUserId && myUserId === actualUserId;

  const isActivePage = (target: string, opts: { exact?: boolean } = {}) => {
    if (!pathname || !target) return false;
    const { exact = false } = opts;
    if (exact) return pathname === target; // strict
    return pathname === target || pathname.startsWith(target + '/');
  };

  useEffect(() => {
    const storedUserId = Cookies.get('userId');
    setMyUserId(storedUserId || null);
  }, []);

  useEffect(() => {
    if (!isMyProfile) {
      return;
    }

    if (profileLoading || (!currentUserProfile && !profileError)) {
      setIsLoading(true);
      return;
    }

    setProfile(currentUserProfile ?? null);
    setStats(currentUserStats ?? null);
    setError(profileError);
    setIsLoading(false);
  }, [isMyProfile, currentUserProfile, currentUserStats, profileError, profileLoading]);

  useEffect(() => {
    let isCancelled = false;

    const fetchUserData = async () => {
      if (!actualUserId || isMyProfile) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setProfile(null);
        setStats(null);
        const [profileResult, statsResult] = await Promise.allSettled([
          getProfile(actualUserId),
          getProfileStats(actualUserId),
        ]);

        if (isCancelled) {
          return;
        }

        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value);
          setError(null);
        } else {
          const profileErrorResult = profileResult.reason as ApiError;
          if (profileErrorResult.response?.status === 404) {
            setError(notFoundProfileMessage);
            return;
          }
          const errorMessage = getErrorMessage(profileResult.reason, defaultErrorMessage);
          setError(errorMessage);
          return;
        }

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value);
        } else {
          const statsError = statsResult.reason as ApiError;
          if (statsError.response?.status === 404) {
            setStats(null);
            return;
          }

          const errorMessage = getErrorMessage(statsResult.reason, defaultErrorMessage);
          setError(errorMessage);
        }
      } catch (err: unknown) {
        if (isCancelled) {
          return;
        }
        const errorMessage = getErrorMessage(err, defaultErrorMessage);
        setError(errorMessage);
        console.error('Failed to fetch user data:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isCancelled = true;
    };
  }, [actualUserId, isMyProfile, defaultErrorMessage]);

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

      {myUserId && (
        <div id="navigation-menu" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors">
          <nav>
            <ul className="space-y-1">
              <li>
                <LinkWithProgress
                  href={`/profile/${myUserId}`}
                  className={`flex items-center py-2 px-3 rounded-md font-medium cursor-pointer text-sm transition-colors ${
                    isActivePage(`/profile/${myUserId}`, { exact: true })
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faBullseye} className="w-4 mr-3 text-base" />
                  <span>{t('myGoals')}</span>
                </LinkWithProgress>
              </li>
              <li>
                <LinkWithProgress
                  href={`/profile/${myUserId}/completed`}
                  className={`flex items-center py-2 px-3 rounded-md font-medium cursor-pointer text-sm transition-colors ${
                    isActivePage(`/profile/${myUserId}/completed`)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faCircleCheck} className="w-4 mr-3 text-base" />
                  <span>{t('completedGoals')}</span>
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
                  <span>{t('archivedGoals')}</span>
                </LinkWithProgress>
              </li>
              <li>
                <LinkWithProgress
                  href="/pricing"
                  className={`flex items-center py-2 px-3 rounded-md font-medium cursor-pointer text-sm transition-colors ${
                    isActivePage(`/pricing`, { exact: true })
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faCrown} className="w-4 mr-3 text-base" />
                  <span>{t('pricing')}</span>
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
      )}
    </div>
  );
};
