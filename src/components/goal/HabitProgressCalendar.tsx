'use client';

import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';

interface HabitDay {
  date: Date;
  completed: boolean | null; // null = будущий день
  isToday: boolean;
}

interface HabitProgressCalendarProps {
  startDate?: Date;
  completedDates?: Date[];
  currentStreak?: number;
  onDayClick?: (date: Date, currentState: boolean | null) => void;
  isOwner?: boolean;
}

export function HabitProgressCalendar({
  startDate = new Date('2024-07-01'),
  completedDates = [],
  currentStreak = 4,
  onDayClick,
  isOwner = false,
}: HabitProgressCalendarProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Optimistic UI state
  const [optimisticMap, setOptimisticMap] = useState<Record<string, boolean>>({});
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});

  const norm = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayKey = (d: Date) => String(norm(d).getTime());

  const handleDayClick = async (day: HabitDay) => {
    if (!isOwner || !onDayClick) return;

    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Можно кликать только на прошедшие дни (включая сегодня)
    if (day.date > todayNormalized) return;

    // Нельзя кликать на дни до начала привычки
    const startNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (day.date < startNormalized) return;

    const key = dayKey(day.date);
    if (pendingMap[key]) return;

    const prev = day.completed ?? false; // guarded above, null not expected
    const next = !prev;

    // Optimistic apply
    setOptimisticMap((m) => ({ ...m, [key]: next }));
    setPendingMap((m) => ({ ...m, [key]: true }));

    try {
      const result = onDayClick(day.date, day.completed);
      await Promise.resolve(result as any);
    } catch {
      // Revert on error
      setOptimisticMap((m) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _, ...rest } = m;
        return rest;
      });
    } finally {
      setPendingMap((m) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _, ...rest } = m;
        return rest;
      });
    }
  };

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

      const isToday = currentDateNormalized.getTime() === todayNormalized.getTime();

      const isFuture = currentDateNormalized > todayNormalized;
      const isBeforeStart = currentDateNormalized < startNormalized;

      let completed: boolean | null = null;

      if (isBeforeStart || isFuture) {
        completed = null;
      } else {
        // Apply optimistic override if present; else compute from props using Y/M/D equality
        const key = String(currentDateNormalized.getTime());
        if (Object.prototype.hasOwnProperty.call(optimisticMap, key)) {
          completed = optimisticMap[key];
        } else {
          completed = completedDates.some((date) => {
            const checkDate = new Date(date);
            return norm(checkDate).getTime() === currentDateNormalized.getTime();
          });
        }
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
  }, [startDate, completedDates, optimisticMap]);

  // Cleanup optimistic overrides when server data catches up
  useEffect(() => {
    setOptimisticMap((prev) => {
      if (!prev || Object.keys(prev).length === 0) return prev;
      const next = { ...prev };

      for (const [key, val] of Object.entries(prev)) {
        const dt = new Date(Number(key));
        const matched = completedDates.some((cd) => norm(new Date(cd)).getTime() === dt.getTime());
        if (matched === val) delete next[key];
      }
      return next;
    });
  }, [completedDates]);

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
              const today = new Date();
              const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const startNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

              const isClickable =
                isOwner && day.date <= todayNormalized && day.date >= startNormalized && !pendingMap[dayKey(day.date)];

              if (day.completed === true) {
                return (
                  <div
                    key={dayIndex}
                    className={`aspect-square bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center ${
                      isClickable ? 'cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 transition-colors' : ''
                    } ${pendingMap[dayKey(day.date)] ? 'opacity-60 pointer-events-none' : ''}`}
                    title={`${t('habits.completed')} ${formatDateForTitle(day.date)}${
                      isClickable ? ` (${t('habits.clickToToggle')})` : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <FontAwesomeIcon icon={faCheck} className="text-green-600 dark:text-green-400" />
                  </div>
                );
              }

              if (day.isToday) {
                return (
                  <div
                    key={dayIndex}
                    className={`aspect-square bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400 rounded-lg flex items-center justify-center ${
                      isClickable ? 'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors' : ''
                    } ${pendingMap[dayKey(day.date)] ? 'opacity-60 pointer-events-none' : ''}`}
                    title={`${t('habits.today')} ${formatDateForTitle(day.date)}${
                      isClickable ? ` (${t('habits.clickToToggle')})` : ''
                    }`}
                    onClick={() => handleDayClick(day)}
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
                    className={`aspect-square bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center ${
                      isClickable ? 'cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 transition-colors' : ''
                    } ${pendingMap[dayKey(day.date)] ? 'opacity-60 pointer-events-none' : ''}`}
                    title={`${t('habits.missed')} ${formatDateForTitle(day.date)}${
                      isClickable ? ` (${t('habits.clickToToggle')})` : ''
                    }`}
                    onClick={() => handleDayClick(day)}
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
