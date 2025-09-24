'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faCheck,
  faStar,
  faQuoteLeft,
  faArrowRight,
  faArrowLeft,
  faUsers,
  faCalendarAlt,
  faTags,
  faLock,
  faGlobe,
  faImage,
  faListCheck,
  faLightbulb,
  faRoute,
  faForward,
  faFlagCheckered,
  faClock,
  faCalendar,
  faTrophy,
  faPalette,
  faEye,
  faExclamationTriangle,
  faGift,
} from '@fortawesome/free-solid-svg-icons';
import { createGoal } from '@/lib/api/goal';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/context/UserProfileContext';
import { toast } from 'react-hot-toast';
import { PrivacyStatus } from '@/types';
import { ImageUploader, StepsManager } from './wizard';
import { useTranslations } from 'next-intl';

export interface GoalCreateWizardData {
  // Шаг 1: Основы
  goalName: string;
  description: string;

  // Шаг 2: Планирование шагов
  steps: string[];

  // Шаг 3: Даты и мотивация
  startDate: string;
  endDate: string;
  reward: string;
  consequence: string;

  // Шаг 4: Фото и категория
  image: File | null;
  category: string;

  // Шаг 5: Приватность и сложность
  privacy: PrivacyStatus;
  value: number;
}

const defaultState: GoalCreateWizardData = {
  goalName: '',
  description: '',
  steps: [''],
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  reward: '',
  consequence: '',
  image: null,
  category: 'self-development', // дефолтная категория
  privacy: PrivacyStatus.Public,
  value: 1,
};

export const GoalCreateWizard: React.FC = () => {
  const [data, setData] = useState<GoalCreateWizardData>(defaultState);
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [noDeadline, setNoDeadline] = useState<boolean>(false);
  const router = useRouter();
  const { profile } = useUserProfile();
  const reduceMotion = useReducedMotion();

  // Translations
  const t = useTranslations('goals.wizard');
  const tGoals = useTranslations('goals');

  const totalSteps = 5;

  const update = (field: keyof GoalCreateWizardData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (canContinue() && step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!profile || !canContinue()) return;

    try {
      setSubmitting(true);

      const formDataToSend = new FormData();

      // Основные поля (соответствуют DTO)
      formDataToSend.append('goalName', data.goalName.trim());
      formDataToSend.append('description', data.description?.trim() || '');
      formDataToSend.append('userId', profile.user._id);
      formDataToSend.append('category', data.category || 'lifestyle'); // дефолтная категория
      formDataToSend.append('privacy', data.privacy);
      formDataToSend.append('value', data.value.toString());

      // Даты
      if (data.startDate) {
        formDataToSend.append('startDate', data.startDate);
      }
      if (data.endDate && !noDeadline) {
        formDataToSend.append('endDate', data.endDate);
      }
      if (noDeadline) {
        formDataToSend.append('noDeadline', 'true');
      }

      // Опциональные поля мотивации
      if (data.reward?.trim()) {
        formDataToSend.append('reward', data.reward.trim());
      }
      if (data.consequence?.trim()) {
        formDataToSend.append('consequence', data.consequence.trim());
      }

      // Шаги - форматируем под StepDto
      const validSteps = data.steps.filter((step) => step.trim().length > 0);
      const formattedSteps = validSteps.map((step, index) => ({
        id: `step-${index}`, // добавляем id для StepDto
        text: step.trim(),
        isCompleted: false,
      }));
      formDataToSend.append('steps', JSON.stringify(formattedSteps));

      // Изображение
      if (data.image) {
        formDataToSend.append('image', data.image);
      }

      await createGoal(formDataToSend);

      toast.success(t('notifications.goalCreated'));
      router.push('/');
    } catch (error) {
      console.error('Ошибка создания цели:', error);
      toast.error(t('notifications.goalCreationError'));
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return data.goalName.trim().length > 0;
      case 2:
        return true; // Шаги теперь необязательны
      case 3:
      case 4:
        return true; // Остальные поля опциональные
      case 5:
        return data.privacy !== undefined; // Требуем выбор приватности
      default:
        return false;
    }
  };

  return (
    <div
      className={`min-h-screen ${
        step === 5
          ? 'bg-gradient-to-br from-green-50 via-white to-emerald-50'
          : 'bg-gradient-to-br from-primary-50 via-white to-primary-50'
      }`}
    >
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Progress Indicator */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            {[
              { icon: faBullseye, label: t('steps.basics') },
              { icon: faListCheck, label: t('steps.steps') },
              { icon: faCalendarAlt, label: t('steps.timing') },
              { icon: faImage, label: t('steps.design') },
              { icon: faCheck, label: t('steps.finish') },
            ].map((stepItem, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                      index + 1 === step
                        ? 'bg-primary-500 text-white'
                        : index + 1 < step
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <FontAwesomeIcon icon={stepItem.icon} className="text-sm" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      index + 1 <= step ? (index + 1 === step ? 'text-primary-600' : 'text-green-600') : 'text-gray-400'
                    }`}
                  >
                    {stepItem.label}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`w-8 h-1 rounded mt-3 ${index + 1 < step ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Шаг {step} из {totalSteps}:{' '}
            {
              [
                t('stepDescriptions.basicInfo'),
                t('stepDescriptions.planningSteps'),
                t('stepDescriptions.timingMotivation'),
                t('stepDescriptions.photoCategory'),
                t('stepDescriptions.privacyComplexity'),
              ][step - 1]
            }
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Section */}
          <div className="space-y-6 relative">
            {/* Hero Visual */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`left-${step}`}
                className="text-center"
                custom={direction}
                initial={{
                  opacity: reduceMotion ? 1 : 0,
                  x: reduceMotion ? 0 : direction > 0 ? 32 : -32,
                  filter: reduceMotion ? 'none' : 'blur(2px)',
                }}
                animate={{ opacity: 1, x: 0, filter: 'none' }}
                exit={{
                  opacity: reduceMotion ? 1 : 0,
                  x: reduceMotion ? 0 : direction > 0 ? -24 : 24,
                  filter: reduceMotion ? 'none' : 'blur(2px)',
                }}
                transition={{ duration: reduceMotion ? 0 : 0.32, ease: 'easeOut' }}
              >
                <div className="relative inline-block mb-6">
                  {step === 1 && (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faBullseye} className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon icon={faStar} className="text-xs text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faStar} className="text-xs text-white" />
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faListCheck} className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon icon={faRoute} className="text-xs text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faStar} className="text-xs text-white" />
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faClock} className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon icon={faCalendar} className="text-xs text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faTrophy} className="text-xs text-white" />
                      </div>
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faImage} className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon icon={faPalette} className="text-xs text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faEye} className="text-xs text-white" />
                      </div>
                    </>
                  )}
                  {step === 5 && (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faFlagCheckered} className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon icon={faStar} className="text-xs text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faCheck} className="text-xs text-white" />
                      </div>
                    </>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {
                    [
                      t('titles.createNewGoal'),
                      t('titles.breakIntoSteps'),
                      t('titles.setDeadlines'),
                      t('titles.giveGoalImage'),
                      t('titles.finalSettings'),
                    ][step - 1]
                  }
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {
                    [
                      t('descriptions.createStart'),
                      t('descriptions.breakIntoSteps'),
                      t('descriptions.setTiming'),
                      t('descriptions.giveImage'),
                      t('descriptions.finalStep'),
                    ][step - 1]
                  }
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Motivational Quote / Tips */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`tips-${step}`}
                className="text-center"
                custom={direction}
                initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -12 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
              >
                {step === 2 ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FontAwesomeIcon icon={faLightbulb} className="text-amber-600" />
                          <span className="text-sm font-semibold text-amber-800">{t('tips.canSkip')}</span>
                        </div>
                        <p className="text-sm text-amber-700">{t('tips.canSkipDescription')}</p>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                      <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 text-xl mb-3" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('tips.planningTips')}</h3>
                      <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2">•</span>
                          {t('tips.makeStepsSpecific')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2">•</span>
                          {t('tips.startWithSimple')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2">•</span>
                          {t('tips.stepsShouldBring')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2">•</span>
                          {t('tips.dontFearDetails')}
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                    <FontAwesomeIcon icon={faQuoteLeft} className="text-primary-400 text-xl mb-3" />
                    <p className="text-primary-700 italic text-lg font-medium mb-2">
                      {
                        [
                          t('quotes.thousandMilesJourney'),
                          t('quotes.bigJourneyStep'),
                          t('quotes.timeIsLife'),
                          t('quotes.dreamWithoutImage'),
                          t('quotes.perfectionAchieved'),
                        ][step === 2 ? 1 : step - 1]
                      }
                    </p>
                    <p className="text-primary-500 text-sm">
                      —{' '}
                      {
                        [
                          t('authors.laoTzu'),
                          t('authors.confucius'),
                          t('authors.benjaminFranklin'),
                          t('authors.folkWisdom'),
                          t('authors.saintExupery'),
                        ][step === 2 ? 1 : step - 1]
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Section - Form */}
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <form className="space-y-6">
                {/* Step Content */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={`form-${step}`}
                    custom={direction}
                    initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : direction > 0 ? 24 : -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : direction > 0 ? -18 : 18 }}
                    transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
                  >
                    {step === 1 && (
                      <>
                        {/* Goal Title */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-3">
                            {t('fields.goalNameRequired')}
                          </label>
                          <input
                            type="text"
                            value={data.goalName}
                            onChange={(e) => update('goalName', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 placeholder-gray-400"
                            placeholder={t('fields.goalNamePlaceholder')}
                            maxLength={80}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-gray-500">{t('fields.goalNameHelper')}</p>
                            <span className="text-sm text-gray-400 font-medium">{data.goalName.length}/80</span>
                          </div>
                        </div>

                        {/* Goal Description */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-3">
                            {t('fields.whyThisGoal')}
                          </label>
                          <textarea
                            value={data.description}
                            onChange={(e) => update('description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-base transition-all duration-200 placeholder-gray-400"
                            placeholder={t('fields.descriptionPlaceholder')}
                          />
                          <p className="text-sm text-gray-500 mt-2">{t('fields.descriptionHelper')}</p>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <StepsManager
                        steps={data.steps}
                        onStepsChange={(steps) => update('steps', steps)}
                        goalName={data.goalName}
                      />
                    )}

                    {step === 3 && (
                      <>
                        {/* Timing Section */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-4">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-500 mr-2" />
                            {t('fields.timeframe')}
                          </h3>

                          <div className={`grid gap-4 mb-4 ${noDeadline ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('fields.startDate')}
                              </label>
                              <input
                                type="date"
                                value={data.startDate}
                                onChange={(e) => update('startDate', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200"
                              />
                            </div>
                            {!noDeadline && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t('fields.deadline')}
                                </label>
                                <input
                                  type="date"
                                  value={data.endDate}
                                  onChange={(e) => update('endDate', e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <input
                              type="checkbox"
                              id="no-deadline"
                              checked={noDeadline}
                              onChange={(e) => {
                                setNoDeadline(e.target.checked);
                                if (e.target.checked) {
                                  update('endDate', ''); // Очищаем дату окончания
                                }
                              }}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="no-deadline" className="text-sm text-gray-600">
                              {t('fields.noDeadline')}
                            </label>
                          </div>
                        </div>

                        {/* Reward */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-3">
                            <FontAwesomeIcon icon={faGift} className="mr-2 text-green-500" />
                            {t('fields.rewardForSuccess')}
                          </label>
                          <input
                            type="text"
                            value={data.reward}
                            onChange={(e) => update('reward', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 placeholder-gray-400"
                            placeholder={t('fields.rewardPlaceholder')}
                          />
                          <p className="text-sm text-gray-500 mt-2">{t('fields.rewardHelper')}</p>
                        </div>

                        {/* Consequence */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-3">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-500" />
                            {t('fields.consequenceForFailure')}
                          </label>
                          <input
                            type="text"
                            value={data.consequence}
                            onChange={(e) => update('consequence', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 placeholder-gray-400"
                            placeholder={t('fields.consequencePlaceholder')}
                          />
                          <p className="text-sm text-gray-500 mt-2">{t('fields.consequenceHelper')}</p>
                        </div>
                      </>
                    )}

                    {step === 4 && (
                      <>
                        {/* Goal Image */}
                        <ImageUploader image={data.image} onImageChange={(image) => update('image', image)} />

                        {/* Category */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-3">
                            <FontAwesomeIcon icon={faTags} className="mr-2 text-primary-500" />
                            {tGoals('category')}
                          </label>
                          <select
                            value={data.category || ''}
                            onChange={(e) => update('category', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200"
                          >
                            <option value="">{tGoals('categories.selectCategory')}</option>
                            <option value="health">❤️ {tGoals('categories.health')}</option>
                            <option value="finance">💰 {tGoals('categories.finance')}</option>
                            <option value="self-development">🧠 {tGoals('categories.development')}</option>
                            <option value="work">💼 {tGoals('categories.work')}</option>
                            <option value="education">🎓 {tGoals('categories.education')}</option>
                            <option value="relationships">👥 {tGoals('categories.relationships')}</option>
                            <option value="sport">🏆 {tGoals('categories.sport')}</option>
                            <option value="custom">➕ {tGoals('categories.custom')}</option>
                          </select>
                          <p className="text-sm text-gray-500 mt-2">{t('fields.categoryHelper')}</p>
                        </div>
                      </>
                    )}

                    {step === 5 && (
                      <>
                        {/* Goal Importance Slider */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-3">
                            {t('fields.goalImportanceRequired')}
                          </label>
                          <div className="space-y-4">
                            <div className="relative">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={data.value}
                                onChange={(e) => update('value', parseInt(e.target.value))}
                                className="w-full h-3 bg-gradient-to-r from-gray-200 via-yellow-300 to-red-500 rounded-lg appearance-none cursor-pointer"
                                style={{
                                  background: 'linear-gradient(to right, #e5e7eb 0%, #fde047 50%, #ef4444 100%)',
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>0</span>
                                <span>25</span>
                                <span>50</span>
                                <span>75</span>
                                <span>100</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <span className="text-3xl font-bold text-primary-600">{data.value}</span>
                              <p className="text-sm text-gray-500 mt-1">
                                {data.value <= 20
                                  ? t('importance.minimal')
                                  : data.value <= 40
                                  ? t('importance.low')
                                  : data.value <= 55
                                  ? t('importance.belowAverage')
                                  : data.value <= 70
                                  ? t('importance.average')
                                  : data.value <= 85
                                  ? t('importance.aboveAverage')
                                  : data.value <= 95
                                  ? t('importance.high')
                                  : t('importance.critical')}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-3">{t('fields.rateFrom0To100')}</p>
                        </div>

                        {/* Privacy Settings */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-3">
                            {t('fields.privacyLevelRequired')}
                          </label>
                          <div className="space-y-3">
                            <label
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-colors ${
                                data.privacy === PrivacyStatus.Private
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="privacy"
                                value="private"
                                checked={data.privacy === PrivacyStatus.Private}
                                onChange={() => update('privacy', PrivacyStatus.Private)}
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                                  data.privacy === PrivacyStatus.Private ? 'border-primary-500' : 'border-gray-300'
                                }`}
                              >
                                {data.privacy === PrivacyStatus.Private && (
                                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faLock} className="text-gray-600 mr-2" />
                                  <span className="font-semibold text-gray-800">{t('privacy.private')}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{t('privacy.privateDescription')}</p>
                              </div>
                            </label>

                            <label
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-colors ${
                                data.privacy === PrivacyStatus.Friends
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="privacy"
                                value="friends"
                                checked={data.privacy === PrivacyStatus.Friends}
                                onChange={() => update('privacy', PrivacyStatus.Friends)}
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                                  data.privacy === PrivacyStatus.Friends ? 'border-primary-500' : 'border-gray-300'
                                }`}
                              >
                                {data.privacy === PrivacyStatus.Friends && (
                                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faUsers} className="text-gray-600 mr-2" />
                                  <span className="font-semibold text-gray-800">{t('privacy.friends')}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{t('privacy.friendsDescription')}</p>
                              </div>
                            </label>

                            <label
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-colors ${
                                data.privacy === PrivacyStatus.Public
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="privacy"
                                value="public"
                                checked={data.privacy === PrivacyStatus.Public}
                                onChange={() => update('privacy', PrivacyStatus.Public)}
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                                  data.privacy === PrivacyStatus.Public ? 'border-primary-500' : 'border-gray-300'
                                }`}
                              >
                                {data.privacy === PrivacyStatus.Public && (
                                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faGlobe} className="text-gray-600 mr-2" />
                                  <span className="font-semibold text-gray-800">{t('privacy.public')}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{t('privacy.publicDescription')}</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4">
                  {step < totalSteps ? (
                    <>
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!canContinue()}
                        className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl font-bold text-base hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {t('buttons.continue')}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                      </button>
                      {(step === 2 || step === 3 || step === 4) && (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                        >
                          <FontAwesomeIcon icon={faForward} className="mr-2" />
                          {t('buttons.skipStep')}
                        </button>
                      )}
                      <div className="flex gap-3">
                        {step > 1 && (
                          <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                          >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            {t('buttons.back')}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canContinue() || submitting}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-base hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {submitting ? t('buttons.creating') : t('buttons.createGoal')}
                        <FontAwesomeIcon icon={faCheck} className="ml-2" />
                      </button>
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                        >
                          {t('buttons.back')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Custom styles for importance slider */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default GoalCreateWizard;
