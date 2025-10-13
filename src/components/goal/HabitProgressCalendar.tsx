'use client';

import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';

interface HabitDay {
  date: Date;
  completed: boolean | null; // null = будущий день
  isToday: boolean;
}

interface HabitProgressCalendarProps {
  startDate?: Date;
  completedDates?: Date[];
  currentStreak?: number;
}

export function HabitProgressCalendar({
  startDate = new Date('2024-07-01'),
  completedDates = [],
  currentStreak = 4,
}: HabitProgressCalendarProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatDateForTitle = (date: Date) => {
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'ua' ? 'uk-UA' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const { weeks, dayLabels } = useMemo(() => {
    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const start = new Date(startDate);
    const startNormalized = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    // Генерируем календарь на 4-5 недель
    const weeksCount = 4;
    const totalDays = weeksCount * 7;

    // Начинаем с понедельника недели, в которую попадает startDate
    const startOfWeek = new Date(startNormalized);
    const dayOfWeek = startNormalized.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = воскресенье
    startOfWeek.setDate(startNormalized.getDate() - daysToSubtract);

    const days: HabitDay[] = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      // Нормализуем дату
      const currentDateNormalized = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

      const isToday = currentDateNormalized.getDate() === todayNormalized.getDate();

      const isFuture = currentDateNormalized > todayNormalized;
      const isBeforeStart = currentDateNormalized < startNormalized;

      let completed: boolean | null = null;

      if (isBeforeStart || isFuture) {
        completed = null;
      } else {
        completed = completedDates.some((date) => {
          const checkDate = new Date(date);

          const checkDateNormalized = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());

          return checkDateNormalized.getDate() === currentDateNormalized.getDate();
        });
      }

      days.push({
        date: currentDateNormalized,
        completed,
        isToday,
      });
    }

    // Разбиваем на недели
    const weeksArray: HabitDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }

    return {
      weeks: weeksArray,
      dayLabels: (t.raw('habits.dayLabels') as string[]) ?? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    };
  }, [startDate, completedDates]);

  return (
    <>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('habits.progressByDays')}</h3>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayLabels.map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
            {week.map((day, dayIndex) => {
              const dayNumber = day.date.getDate();

              if (day.completed === true) {
                return (
                  <div
                    key={dayIndex}
                    className="aspect-square bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center"
                    title={`${t('habits.completed')} ${formatDateForTitle(day.date)}`}
                  >
                    <FontAwesomeIcon icon={faCheck} className="text-green-600 dark:text-green-400" />
                  </div>
                );
              }

              if (day.isToday) {
                return (
                  <div
                    key={dayIndex}
                    className="aspect-square bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400 rounded-lg flex items-center justify-center"
                    title={`${t('habits.today')} ${formatDateForTitle(day.date)}`}
                  >
                    <div className="text-center font-medium text-gray-600 dark:text-gray-400 text-sm py-2">
                      {dayNumber}
                    </div>
                  </div>
                );
              }

              if (day.completed === false) {
                return (
                  <div
                    key={dayIndex}
                    className="aspect-square bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center"
                    title={`${t('habits.missed')} ${formatDateForTitle(day.date)}`}
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-red-500 dark:text-red-400" />
                  </div>
                );
              }

              // Будущие дни или дни до начала привычки
              return (
                <div
                  key={dayIndex}
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                  title={formatDateForTitle(day.date)}
                >
                  <span className="text-gray-400 dark:text-gray-500 text-sm">{dayNumber}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('habits.completed')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('habits.missed')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('habits.today')}</span>
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          {t('habits.currentStreak')}:{' '}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {currentStreak} {t('habits.days')}
          </span>
        </div>
      </div>
    </>
  );
}
