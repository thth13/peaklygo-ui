'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import LinkWithProgress from '../Link';
import { RatingSummary } from './RatingSummary';
import { useUserProfile } from '@/context/UserProfileContext';
import { getProfile, getProfileStats } from '@/lib/api/profile';
import { ProfileStats, UserProfile } from '@/types';

interface LeftSidebarProps {
  userId?: string;
  stats?: ProfileStats;
}

export const LeftSidebar = ({ userId, stats: passedStats }: LeftSidebarProps) => {
  const { profile: currentUserProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Если передан userId, загружаем только профиль (stats уже переданы)
        if (userId) {
          const profileData = await getProfile(userId);
          setProfile(profileData);
          setStats(passedStats || null);
        } else {
          // Иначе используем данные текущего пользователя из контекста
          if (currentUserProfile) {
            setProfile(currentUserProfile);
            // Если stats не переданы, загружаем их
            if (passedStats) {
              setStats(passedStats);
            } else {
              const statsData = await getProfileStats(currentUserProfile._id);
              setStats(statsData);
            }
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

    // Если нет userId, ждем загрузки текущего пользователя
    if (!userId && profileLoading) {
      return;
    }

    // Если нет userId и есть ошибка загрузки текущего пользователя
    if (!userId && profileError) {
      setError(profileError);
      setIsLoading(false);
      return;
    }

    fetchUserData();
  }, [userId, passedStats, currentUserProfile, profileLoading, profileError]);

  return (
    <div id="left-sidebar" className="w-1/4 pr-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
        {isLoading ? (
          <LeftSidebarSkeleton />
        ) : error ? (
          <LeftSidebarError error={error} />
        ) : (
          <LeftSidebarContent profile={profile} stats={stats} />
        )}
      </div>

      {/* <div id="navigation-menu" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors">
        <nav>
          <ul className="space-y-1">
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 font-medium cursor-pointer text-sm transition-colors">
                <FontAwesomeIcon icon={faBullseye} className="w-4 mr-3 text-base" />
                <span>Мои цели</span>
              </span>
            </li>
            <li>
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
            </li>
          </ul>
        </nav>
      </div> */}
    </div>
  );
};

interface LeftSidebarContentProps {
  profile: UserProfile | null;
  stats: ProfileStats | null;
}

function LeftSidebarContent({ profile, stats }: LeftSidebarContentProps) {
  return (
    <>
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-16 w-16 rounded-full overflow-hidden">
          <img
            src={profile?.avatar || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile?.name || 'Пользователь'}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            @
            {typeof profile?.user === 'object'
              ? profile.user.username
              : profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
          </p>
        </div>
      </div>

      <RatingSummary rating={profile?.rating || 0} />

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="text-center">
          <div className="text-green-500 dark:text-green-400 font-bold text-lg">{stats?.completedGoals || 0}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">Достигнуто</div>
        </div>
        <div className="text-center">
          <div className="text-primary-500 dark:text-primary-400 font-bold text-lg">{stats?.activeGoalsNow || 0}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">В процессе</div>
        </div>
        <div className="text-center">
          <div className="text-orange-500 dark:text-orange-400 font-bold text-lg">{stats?.closedTasks || 0}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">Задач</div>
        </div>
      </div>

      <LinkWithProgress
        href="/goal/create"
        className="w-full bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-all text-sm"
      >
        <FontAwesomeIcon icon={faPlus} className="w-4 mr-2 text-base" />
        <span>Добавить цель</span>
      </LinkWithProgress>
    </>
  );
}

function LeftSidebarSkeleton() {
  return (
    <>
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="text-center">
            <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 mx-auto"></div>
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
          </div>
        ))}
      </div>

      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    </>
  );
}

interface LeftSidebarErrorProps {
  error: string;
}

function LeftSidebarError({ error }: LeftSidebarErrorProps) {
  return (
    <div className="text-center py-4">
      <div className="text-red-500 dark:text-red-400 mb-2">
        <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Ошибка загрузки профиля</p>
      <p className="text-red-500 dark:text-red-400 text-xs mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-3 py-1 rounded transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  );
}
