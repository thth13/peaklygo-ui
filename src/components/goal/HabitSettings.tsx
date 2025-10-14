'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf, faCalendarDays, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { DayOfWeek } from '@/types';

interface HabitSettingsProps {
  habitDuration: number;
  habitDaysOfWeek: DayOfWeek[];
  onHabitDurationChange: (duration: number) => void;
  onHabitDaysOfWeekChange: (days: DayOfWeek[]) => void;
}

export const HabitSettings: React.FC<HabitSettingsProps> = ({
  habitDuration,
  habitDaysOfWeek,
  onHabitDurationChange,
  onHabitDaysOfWeekChange,
}) => {
  const t = useTranslations('goals.habitSettings');

  // Если дни не переданы, устанавливаем все дни по умолчанию
  React.useEffect(() => {
    if (habitDaysOfWeek.length === 0) {
      onHabitDaysOfWeekChange([
        DayOfWeek.Monday,
        DayOfWeek.Tuesday,
        DayOfWeek.Wednesday,
        DayOfWeek.Thursday,
        DayOfWeek.Friday,
        DayOfWeek.Saturday,
        DayOfWeek.Sunday,
      ]);
    }
  }, [habitDaysOfWeek.length, onHabitDaysOfWeekChange]);
  const [durationType, setDurationType] = useState<'days' | 'date'>('days');
  const [customDays, setCustomDays] = useState(habitDuration || 30);
  const [endDate, setEndDate] = useState('');

  // Соответствие дней недели для отображения
  const dayLabels = {
    [DayOfWeek.Monday]: t('weekDayLabels.monday'),
    [DayOfWeek.Tuesday]: t('weekDayLabels.tuesday'),
    [DayOfWeek.Wednesday]: t('weekDayLabels.wednesday'),
    [DayOfWeek.Thursday]: t('weekDayLabels.thursday'),
    [DayOfWeek.Friday]: t('weekDayLabels.friday'),
    [DayOfWeek.Saturday]: t('weekDayLabels.saturday'),
    [DayOfWeek.Sunday]: t('weekDayLabels.sunday'),
  };

  const allDays = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
    DayOfWeek.Sunday,
  ];

  const handleDurationTypeChange = (type: 'days' | 'date') => {
    setDurationType(type);
    if (type === 'days') {
      onHabitDurationChange(customDays);
    } else {
      // Если выбран тип "до даты", рассчитываем количество дней
      if (endDate) {
        const today = new Date();
        const targetDate = new Date(endDate);
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        onHabitDurationChange(Math.max(1, diffDays));
      }
    }
  };

  const handleDaysPresetChange = (days: number) => {
    setCustomDays(days);
    onHabitDurationChange(days);
  };

  const handleCustomDaysChange = (days: number) => {
    setCustomDays(days);
    onHabitDurationChange(days);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (date) {
      const today = new Date();
      const targetDate = new Date(date);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      onHabitDurationChange(Math.max(1, diffDays));
    }
  };

  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = habitDaysOfWeek.includes(day)
      ? habitDaysOfWeek.filter((d) => d !== day)
      : [...habitDaysOfWeek, day];
    onHabitDaysOfWeekChange(newDays);
  };

  const getSelectedDaysCount = () => {
    return habitDaysOfWeek.length;
  };

  return (
    <div className="space-y-6">
      {/* Продолжительность челленджа */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          <FontAwesomeIcon icon={faHourglassHalf} className="text-amber-500 dark:text-amber-400 mr-2" />
          {t('duration.title')}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="duration-type"
                value="days"
                checked={durationType === 'days'}
                onChange={() => handleDurationTypeChange('days')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 mr-2"
              />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('duration.daysCount')}</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="duration-type"
                value="date"
                checked={durationType === 'date'}
                onChange={() => handleDurationTypeChange('date')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 mr-2"
              />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('duration.untilDate')}</span>
            </label>
          </div>

          {durationType === 'days' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3 mb-3">
                {[7, 21, 30, 66].map((days) => (
                  <label
                    key={days}
                    className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer hover:border-primary-300 dark:hover:border-primary-500 transition-colors group ${
                      customDays === days
                        ? 'border-primary-300 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration-days"
                      value={days}
                      checked={customDays === days}
                      onChange={() => handleDaysPresetChange(days)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 mb-2"
                    />
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                      {days}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {days === 21 ? t('duration.day') : t('duration.days')}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="duration-days"
                    value="custom"
                    checked={![7, 21, 30, 66].includes(customDays)}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 mr-2"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('duration.customAmount')}:</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => handleCustomDaysChange(Number(e.target.value))}
                  className="w-20 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('duration.days')}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('duration.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('duration.untilDateDescription')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Дни недели для выполнения */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          <FontAwesomeIcon icon={faCalendarDays} className="text-primary-500 dark:text-primary-400 mr-2" />
          {t('weekDays.title')}
        </h3>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {allDays.map((day) => (
            <label key={day} className="flex flex-col items-center cursor-pointer group">
              <input
                type="checkbox"
                name="weekdays"
                value={day}
                checked={habitDaysOfWeek.includes(day)}
                onChange={() => handleDayToggle(day)}
                className="sr-only peer"
              />
              <div
                className={`w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center peer-checked:bg-primary-500 peer-checked:border-primary-500 peer-checked:text-white text-gray-600 dark:text-gray-300 font-semibold text-sm transition-all duration-200 group-hover:border-primary-400 dark:group-hover:border-primary-500 ${
                  habitDaysOfWeek.includes(day) ? 'bg-primary-500 border-primary-500 text-white' : ''
                }`}
              >
                {dayLabels[day]}
              </div>
            </label>
          ))}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t('weekDays.selectedCount', { count: getSelectedDaysCount() })}
        </p>
      </div>

      {/* Отслеживание прогресса */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          <FontAwesomeIcon icon={faChartLine} className="text-green-500 dark:text-green-400 mr-2" />
          {t('tracking.title')}
        </h3>

        <div className="space-y-3">
          <label className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-300 dark:hover:border-green-500 transition-colors">
            <input
              type="radio"
              name="tracking"
              value="simple"
              defaultChecked
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-800 dark:text-white">{t('tracking.simple.title')}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.simple.description')}</p>
            </div>
          </label>

          <label className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-300 dark:hover:border-green-500 transition-colors">
            <input
              type="radio"
              name="tracking"
              value="quantity"
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-800 dark:text-white">{t('tracking.quantitative.title')}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.quantitative.description')}</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
