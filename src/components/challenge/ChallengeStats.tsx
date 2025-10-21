'use client';

import { useState, useEffect } from 'react';

interface ChallengeStatsProps {
  challengeId: string;
}

interface UserStats {
  progress: string;
  rank: string;
  bestStreak: string;
  daysLeft: string;
  successRate: string;
}

export default function ChallengeStats({ challengeId }: ChallengeStatsProps) {
  const [stats, setStats] = useState<UserStats>({
    progress: '13/15',
    rank: '#3 из 12',
    bestStreak: '8 дней',
    daysLeft: '15',
    successRate: '87%',
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Статистика</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Ваш прогресс</span>
          <span className="font-bold text-green-600 dark:text-green-400">{stats.progress}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Место в рейтинге</span>
          <span className="font-medium dark:text-gray-200">{stats.rank}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Лучшая серия</span>
          <span className="font-medium dark:text-gray-200">{stats.bestStreak}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Осталось дней</span>
          <span className="font-medium dark:text-gray-200">{stats.daysLeft}</span>
        </div>
      </div>

      <div className="mt-4 border-t pt-4 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.successRate}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Ваша успешность</div>
        </div>
      </div>
    </div>
  );
}
