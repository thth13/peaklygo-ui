'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslations } from 'next-intl';
import {
  faHeart,
  faCoins,
  faBrain,
  faBriefcase,
  faGraduationCap,
  faUsers,
  faPlus,
  faTrophy,
  faLock,
  faUserGroup,
  faGlobe,
  faQuoteLeft,
  faLightbulb,
  faCheck,
  faFire,
} from '@fortawesome/free-solid-svg-icons';
import { PrivacyStatus, DayOfWeek } from '@/types';
import { ImagePreviewer } from '@/components/ImagePreviewer';
import { HabitSettings } from './HabitSettings';

export interface HabitFormData {
  goalName: string;
  description: string;
  category: string;
  customCategory: string;
  startDate: string;
  privacy: PrivacyStatus;
  reward: string;
  consequence: string;
  value: number;
  image: File | null;
  existingImageUrl?: string;
  habitDuration: number;
  habitDaysOfWeek: DayOfWeek[];
}

const GOAL_VALUE_MIN = 0;
const GOAL_VALUE_MAX = 500;

interface HabitFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<HabitFormData>;
  onSubmit: (formData: HabitFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const defaultFormData: HabitFormData = {
  goalName: '',
  description: '',
  category: 'health',
  customCategory: '',
  startDate: new Date().toISOString().slice(0, 10),
  privacy: PrivacyStatus.Public,
  reward: '',
  consequence: '',
  value: 100,
  image: null,
  existingImageUrl: undefined,
  habitDuration: 30,
  habitDaysOfWeek: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday],
};

export const HabitForm: React.FC<HabitFormProps> = ({
  mode,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const t = useTranslations('goals');
  const tCommon = useTranslations('common');
  const tHabit = useTranslations('goals.habitSettings');

  const categories = [
    { id: 'health', name: t('categories.health'), icon: faHeart, color: 'text-red-500' },
    { id: 'finance', name: t('categories.finance'), icon: faCoins, color: 'text-yellow-500' },
    { id: 'development', name: t('categories.development'), icon: faBrain, color: 'text-purple-500' },
    { id: 'work', name: t('categories.work'), icon: faBriefcase, color: 'text-blue-500' },
    { id: 'education', name: t('categories.education'), icon: faGraduationCap, color: 'text-green-500' },
    { id: 'relationships', name: t('categories.relationships'), icon: faUsers, color: 'text-pink-500' },
    { id: 'sport', name: t('categories.sport'), icon: faTrophy, color: 'text-orange-500' },
    { id: 'custom', name: t('categories.custom'), icon: faPlus, color: 'text-gray-500' },
  ];

  const [formData, setFormData] = useState<HabitFormData>({
    ...defaultFormData,
    ...initialData,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        ...defaultFormData,
        ...initialData,
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGoalValueChange = (rawValue: number) => {
    if (Number.isNaN(rawValue)) {
      handleInputChange('value', GOAL_VALUE_MIN);
      return;
    }

    const normalizedValue = Math.min(GOAL_VALUE_MAX, Math.max(GOAL_VALUE_MIN, rawValue));
    handleInputChange('value', normalizedValue);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{mode === 'edit' ? t('loading') : tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 font-sans min-h-screen transition-colors">
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-6">
            <div className="flex items-center gap-3 mb-2">
              <FontAwesomeIcon icon={faFire} className="text-orange-500 text-2xl" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {mode === 'create' ? 'Создать привычку' : 'Редактировать привычку'}
              </h1>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {mode === 'create'
                ? 'Создайте новую привычку для ежедневного развития'
                : 'Измените параметры вашей привычки'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Goal Name */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Название привычки
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-colors"
                    placeholder="Например: Заниматься спортом, читать книги..."
                    type="text"
                    maxLength={80}
                    value={formData.goalName}
                    onChange={(e) => handleInputChange('goalName', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Дайте название вашей привычке</span>
                    <span>{formData.goalName.length}/80</span>
                  </div>
                </div>

                {/* Goal Description */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('description')}
                  </label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent min-h-[120px] transition-colors"
                    placeholder="Почему эта привычка важна для вас? Какую пользу она принесет?"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Опишите, зачем вам эта привычка</div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('category')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        disabled={isSubmitting}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-h-[90px] group disabled:opacity-50 disabled:cursor-not-allowed ${
                          formData.category === category.id
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900 dark:border-orange-400'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        onClick={() => handleInputChange('category', category.id)}
                      >
                        <FontAwesomeIcon
                          icon={category.icon}
                          className={`${category.color} text-2xl mb-2 group-hover:scale-110 transition-transform`}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium text-center">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {formData.category === 'custom' && (
                    <div className="mt-3">
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-colors"
                        placeholder={t('categories.customPlaceholder')}
                        type="text"
                        value={formData.customCategory}
                        onChange={(e) => handleInputChange('customCategory', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <ImagePreviewer
                  handleInputChange={handleInputChange}
                  image={formData.image}
                  existingImageUrl={formData.existingImageUrl}
                />

                {/* Habit Settings */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    <FontAwesomeIcon icon={faFire} className="text-orange-500 mr-2" />
                    Настройки привычки
                  </label>
                  <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
                    <HabitSettings
                      habitDuration={formData.habitDuration}
                      habitDaysOfWeek={formData.habitDaysOfWeek}
                      onHabitDurationChange={(duration) => handleInputChange('habitDuration', duration)}
                      onHabitDaysOfWeekChange={(days) => handleInputChange('habitDaysOfWeek', days)}
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-colors"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Privacy */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('privacyLevel')}
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        value="private"
                        className="text-orange-600 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 h-4 w-4"
                        checked={formData.privacy === 'private'}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLock} className="text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{t('privacy.private')}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('privacy.privateDescription')}</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        value="friends"
                        className="text-orange-600 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 h-4 w-4"
                        checked={formData.privacy === 'friends'}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUserGroup} className="text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{t('privacy.friends')}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('privacy.friendsDescription')}</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        value="public"
                        className="text-orange-600 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 h-4 w-4"
                        checked={formData.privacy === 'public'}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faGlobe} className="text-green-600 dark:text-green-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{t('privacy.public')}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('privacy.publicDescription')}</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Goal Value */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('goalValue')}
                  </label>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('rewardForCompletion')}
                        </label>
                        <input
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-colors"
                          placeholder={t('rewardPlaceholder')}
                          type="text"
                          value={formData.reward}
                          onChange={(e) => handleInputChange('reward', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('consequenceOfFailure')}
                        </label>
                        <input
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-colors"
                          placeholder={t('consequencePlaceholder')}
                          type="text"
                          value={formData.consequence}
                          onChange={(e) => handleInputChange('consequence', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Важность привычки
                      </label>
                      <div className="px-3">
                        <input
                          type="range"
                          min={GOAL_VALUE_MIN}
                          max={GOAL_VALUE_MAX}
                          value={formData.value}
                          className="w-full h-2 bg-gradient-to-r from-gray-200 via-orange-300 to-red-500 rounded-lg appearance-none cursor-pointer"
                          onChange={(e) => handleGoalValueChange(Number(e.target.value))}
                          disabled={isSubmitting}
                        />
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <span>{t('valueLow')}</span>
                          <div className="text-center mt-2 space-y-1">
                            <label htmlFor="habit-form-value-input" className="sr-only">
                              Важность привычки
                            </label>
                            <div className="flex items-baseline justify-center gap-1">
                              <input
                                id="habit-form-value-input"
                                min={GOAL_VALUE_MIN}
                                max={GOAL_VALUE_MAX}
                                value={formData.value}
                                onChange={(e) => handleGoalValueChange(Number(e.target.value))}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-11 text-2xl font-medium text-orange-600 dark:text-orange-400 bg-transparent border-none text-center focus:outline-none focus:ring"
                                style={{ MozAppearance: 'textfield' }}
                                disabled={isSubmitting}
                              />
                              <span className="text-gray-500 dark:text-gray-400">{t('points')}</span>
                            </div>
                          </div>
                          <span>{t('valueHigh')}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('valueHelper')}</p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                  {mode === 'edit' && onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={isSubmitting}
                      className="bg-gray-600 dark:bg-gray-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tCommon('cancel')}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-600 dark:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? mode === 'edit'
                        ? 'Сохраняем...'
                        : 'Создаем...'
                      : mode === 'edit'
                      ? 'Сохранить изменения'
                      : 'Создать привычку'}
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-50 dark:from-orange-900 dark:to-orange-900 rounded-lg border border-orange-100 dark:border-orange-800 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faQuoteLeft} className="text-orange-500 dark:text-orange-400" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Мотивация</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                      "Мы есть то, что мы постоянно делаем. Совершенство, следовательно, не действие, а привычка."
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">— Аристотель</p>
                  </div>

                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faLightbulb} className="text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Советы для привычек
                      </span>
                    </div>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 dark:text-green-400 text-xs mt-1" />
                        <span>Начните с малого и постепенно увеличивайте нагрузку</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 dark:text-green-400 text-xs mt-1" />
                        <span>Свяжите новую привычку с уже существующей</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 dark:text-green-400 text-xs mt-1" />
                        <span>Отслеживайте прогресс каждый день</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
