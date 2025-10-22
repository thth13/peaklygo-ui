import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function GroupGoalNotFound() {
  const t = await getTranslations('groupGoal.notFound');

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 text-6xl">🤝</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">{t('title')}</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">{t('description')}</p>
        <Link
          href="/group-goals"
          className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          {t('backToGoals')}
        </Link>
      </div>
    </div>
  );
}
