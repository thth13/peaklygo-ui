import type { Metadata } from 'next';
import { GroupGoalsList } from '@/components/group-goals/GroupGoalsList';
import { LeftSidebar } from '@/components/layout/sidebar';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('groupGoals');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function GroupGoalsPage() {
  const t = await getTranslations('groupGoals');
  const cookieStore = await cookies();
  const myUserId = cookieStore.get('userId')?.value;

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-2 py-6 md:flex-row md:px-4">
      <LeftSidebar userId={myUserId} />

      <section className="flex-1 rounded-2xl bg-white px-4 py-6 shadow-sm transition-colors dark:bg-gray-900 md:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('heading')}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            {t('actions.create')}
          </button>
        </div>

        <GroupGoalsList />
      </section>
    </main>
  );
}
