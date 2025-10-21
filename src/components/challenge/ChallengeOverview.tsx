'use client';

import { Challenge } from '@/types';

interface ChallengeOverviewProps {
  challenge: Challenge;
}

export default function ChallengeOverview({ challenge }: ChallengeOverviewProps) {
  const progressPercent = (challenge.currentDay / challenge.totalDays) * 100;

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">О челлендже</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{challenge.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">День {challenge.currentDay}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">из {challenge.totalDays} дней</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {challenge.activeParticipantsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Активных участников</div>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 text-center dark:bg-yellow-900/20">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{challenge.currentDay}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Дней прошло</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{challenge.overallSuccessRate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Общий успех</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Прогресс челленджа</span>
          <span className="font-medium dark:text-gray-200">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-3 rounded-full bg-primary-500 dark:bg-primary-400"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
