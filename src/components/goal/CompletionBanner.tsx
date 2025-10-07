import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCalendarCheck, faClock, faStar } from '@fortawesome/free-solid-svg-icons';
import { useTranslations, useLocale } from 'next-intl';
import { formatDate } from '@/lib/utils';
import { Goal, ActivityType } from '@/types';

interface CompletionBannerProps {
  goal: Goal;
}

export function CompletionBanner({ goal }: CompletionBannerProps) {
  const t = useTranslations();
  const locale = useLocale();

  if (!goal.isCompleted) {
    return null;
  }

  // Найти дату завершения из активности
  const completionActivity = goal.activity.find((activity) => activity.activityType === ActivityType.CompletedGoal);
  const completionDate = completionActivity?.date || goal.updatedAt;

  // Вычислить количество дней выполнения
  const getDurationDays = () => {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(completionDate);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const durationDays = getDurationDays();

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden">
      {/* Декоративная иконка в фоне */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <FontAwesomeIcon icon={faTrophy} className="text-9xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <FontAwesomeIcon icon={faTrophy} className="text-2xl text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold mb-2 break-words">{t('congratulations.goalCompleted.title')}</h2>
            <p className="text-green-100 text-base break-words">
              {t('congratulations.goalCompleted.description', {
                goalName: goal.goalName,
                value: goal.value,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-lg flex-shrink-0" />
            <span className="text-sm">
              {t('congratulations.goalCompleted.completedOn', {
                date: formatDate(completionDate, locale),
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faClock} className="text-lg flex-shrink-0" />
            <span className="text-sm">
              {t('congratulations.goalCompleted.duration', {
                days: durationDays,
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faStar} className="text-lg flex-shrink-0" />
            <span className="text-sm">
              {t('congratulations.goalCompleted.ratingEarned', {
                value: goal.value,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
