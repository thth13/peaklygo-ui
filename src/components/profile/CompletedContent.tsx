import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

import LinkWithProgress from '@/components/Link';
import { GoalCard } from '@/components/profile/GoalCard';
import { Goal, PaginatedGoalsResponse } from '@/types';
import { Pagination } from '@/components/Pagination';

interface CompletedContentProps {
  completedGoalsData: Goal[] | PaginatedGoalsResponse;
  isMyProfile: boolean;
  userId: string;
  onPageChange?: (page: number) => void;
}

export function CompletedContent({ completedGoalsData, isMyProfile, userId, onPageChange }: CompletedContentProps) {
  const t = useTranslations('profile');
  const isPaginated = !Array.isArray(completedGoalsData);
  const completedGoals = isPaginated ? completedGoalsData.goals : completedGoalsData;
  const paginationData = isPaginated ? completedGoalsData : null;

  return (
    <>
      <div id="completed-goals-header" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <FontAwesomeIcon icon={faCircleCheck} className="w-6 mr-3 text-base" />
              {isMyProfile ? t('completed') : t('completedUserGoals')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isMyProfile ? t('completedDescription') : t('completedUserDescription')}
            </p>
          </div>
          {isMyProfile && (
            <LinkWithProgress
              href={`/profile/${userId}`}
              className="w-full md:w-auto bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon icon={faCircleCheck} className="w-4 mr-2 text-base" />
              {t('toActiveGoals')}
            </LinkWithProgress>
          )}
        </div>
      </div>
      {completedGoals.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faCircleCheck} className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {isMyProfile ? t('completedEmpty') : t('userCompletedEmpty')}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('completedEmptyDescription')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completedGoals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} displayMode="list" />
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
