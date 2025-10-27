import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Contributor {
  id: string;
  name: string;
  avatarUrl: string | null;
  contributionScore: number;
}

interface TopContributorsProps {
  contributors: Contributor[];
  locale: string;
}

export function TopContributors({ contributors, locale }: TopContributorsProps) {
  const t = useTranslations('groupGoal.contributors');
  const title = t('title');
  const emptyText = 'Лидеры появятся после первых отметок.';
  const subtitleText = 'Вклад в команду';
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-4">
        {contributors.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
            {emptyText}
          </div>
        ) : (
          contributors.map((contributor) => (
            <div key={contributor.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                  {contributor.avatarUrl ? (
                    <Image
                      src={contributor.avatarUrl}
                      alt={contributor.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
                      {contributor.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{contributor.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{subtitleText}</div>
                </div>
              </div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                {contributor.contributionScore.toLocaleString(locale)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
