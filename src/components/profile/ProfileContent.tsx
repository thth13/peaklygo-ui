import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import LinkWithProgress from '@/components/Link';
import { GoalCard } from '@/components/profile/GoalCard';
import { Goal } from '@/types';

interface ProfileContentProps {
  goals: Goal[];
  isMyProfile: boolean;
}

export function ProfileContent({ goals, isMyProfile }: ProfileContentProps) {
  return (
    <>
      <div id="goals-header" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {isMyProfile ? 'Мои цели' : 'Цели пользователя'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isMyProfile ? 'Управляйте своими целями и отслеживайте прогресс' : 'Цели и достижения пользователя'}
            </p>
          </div>
          {isMyProfile && (
            <LinkWithProgress
              href="/goal/create"
              className="bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 mr-2 text-base" />
              Новая цель
            </LinkWithProgress>
          )}
        </div>
      </div>
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {isMyProfile ? 'У вас пока нет целей' : 'У пользователя пока нет целей'}
          </p>
          {isMyProfile && (
            <LinkWithProgress
              href="/goal/create"
              className="inline-block mt-4 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Создать первую цель
            </LinkWithProgress>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} />
          ))}
        </div>
      )}
    </>
  );
}
