'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStopPropagation } from '@/hooks/useStopPropagation';
import {
  faCalendar as faCalendarRegular,
  faEllipsisVertical,
  faCoins,
  faPencil,
  faChartLine,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import { Goal } from '@/types';
import { formatDate } from '@/lib/utils';
import { IMAGE_URL } from '@/constants';
import Link from '@/components/Link';
import { deleteGoal } from '@/lib/api/goal';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard = ({ goal }: GoalCardProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { stopPropagation } = useStopPropagation();

  const handleEdit = stopPropagation(() => {
    setIsMenuOpen(false);

    router.push(`/goal/${goal._id}/edit`);
  });

  const handleDelete = stopPropagation(async () => {
    setIsMenuOpen(false);
    await deleteGoal(goal._id);

    router.refresh();
  });

  return (
    <Link
      href={`/goal/${goal._id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 border-l-4 border-primary-500 dark:border-primary-400 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start space-x-4 mb-4">
        {goal.image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img className="w-full h-full object-cover" src={`${IMAGE_URL}/${goal.image}`} alt="goal image" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{goal.goalName}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Создано {formatDate(goal.startDate)}</p>
            </div>
            <div className="flex items-center space-x-2 relative group">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium
                  ${
                    goal.isCompleted
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  }
                `}
              >
                {goal.isCompleted ? 'Достигнуто' : 'В процессе'}
              </span>
              <div className="relative">
                <button
                  onClick={stopPropagation(() => setIsMenuOpen(!isMenuOpen))}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} className="w-1" />
                </button>
                {isMenuOpen && (
                  <div
                    className="absolute right-0 top-8 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20"
                    onClick={stopPropagation()}
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Редактировать цель
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Удалить цель
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">{goal.description}</p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Прогресс</span>
              <span
                className={`text-sm font-medium ${
                  goal.progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {goal.progress === 100 ? 'Завершено!' : `${goal.progress}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  goal.progress === 100 ? 'bg-green-500 dark:bg-green-400' : 'bg-primary-500 dark:bg-primary-400'
                }`}
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            {goal.endDate && (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarRegular} className="w-4 mr-2" />
                <span>Дедлайн: {formatDate(goal.endDate)}</span>
              </div>
            )}

            <div className="flex items-center">
              <FontAwesomeIcon icon={faCoins} className="w-4 mr-2" />
              <span>Ценность: {goal.value} баллов</span>
            </div>
          </div>

          {/* <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex space-x-4">
              <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center">
                <FontAwesomeIcon icon={faPencil} className="w-4 mr-1" />
                Редактировать
              </button>
              <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="w-4 mr-1" />
                Прогресс
              </button>
            </div>
            <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center">
              <FontAwesomeIcon icon={faShare} className="w-4 mr-1" />
              Поделиться
            </button>
          </div> */}
        </div>
      </div>
    </Link>
  );
};
