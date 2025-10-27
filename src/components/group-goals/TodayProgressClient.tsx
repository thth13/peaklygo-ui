'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from '@/lib/navigation';
import { markGroupCheckIn } from '@/lib/api/goal';
import type { CheckInStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface TodayProgressClientProps {
  todaysCompleted: number;
  todaysTotal: number;
  todaysCompletion: number;
  reward?: string;
  consequence?: string;
  goalId: string;
  currentUserStatus: CheckInStatus | null;
}

export function TodayProgressClient({
  todaysCompleted,
  todaysTotal,
  todaysCompletion,
  reward,
  consequence,
  goalId,
  currentUserStatus,
}: TodayProgressClientProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const isCompleted = currentUserStatus === 'completed';

  const today = new Date();
  const todayLabel = `Сегодня, ${formatDate(today, locale)}`;

  const handleMarkParticipation = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const today = new Date();
      await markGroupCheckIn(goalId, today, !isCompleted);
      router.refresh();
    } catch (error) {
      console.error('Ошибка при отметке участия:', error);
      alert('Не удалось отметить участие. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-950/50 dark:to-purple-950/40">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{todayLabel}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {todaysCompleted} из {todaysTotal}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">{todaysCompletion}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">выполнение</div>
          </div>
        </div>

        <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, todaysCompletion))}%` }}
          ></div>
        </div>

        {isCompleted && (
          <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-green-100 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <FontAwesomeIcon icon={faCheckCircle} />
            Вы уже отметились сегодня
          </div>
        )}

        <button
          type="button"
          onClick={handleMarkParticipation}
          disabled={isLoading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-lg font-semibold text-white shadow-sm transition-all ${
            isCompleted
              ? 'bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700'
              : 'bg-green-500 hover:scale-[1.01] hover:bg-green-600'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <FontAwesomeIcon
            icon={isLoading ? faSpinner : faCheckCircle}
            className={`text-xl ${isLoading ? 'animate-spin' : ''}`}
          />
          {isLoading ? 'Обработка...' : isCompleted ? 'Отменить отметку' : 'Отметить участие'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-green-50 p-4 dark:bg-emerald-900/20">
          <div className="text-sm text-gray-500 dark:text-gray-300">Групповая награда</div>
          <div className="mt-2 font-medium text-green-700 dark:text-green-300">
            {reward?.trim() || 'Добавьте награду, чтобы мотивировать команду'}
          </div>
        </div>
        <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-sm text-gray-500 dark:text-gray-300">Штраф за пропуск</div>
          <div className="mt-2 font-medium text-red-600 dark:text-red-300">
            {consequence?.trim() || 'Опишите, что происходит при пропуске'}
          </div>
        </div>
      </div>
    </div>
  );
}
