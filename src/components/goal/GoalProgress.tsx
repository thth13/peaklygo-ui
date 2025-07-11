'use client';

import { useState } from 'react';
import { Goal } from '@/types';
import { GoalSteps } from './GoalSteps';
import { IMAGE_URL } from '@/constants';
import { formatDate } from '@/lib/utils';

interface GoalProgressProps {
  goal: Goal;
  goalId: string;
}

export const GoalProgress = ({ goal, goalId }: GoalProgressProps) => {
  const [progress, setProgress] = useState(goal.progress);

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };

  const getDaysLeft = () => {
    if (!goal.endDate) return null;
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysLeft();

  return (
    <>
      {/* Изображение с прогрессом */}
      <div className="relative">
        <div
          className="h-64 bg-cover bg-center relative rounded-lg"
          style={{
            backgroundImage: goal.image
              ? `url(${IMAGE_URL}/${goal.image})`
              : 'linear-gradient(to right, #020303, #111827)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Полупрозрачный overlay для читаемости текста */}
          <div className="absolute inset-0  bg-black/20"></div>

          {/* Текст в левом нижнем углу */}
          <div className="absolute left-0 bottom-0 z-10 text-white p-6">
            <div className="text-3xl font-bold mb-1">{progress}% завершено</div>
            {goal.endDate && (
              <div className="text-md mt-1 text-black-200">
                {daysLeft && daysLeft > 0
                  ? `${daysLeft} дней до дедлайна`
                  : `Дедлайн прошел ${Math.abs(daysLeft || 0)} дней назад`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Описание цели */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Описание цели</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{goal.description || 'Описание не указано'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Дата начала</h4>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(goal.startDate)}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Дедлайн</h4>
            <p className="text-gray-900 dark:text-gray-100">{goal.endDate ? formatDate(goal.endDate) : 'Не указан'}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Общий прогресс</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
            <div
              className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {goal.reward && (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Награда за выполнение</h4>
              <p className="text-green-700 dark:text-green-300">{goal.reward}</p>
            </div>
          )}
          {goal.consequence && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Последствие провала</h4>
              <p className="text-red-700 dark:text-red-300">{goal.consequence}</p>
            </div>
          )}
        </div>

        {/* Этапы выполнения */}
        {goal.steps.length > 0 && (
          <GoalSteps steps={goal.steps} goalId={goalId} onProgressUpdate={handleProgressUpdate} />
        )}
      </div>
    </>
  );
};
