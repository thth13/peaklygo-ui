import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive } from '@fortawesome/free-solid-svg-icons';

import LinkWithProgress from '@/components/Link';
import { GoalCard } from '@/components/profile/GoalCard';
import { Goal, PaginatedGoalsResponse } from '@/types';
import { Pagination } from '@/components/Pagination';

interface ArchivedContentProps {
  archivedGoalsData: Goal[] | PaginatedGoalsResponse;
  isMyProfile: boolean;
  userId: string;
  onPageChange?: (page: number) => void;
}

export function ArchivedContent({ archivedGoalsData, isMyProfile, userId, onPageChange }: ArchivedContentProps) {
  const isPaginated = !Array.isArray(archivedGoalsData);
  const archivedGoals = isPaginated ? archivedGoalsData.goals : archivedGoalsData;
  const paginationData = isPaginated ? archivedGoalsData : null;

  return (
    <>
      <div id="archived-goals-header" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <FontAwesomeIcon icon={faArchive} className="w-6 mr-3 text-base" />
              {isMyProfile ? 'Архивные цели' : 'Архивные цели пользователя'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isMyProfile
                ? 'Ваши завершенные и архивированные цели'
                : 'Завершенные и архивированные цели пользователя'}
            </p>
          </div>
          {isMyProfile && (
            <LinkWithProgress
              href={`/profile/${userId}`}
              className="bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <FontAwesomeIcon icon={faArchive} className="w-4 mr-2 text-base" />К активным целям
            </LinkWithProgress>
          )}
        </div>
      </div>
      {archivedGoals.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faArchive} className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {isMyProfile ? 'У вас пока нет архивных целей' : 'У пользователя пока нет архивных целей'}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Архивированные цели появятся здесь после их завершения или архивирования
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {archivedGoals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} isArchived={true} />
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
