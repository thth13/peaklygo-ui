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
import { faBullseye, faArchive, faCrown } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import LinkWithProgress from '@/components/Link';

interface OverlaySidebarProps {
  userId?: string;
  onClose?: () => void;
}

const OverlaySidebar = ({ userId, onClose }: OverlaySidebarProps) => {
  const t = useTranslations('sidebar');
  const { profile: currentUserProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  const myUserId = Cookies.get('userId');
  const actualUserId = userId || myUserId;
  const isMyProfile = !!myUserId && myUserId === actualUserId;

  const isActivePage = (target: string, opts: { exact?: boolean } = {}) => {
    if (!pathname || !target) return false;
    const { exact = false } = opts;
    if (exact) return pathname === target; // strict
    return pathname === target || pathname.startsWith(target + '/');
  };

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
        const errorMessage = err?.response?.data?.message || err?.message || t('error.dataLoadingError');
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
  }, [userId, actualUserId, currentUserProfile, profileLoading, profileError, t]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const startClose = () => {
    setVisible(false);
    const timer = setTimeout(() => onClose && onClose(), 300);
    return () => clearTimeout(timer);
  };

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
          <h2 className="text-lg font-semibold">{t('menu')}</h2>
          <button aria-label={t('closeSidebar')} onClick={startClose} className="text-gray-600 dark:text-gray-200">
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
              isMyProfile={isMyProfile}
              userId={actualUserId || undefined}
            />
          )}
        </div>

        {myUserId && (
          <div id="navigation-menu" className="transition-colors">
            <nav>
              <ul className="space-y-1">
                <li>
                  <LinkWithProgress
                    href={`/profile/${myUserId}`}
                    onClick={startClose}
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
                    href={`/profile/${myUserId}/archive`}
                    onClick={startClose}
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
                    onClick={startClose}
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
              </ul>
            </nav>
          </div>
        )}
      </aside>
    </div>
  );
};

export default OverlaySidebar;
