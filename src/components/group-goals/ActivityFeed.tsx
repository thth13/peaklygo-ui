import { useTranslations } from 'next-intl';

interface ActivityItem {
  id: string;
  text: string;
  date: string;
}

interface ActivityFeedProps {
  activityItems: ActivityItem[];
}

export function ActivityFeed({ activityItems }: ActivityFeedProps) {
  const t = useTranslations('groupGoal.activity');
  const title = t('title');
  const emptyText = t('empty');

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-300">
        {activityItems.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-4 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
            {emptyText}
          </div>
        ) : (
          activityItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">{item.text}</div>
                <div className="text-xs text-gray-400">{item.date}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* <button
        type="button"
        className="mt-4 w-full rounded-xl border border-transparent py-2 text-sm font-medium text-primary-600 transition-colors hover:border-primary-200 hover:bg-primary-50"
      >
        {showAllText}
      </button> */}
    </section>
  );
}
