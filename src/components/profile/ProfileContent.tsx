import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTh, faList } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

import LinkWithProgress from '@/components/Link';
import { GoalCard } from '@/components/profile/GoalCard';
import { Goal, PaginatedGoalsResponse } from '@/types';
import { Pagination } from '@/components/Pagination';
import { useViewMode } from '@/context/ViewModeContext';

interface ProfileContentProps {
  goalsData: Goal[] | PaginatedGoalsResponse;
  isMyProfile: boolean;
  onPageChange?: (page: number) => void;
  onGoalArchived?: (goalId: string) => void;
}

export function ProfileContent({ goalsData, isMyProfile, onPageChange, onGoalArchived }: ProfileContentProps) {
  const t = useTranslations('profile');
  const { viewMode, setViewMode, isLoading } = useViewMode();
  const isPaginated = !Array.isArray(goalsData);
  const goals = isPaginated ? goalsData.goals : goalsData;
  const paginationData = isPaginated ? goalsData : null;

  return (
    <>
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
            {/* View Mode Toggle */}
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
      {goals.length === 0 ? (
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
      ) : isLoading ? (
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
            <GoalCard key={goal._id} goal={goal} onGoalArchived={onGoalArchived} />
          ))}
        </div>
      )}

      {paginationData && onPageChange && (
        <Pagination
          currentPage={paginationData.page}
          totalPages={paginationData.totalPages}
          hasNextPage={paginationData.hasNextPage}
          hasPrevPage={paginationData.hasPrevPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
