import { useTranslations } from 'next-intl';

interface MotivationSectionProps {
  reward?: string;
  consequence?: string;
}

export function MotivationSection({ reward, consequence }: MotivationSectionProps) {
  const t = useTranslations('groupGoal.motivation');
  const title = t('title');
  const rewardTitle = t('reward');
  const consequenceTitle = t('consequence');
  const rewardFallback = 'Добавьте награду за общее выполнение цели.';
  const consequenceFallback = 'Опишите, что случится при невыполнении цели.';
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <div className="rounded-xl bg-green-50 px-4 py-3 dark:bg-emerald-900/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-300">
            {rewardTitle}
          </div>
          <div className="mt-2 font-medium text-gray-800 dark:text-white">{reward?.trim() || rewardFallback}</div>
        </div>
        <div className="rounded-xl bg-red-50 px-4 py-3 dark:bg-red-900/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
            {consequenceTitle}
          </div>
          <div className="mt-2 font-medium text-gray-800 dark:text-white">
            {consequence?.trim() || consequenceFallback}
          </div>
        </div>
      </div>
    </section>
  );
}
