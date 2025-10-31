'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalType, HabitDay } from '@/types';
import { GoalSteps } from './GoalSteps';
import { IMAGE_URL } from '@/constants';
import { formatDate } from '@/lib/utils';
import { ProgressBlog } from './ProgressBlog';
import { useTranslations, useLocale } from 'next-intl';
import { useUserProfile } from '@/context/UserProfileContext';
import { TodayHabitTracker } from './TodayHabitTracker';
import { HabitProgressCalendar } from './HabitProgressCalendar';
import { markHabitDay } from '@/lib/api';

interface GoalProgressProps {
  goal: Goal;
  goalId: string;
  currentUserId?: string;
}

// Функция для вычисления прогресса привычки на основе данных цели
const calculateHabitProgress = (habitCompletedDays: HabitDay[] = []) => {
  const completedDates = habitCompletedDays
    .filter((day) => day.isCompleted)
    .map((day) => {
      // Normalize to UTC day to avoid timezone off-by-one
      const date = new Date(day.date);
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    });

  // Вычисляем текущую серию
  let currentStreak = 0;
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Сортируем даты по убыванию (от сегодня)
  const sortedDates = completedDates.sort((a, b) => b.getTime() - a.getTime());

  // Проверяем выполнен ли сегодняшний день
  const isTodayCompleted = sortedDates.some((date) => date.getTime() === todayNormalized.getTime());

  // Начинаем проверку стрика
  const checkDate = new Date(todayNormalized);

  // Если сегодня выполнено - начинаем с сегодня, иначе с вчера
  if (!isTodayCompleted) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i].getTime() === checkDate.getTime()) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { completedDates, currentStreak };
};

export const GoalProgress = ({ goal, goalId, currentUserId }: GoalProgressProps) => {
  const [progress, setProgress] = useState(goal.progress);
  const [completedDates, setCompletedDates] = useState<Date[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isTodayCompleted, setIsTodayCompleted] = useState(false);
  const [localHabitDays, setLocalHabitDays] = useState(goal.habitCompletedDays || []);

  const t = useTranslations();
  const locale = useLocale();
  const { updateRatingOnStepCompletion, updateRatingOnGoalCompletion } = useUserProfile();

  // Вычисление прогресса на основе данных цели
  const calculateProgress = useCallback(() => {
    if (goal.goalType === GoalType.Habit) {
      const { completedDates: dates, currentStreak: streak } = calculateHabitProgress(localHabitDays);

      setCompletedDates(dates);
      setCurrentStreak(streak);

      // Проверяем сегодняшний день более простым способом
      const today = new Date();
      const todayString = today.toDateString(); // "Sun Oct 13 2025"

      const todayCompleted = dates.some((date) => {
        return date.toDateString() === todayString;
      });

      setIsTodayCompleted(todayCompleted);
    }
  }, [goal.goalType, localHabitDays]);

  // Обновление локального состояния после отметки
  const handleMarkComplete = useCallback((date: Date, isCompleted: boolean) => {
    // Обновляем локальное состояние habitDays
    setLocalHabitDays((prevDays) => {
      const dateString = date.toISOString().split('T')[0];
      const existingDayIndex = prevDays.findIndex(
        (day) => new Date(day.date).toISOString().split('T')[0] === dateString,
      );

      if (existingDayIndex >= 0) {
        // Обновляем существующий день
        const newDays = [...prevDays];
        newDays[existingDayIndex] = { ...newDays[existingDayIndex], isCompleted };
        return newDays;
      } else {
        // Добавляем новый день
        return [...prevDays, { date: new Date(date), isCompleted }];
      }
    });
  }, []);

  // Обработка кликов по дням календаря
  const handleCalendarDayClick = useCallback(
    async (date: Date, currentState: boolean | null) => {
      try {
        // Переключаем состояние: если не выполнено или null, то делаем выполненным
        const newState = currentState !== true;

        await markHabitDay(goalId, date, newState);
      } catch (error) {
        console.error('Failed to update habit day:', error);
      }
    },
    [goalId],
  );

  useEffect(() => {
    setLocalHabitDays(goal.habitCompletedDays || []);
  }, [goal.habitCompletedDays]);

  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  // Пересчитываем прогресс при изменении localHabitDays
  useEffect(() => {
    if (goal.goalType === GoalType.Habit) {
      calculateProgress();
    }
  }, [localHabitDays, goal.goalType, calculateProgress]);

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handleGoalComplete = () => {
    updateRatingOnGoalCompletion({ goalValue: goal.value });
  };

  const getDaysLeft = () => {
    if (!goal.endDate) return null;
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getChallengeDaysLeft = () => {
    if (goal.goalType !== GoalType.Habit || !goal.habitDuration) return null;

    const startDate = new Date(goal.startDate);
    const today = new Date();
    const daysFromStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const challengeDaysLeft = goal.habitDuration - daysFromStart - 1; // -1 потому что стартовый день считается

    return Math.max(0, challengeDaysLeft);
  };

  const daysLeft = getDaysLeft();
  const challengeDaysLeft = getChallengeDaysLeft();
  const ratingEarned = Math.max(goal.value, 0);

  return (
    <>
      {goal.image ? (
        <div className="relative">
          <div
            className="h-64 bg-cover bg-center relative rounded-lg"
            style={{
              backgroundImage: `url(${IMAGE_URL}/${goal.image})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>

            <div className="absolute left-0 bottom-0 z-10 text-white p-6">
              <div className="text-3xl font-bold mb-1">
                {goal.goalType === GoalType.Habit
                  ? `${currentStreak} ${t('goals.streakDays')}`
                  : `${progress}% ${t('common.completed')}`}
              </div>
              {(goal.endDate || (goal.goalType === GoalType.Habit && goal.habitDuration)) && (
                <div className="text-md mt-1 text-white/80">
                  {goal.isCompleted
                    ? t('goals.goalAchieved')
                    : goal.goalType === GoalType.Habit && challengeDaysLeft !== null
                    ? challengeDaysLeft > 0
                      ? `${challengeDaysLeft} ${t('goals.challengeDaysLeft')}`
                      : t('goals.deadlinePassed')
                    : daysLeft && daysLeft > 0
                    ? `${daysLeft} ${t('goals.daysToDeadline')}`
                    : `${t('goals.deadlinePassed')} ${Math.abs(daysLeft || 0)} ${t('goals.daysAfterDeadline')}`}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 p-6 rounded-lg">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-3xl font-bold mb-1">
                {goal.goalType === GoalType.Habit
                  ? `${currentStreak} ${t('goals.streakDays')}`
                  : `${progress}% ${t('common.completed')}`}
              </div>
              {(goal.endDate || (goal.goalType === GoalType.Habit && goal.habitDuration)) && (
                <div className="text-white/80">
                  {goal.isCompleted
                    ? t('goals.goalAchieved')
                    : goal.goalType === GoalType.Habit && challengeDaysLeft !== null
                    ? challengeDaysLeft > 0
                      ? `${challengeDaysLeft} ${t('goals.challengeDaysLeft')}`
                      : t('goals.deadlinePassed')
                    : daysLeft && daysLeft > 0
                    ? `${daysLeft} ${t('goals.daysToDeadline')}`
                    : `${t('goals.deadlinePassed')} ${Math.abs(daysLeft || 0)} ${t('goals.daysAfterDeadline')}`}
                </div>
              )}
            </div>
            {goal.goalType !== GoalType.Habit && (
              <div className="text-right">
                <div className="text-white/80 text-sm mb-2">{t('goals.overallProgress')}</div>
                <div className="w-24 bg-white/20 h-2 rounded-full">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Описание цели */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('goals.goalDescription')}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{goal.description || t('goals.noDescription')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('goals.startDate')}</h4>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(goal.startDate, locale)}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('goals.endDate')}</h4>
            <p className="text-gray-900 dark:text-gray-100">
              {goal.endDate ? formatDate(goal.endDate, locale) : t('goals.notSpecified')}
            </p>
          </div>
        </div>

        {goal.goalType === GoalType.Habit && currentUserId === goal.userId && (
          <TodayHabitTracker
            goalId={goalId}
            currentStreak={currentStreak}
            onMarkComplete={handleMarkComplete}
            isCompleted={isTodayCompleted}
          />
        )}

        {goal.image && goal.goalType !== GoalType.Habit && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">{t('goals.overallProgress')}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
              <div
                className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {goal.isCompleted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {goal.reward && (
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">{t('goals.rewardReceived')}</div>
                <div className="font-medium text-green-800 dark:text-green-200">{goal.reward}</div>
              </div>
            )}
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">{t('goals.ratingGained')}</div>
              <div className="font-medium text-blue-800 dark:text-blue-200">
                +{ratingEarned} {t('goals.points')}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {goal.reward && (
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">{t('goals.reward')}</h4>
                <p className="text-green-700 dark:text-green-300">{goal.reward}</p>
              </div>
            )}
            {goal.consequence && (
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">{t('goals.consequence')}</h4>
                <p className="text-red-700 dark:text-red-300">{goal.consequence}</p>
              </div>
            )}
          </div>
        )}

        {goal.goalType === GoalType.Habit && (
          <HabitProgressCalendar
            startDate={new Date(goal.startDate)}
            completedDates={completedDates}
            currentStreak={currentStreak}
            onDayClick={handleCalendarDayClick}
            isOwner={currentUserId === goal.userId}
          />
        )}

        {goal.steps.length > 0 && (
          <GoalSteps
            steps={goal.steps}
            goalId={goalId}
            currentUserId={currentUserId}
            goalUserId={goal.userId}
            goal={goal}
            onProgressUpdate={handleProgressUpdate}
            onGoalComplete={handleGoalComplete}
            onStepRatingUpdate={updateRatingOnStepCompletion}
            onGoalRatingUpdate={updateRatingOnGoalCompletion}
          />
        )}

        <ProgressBlog isOwner={currentUserId === goal.userId} />
      </div>
    </>
  );
};
