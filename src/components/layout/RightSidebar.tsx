'use client';

import { useEffect, useState } from 'react';
import { getProfileStats } from '@/lib/api/profile';
import { ProfileStats } from '@/types';

interface RightSidebarProps {
  userId: string;
}

export const RightSidebar = ({ userId }: RightSidebarProps) => {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getProfileStats(userId);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch profile stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return (
    <div id="right-sidebar" className="w-1/4 pl-6">
      <div id="quick-stats" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Статистика</h3>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Загрузка...</span>
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Этот месяц</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  +{stats?.goalsCreatedThisMonth || 0} цели
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Активных</span>
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {stats?.activeGoalsNow || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Выполненых</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {stats?.completedGoals || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Закрытых задач</span>
                <span className="text-orange-600 dark:text-orange-400 font-semibold">{stats?.closedTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Записей в блоге</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{stats?.blogPosts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Рейтинг</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">{stats?.rating || 0}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
