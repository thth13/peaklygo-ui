import { ProfileStats } from '@/types';

interface RightSidebarProps {
  stats: ProfileStats;
}

export const RightSidebar = ({ stats }: RightSidebarProps) => {
  return (
    <div id="right-sidebar" className="w-1/4 pl-6">
      <div id="quick-stats" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Статистика</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Этот месяц</span>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              +{stats?.goalsCreatedThisMonth || 0} цели
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Активных</span>
            <span className="text-primary-600 dark:text-primary-400 font-semibold">{stats?.activeGoalsNow || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Выполненых</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats?.completedGoals || 0}</span>
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
        </div>
      </div>
    </div>
  );
};
