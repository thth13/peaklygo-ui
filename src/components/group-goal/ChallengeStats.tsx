'use client';

interface StatItem {
  label: string;
  value: string;
  emphasize?: boolean;
}

interface HighlightStat {
  value: string;
  label: string;
}

interface ChallengeStatsProps {
  challengeId: string;
  title?: string;
  stats?: StatItem[];
  highlight?: HighlightStat | null;
}

export default function ChallengeStats({ challengeId: _challengeId, title, stats, highlight }: ChallengeStatsProps) {
  const defaultStats: StatItem[] = [
    { label: 'Ваш прогресс', value: '13/15', emphasize: true },
    { label: 'Место в рейтинге', value: '#3 из 12' },
    { label: 'Лучшая серия', value: '8 дней' },
    { label: 'Осталось дней', value: '15' },
  ];

  const defaultHighlight: HighlightStat = { value: '87%', label: 'Ваша успешность' };

  const statsToRender = stats ?? defaultStats;
  const highlightToRender = highlight === undefined ? defaultHighlight : highlight;
  const titleToRender = title ?? 'Статистика';

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">{titleToRender}</h3>

      <div className="space-y-4">
        {statsToRender.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            <span
              className={`font-medium dark:text-gray-200 ${
                item.emphasize ? 'font-bold text-green-600 dark:text-green-400' : ''
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {highlightToRender && (
        <div className="mt-4 border-t pt-4 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{highlightToRender.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{highlightToRender.label}</div>
          </div>
        </div>
      )}
    </div>
  );
}
