import { ProfileStats as ProfileStatsType } from '@/types';
import { useTranslations } from 'next-intl';

interface ProfileStatsProps {
  stats: ProfileStatsType | null;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const t = useTranslations('sidebar');

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      <div className="text-center">
        <div className="text-green-500 dark:text-green-400 font-bold text-lg">{stats?.completedGoals || 0}</div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">{t('achieved')}</div>
      </div>
      <div className="text-center">
        <div className="text-primary-500 dark:text-primary-400 font-bold text-lg">{stats?.activeGoalsNow || 0}</div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">{t('inProgress')}</div>
      </div>
      <div className="text-center">
        <div className="text-orange-500 dark:text-orange-400 font-bold text-lg">{stats?.closedTasks || 0}</div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">{t('tasks')}</div>
      </div>
    </div>
  );
}
