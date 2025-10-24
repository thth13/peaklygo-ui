import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface TodayProgressProps {
  todayLabel: string;
  todaysCompleted: number;
  todaysTotal: number;
  todaysCompletion: number;
  completionLabel: string;
  completedText: string;
  checkInButtonText: string;
  reward?: string;
  consequence?: string;
  rewardTitle: string;
  rewardFallback: string;
  consequenceTitle: string;
  consequenceFallback: string;
}

export function TodayProgress({
  todayLabel,
  todaysCompleted,
  todaysTotal,
  todaysCompletion,
  completionLabel,
  completedText,
  checkInButtonText,
  reward,
  consequence,
  rewardTitle,
  rewardFallback,
  consequenceTitle,
  consequenceFallback,
}: TodayProgressProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-950/50 dark:to-purple-950/40">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{todayLabel}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {todaysCompleted} {completedText} {todaysTotal}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">{todaysCompletion}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{completionLabel}</div>
          </div>
        </div>

        <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, todaysCompletion))}%` }}
          ></div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-lg font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] hover:bg-green-600"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
          {checkInButtonText}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-green-50 p-4 dark:bg-emerald-900/20">
          <div className="text-sm text-gray-500 dark:text-gray-300">{rewardTitle}</div>
          <div className="mt-2 font-medium text-green-700 dark:text-green-300">{reward?.trim() || rewardFallback}</div>
        </div>
        <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-sm text-gray-500 dark:text-gray-300">{consequenceTitle}</div>
          <div className="mt-2 font-medium text-red-600 dark:text-red-300">
            {consequence?.trim() || consequenceFallback}
          </div>
        </div>
      </div>
    </div>
  );
}
