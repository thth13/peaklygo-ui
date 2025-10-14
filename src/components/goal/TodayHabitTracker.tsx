'use client';

import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { markHabitDay } from '@/lib/api/goal';

interface TodayHabitTrackerProps {
  goalId: string;
  currentStreak?: number;
  onMarkComplete?: (date: Date, isCompleted: boolean) => void;
  isCompleted?: boolean;
}

export function TodayHabitTracker({
  goalId,
  currentStreak = 12,
  onMarkComplete,
  isCompleted = false,
}: TodayHabitTrackerProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isMarking, setIsMarking] = useState(false);
  const [localIsCompleted, setLocalIsCompleted] = useState<boolean>(false);

  const handleMarkComplete = async () => {
    if (isMarking) return;

    setIsMarking(true);
    try {
      const today = new Date();
      // const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const newCompletedState = !localIsCompleted;

      await markHabitDay(goalId, today, newCompletedState);

      setLocalIsCompleted(newCompletedState);
      onMarkComplete?.(today, newCompletedState);
    } catch (error) {
      console.error('Failed to mark habit day:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'ua' ? 'uk-UA' : 'en-US', {
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    setLocalIsCompleted(isCompleted);
  }, [isCompleted]);

  return (
    <div
      className={`p-6 rounded-lg mb-6 transition-colors ${
        localIsCompleted
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {t('habits.today')}, {formattedDate}
          </h4>
          {localIsCompleted ? (
            <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              {t('habits.completedForToday')}
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('habits.markCompletionForToday')}</p>
          )}
        </div>
        <div className="text-right">
          <div
            className={`text-2xl font-bold ${
              localIsCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {currentStreak}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('habits.daysInRow')}</div>
        </div>
      </div>

      {localIsCompleted ? (
        <>
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 font-medium py-4 px-6 rounded-lg flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-xl" />
            <span className="text-lg">{t('habits.completedForToday')}</span>
          </div>

          <div className="text-center">
            <button
              onClick={handleMarkComplete}
              disabled={isMarking}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium underline"
            >
              {isMarking ? t('habits.marking') : t('habits.markAsIncomplete')}
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={handleMarkComplete}
          disabled={isMarking}
          className={`
            w-full font-medium py-4 px-6 rounded-lg flex items-center justify-center transition-all text-lg
            ${isMarking ? 'bg-gray-400 text-white cursor-wait' : 'bg-green-500 hover:bg-green-600 text-white'}
          `}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-xl" />
          <span>{isMarking ? t('habits.marking') : t('habits.markAsCompleted')}</span>
        </button>
      )}
    </div>
  );
}
