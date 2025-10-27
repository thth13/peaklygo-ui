import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface GroupGoalHeroProps {
  heroImage: string;
  goalName: string;
  totalParticipants: number;
  progressValue: number;
  description?: string;
  startDateLabel: string;
  endDateLabel: string;
  privacyLabel: string;
}

export function GroupGoalHero({
  heroImage,
  goalName,
  totalParticipants,
  progressValue,
  description,
  startDateLabel,
  endDateLabel,
  privacyLabel,
}: GroupGoalHeroProps) {
  const t = useTranslations('groupGoal.details');
  const progressText = t('teamProgress');
  const descriptionTitle = t('descriptionTitle');
  const descriptionFallback = t('descriptionFallback');
  const startDateTitle = t('startDate');
  const endDateTitle = t('endDate');
  const privacyTitle = t('privacy');
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition-colors dark:bg-gray-900">
      <div className="relative h-64">
        <Image
          src={heroImage}
          alt={goalName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 720px"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="mb-1 text-2xl font-bold">
            {totalParticipants > 0
              ? `${totalParticipants} участник${totalParticipants === 1 ? '' : totalParticipants < 5 ? 'а' : 'ов'}`
              : 'Без участников'}
          </div>
          <div className="text-sm opacity-90">
            {progressText}: {progressValue}%
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{descriptionTitle}</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{description?.trim() || descriptionFallback}</p>
        </div>

        <dl className="grid grid-cols-1 gap-4 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
            <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{startDateTitle}</dt>
            <dd className="mt-2 font-semibold text-gray-800 dark:text-white">{startDateLabel}</dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
            <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{endDateTitle}</dt>
            <dd className="mt-2 font-semibold text-gray-800 dark:text-white">{endDateLabel}</dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
            <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{privacyTitle}</dt>
            <dd className="mt-2 font-semibold text-gray-800 dark:text-white">{privacyLabel}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
