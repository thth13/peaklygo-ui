'use client';

import { Suspense, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTh, faList } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

import { RightSidebar } from '@/components/layout/RightSidebar';
import { RightSidebarSkeleton } from '@/components/layout/RightSidebarSkeleton';
import { LeftSidebar } from '@/components/layout/sidebar';
import LinkWithProgress from '@/components/Link';
import { GoalCard } from '@/components/profile/GoalCard';
import MobileProfileHeader from '@/components/profile/MobileProfileHeader';
import { Pagination } from '@/components/Pagination';
import { Goal, ProfileStats, PaginatedGoalsResponse, UserProfile } from '@/types';
import { useViewMode } from '@/context/ViewModeContext';
import { getGoals } from '@/lib/api/goal';
import { GOALS_PER_PAGE } from '@/constants';

interface ProfilePageContentProps {
  userId: string;
  profile: UserProfile;
  stats: ProfileStats;
  isMyProfile: boolean;
  goalsData: Goal[] | PaginatedGoalsResponse;
}

export function ProfilePageContent({ userId, profile, stats, isMyProfile, goalsData: initialGoals }: ProfilePageContentProps) {
  const { showRightSidebar, viewMode, setViewMode, isLoading: isViewModeUpdating } = useViewMode();
  const [goalsData, setGoalsData] = useState<Goal[] | PaginatedGoalsResponse>(initialGoals);
  const [isFetchingGoals, setIsFetchingGoals] = useState(false);
  const t = useTranslations('profile');

  const handlePageChange = async (page: number) => {
    setIsFetchingGoals(true);
    try {
      const data = await getGoals(userId, { page, limit: GOALS_PER_PAGE });
      setGoalsData(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setIsFetchingGoals(false);
    }
  };

  const handleGoalArchived = (goalId: string) => {
    setGoalsData((currentData) => {
      if (Array.isArray(currentData)) {
        return currentData.filter((goal) => goal._id !== goalId);
      }

      return {
        ...currentData,
        goals: currentData.goals.filter((goal) => goal._id !== goalId),
        total: Math.max(0, currentData.total - 1),
      };
    });
  };

  const isPaginated = !Array.isArray(goalsData);
  const goals = isPaginated ? goalsData.goals : goalsData;
  const paginationData = isPaginated ? goalsData : null;

  return (
    <main className="max-w-7xl mx-auto mt-6 px-2 md:px-4 flex">
      <LeftSidebar userId={userId} />
      <div id="main-content" className={`w-full px-2 md:px-6 ${showRightSidebar ? 'flex-1' : 'flex-1'}`}>
        <MobileProfileHeader profile={profile} stats={stats} isMyProfile={isMyProfile} userId={userId} />

        <div id="goals-header" className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {isMyProfile ? t('myGoals') : t('userGoals')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isMyProfile ? t('manageGoalsDescription') : t('userGoalsDescription')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title={t('viewModes.grid')}
                >
                  <FontAwesomeIcon icon={faTh} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title={t('viewModes.list')}
                >
                  <FontAwesomeIcon icon={faList} className="w-4 h-4" />
                </button>
              </div>
              {isMyProfile && (
                <div data-tour="create-goal-button">
                  <LinkWithProgress
                    href="/goal/create"
                    className="w-full md:w-auto bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-4 mr-2 text-base" />
                    {t('newGoal')}
                  </LinkWithProgress>
                </div>
              )}
            </div>
          </div>
        </div>

        {isFetchingGoals ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">{isMyProfile ? t('noGoals') : t('userNoGoals')}</p>
            {isMyProfile && (
              <LinkWithProgress
                href="/goal/create"
                className="inline-block mt-4 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t('createFirstGoal')}
              </LinkWithProgress>
            )}
          </div>
        ) : isViewModeUpdating ? (
          <div className="space-y-6">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
            {goals.map((goal) => (
              <GoalCard key={goal._id} goal={goal} onGoalArchived={handleGoalArchived} displayMode={viewMode} />
            ))}
          </div>
        )}

        {paginationData && (
          <Pagination
            currentPage={paginationData.page}
            totalPages={paginationData.totalPages}
            hasNextPage={paginationData.hasNextPage}
            hasPrevPage={paginationData.hasPrevPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      {showRightSidebar && (
        <Suspense fallback={<RightSidebarSkeleton />}>
          <RightSidebar stats={stats} />
        </Suspense>
      )}
    </main>
  );
}
