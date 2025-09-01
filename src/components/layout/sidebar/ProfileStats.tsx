import { ProfileStats as ProfileStatsType } from '@/types';

interface ProfileStatsProps {
  stats: ProfileStatsType | null;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      <div className="text-center">
        <div className="text-green-500 dark:text-green-400 font-bold text-lg">{stats?.completedGoals || 0}</div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">Достигнуто</div>
      </div>
      <div className="text-center">
        <div className="text-primary-500 dark:text-primary-400 font-bold text-lg">{stats?.activeGoalsNow || 0}</div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">В процессе</div>
      </div>
      <div className="text-center">
        <div className="text-orange-500 dark:text-orange-400 font-bold text-lg">{stats?.closedTasks || 0}</div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">Задач</div>
      </div>
    </div>
  );
}
