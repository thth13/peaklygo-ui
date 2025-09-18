'use client';

import { useState } from 'react';
import { Goal } from '@/types';
import { GoalSteps } from './GoalSteps';
import { IMAGE_URL } from '@/constants';
import { formatDate } from '@/lib/utils';
import { ProgressBlog } from './ProgressBlog';
import { useTranslations, useLocale } from 'next-intl';

interface GoalProgressProps {
  goal: Goal;
  goalId: string;
  currentUserId?: string;
}

export const GoalProgress = ({ goal, goalId, currentUserId }: GoalProgressProps) => {
  const [progress, setProgress] = useState(goal.progress);
  const t = useTranslations();
  const locale = useLocale();

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handleGoalComplete = () => {
    // window.location.reload();
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
      {goal.image ? (
        <div className="relative">
          <div
            className="h-64 bg-cover bg-center relative rounded-lg"
            style={{
              backgroundImage: `url(${IMAGE_URL}/${goal.image})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>

            <div className="absolute left-0 bottom-0 z-10 text-white p-6">
              <div className="text-3xl font-bold mb-1">
                {progress}% {t('common.completed')}
              </div>
              {goal.endDate && (
                <div className="text-md mt-1 text-white/80">
                  {daysLeft && daysLeft > 0
                    ? `${daysLeft} ${t('goals.daysToDeadline')}`
                    : `${t('goals.deadlinePassed')} ${Math.abs(daysLeft || 0)} ${t('goals.daysAfterDeadline')}`}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 p-6 rounded-lg">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-3xl font-bold mb-1">
                {progress}% {t('common.completed')}
              </div>
              {goal.endDate && (
                <div className="text-white/80">
                  {daysLeft && daysLeft > 0
                    ? `${daysLeft} ${t('goals.daysToDeadline')}`
                    : `${t('goals.deadlinePassed')} ${Math.abs(daysLeft || 0)} ${t('goals.daysAfterDeadline')}`}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-white/80 text-sm mb-2">{t('goals.overallProgress')}</div>
              <div className="w-24 bg-white/20 h-2 rounded-full">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Описание цели */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('goals.goalDescription')}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{goal.description || t('goals.noDescription')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('goals.startDate')}</h4>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(goal.startDate, locale)}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('goals.endDate')}</h4>
            <p className="text-gray-900 dark:text-gray-100">
              {goal.endDate ? formatDate(goal.endDate, locale) : t('goals.notSpecified')}
            </p>
          </div>
        </div>

        {goal.image && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">{t('goals.overallProgress')}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
              <div
                className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {goal.reward && (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">{t('goals.reward')}</h4>
              <p className="text-green-700 dark:text-green-300">{goal.reward}</p>
            </div>
          )}
          {goal.consequence && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">{t('goals.consequence')}</h4>
              <p className="text-red-700 dark:text-red-300">{goal.consequence}</p>
            </div>
          )}
        </div>

        {goal.steps.length > 0 && (
          <GoalSteps
            steps={goal.steps}
            goalId={goalId}
            currentUserId={currentUserId}
            goalUserId={goal.userId}
            onProgressUpdate={handleProgressUpdate}
            onGoalComplete={handleGoalComplete}
          />
        )}

        <ProgressBlog isOwner={currentUserId === goal.userId} />
      </div>
    </>
  );
};
