'use client';

import React, { useState, useEffect } from 'react';
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
  faUserPlus,
  faFire,
  faCalendarCheck,
  faChartLine,
  faComments,
  faHandshake,
} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

import { createGoal } from '@/lib/api/goal';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { PrivacyStatus, GoalType, DayOfWeek } from '@/types';
import { ImageUploader, StepsManager, GroupGoalSettings } from './wizard';
import { HabitSettings } from './HabitSettings';
import { useTranslations } from 'next-intl';
import { GoogleOAuthProvider, CodeResponse } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '@/constants';
import { useContext } from 'react';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { AuthResponse } from '@/lib/api/auth';
import type { GroupSettingsState } from './wizard/GroupGoalSettings';

export interface GoalCreateWizardData {
  // Шаг 1: Тип цели
  goalType: 'deadline' | 'challenge' | 'group-challenge' | '';

  // Шаг 2: Основы
  goalName: string;
  description: string;

  // Шаг 3: Планирование шагов или параметры привычки
  steps: string[];

  // Параметры привычки
  habitDuration: number;
  habitDaysOfWeek: DayOfWeek[];

  // Шаг 4: Даты и мотивация
  startDate: string;
  endDate: string;
  reward: string;
  consequence: string;

  // Шаг 5: Фото и категория
  image: File | null;
  category: string;

  // Шаг 6: Приватность и сложность
  privacy: PrivacyStatus;
  value: number;

  // Групповые параметры
  participantIds: string[];
  groupSettings: GroupSettingsState;
}

interface AuthFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  server?: string;
}

const GOAL_VALUE_MIN = 0;
const GOAL_VALUE_MAX = 500;
const GOAL_VALUE_MARKS: readonly number[] = [0, 125, 250, 375, 500];

const defaultState: GoalCreateWizardData = {
  goalType: '',
  goalName: '',
  description: '',
  steps: [''],
  habitDuration: 30,
  habitDaysOfWeek: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday],
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  reward: '',
  consequence: '',
  image: null,
  category: 'self-development', // дефолтная категория
  privacy: PrivacyStatus.Public,
  value: 1,
  participantIds: [],
  groupSettings: {
    allowMembersToInvite: false,
    requireApproval: true,
    maxParticipants: 10,
  },
};

export const GoalCreateWizard: React.FC = () => {
  const [data, setData] = useState<GoalCreateWizardData>(defaultState);
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [noDeadline, setNoDeadline] = useState<boolean>(false);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [userId, setUserId] = useState<string>('');

  // Auth context
  const { authUser, googleLogin } = useContext(AuthContext);

  // Auth form state
  const [authFormData, setAuthFormData] = useState<AuthFormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authErrors, setAuthErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(Cookies.get('userId') ?? '');
    }
  }, []);

  // Инициализация формы при переходе на 6-й шаг
  useEffect(() => {
    if (!userId && step === 6) {
      setAuthErrors({});
    }
  }, [step, userId]);

  // Translations
  const t = useTranslations('goals.wizard');
  const tGoals = useTranslations('goals');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  const totalSteps = userId ? 6 : 7;
  const isHabitGoal = data.goalType === 'challenge';
  const isGroupGoal = data.goalType === 'group-challenge';

  const resolveStepTitle = () => {
    if (step === 3) {
      if (isHabitGoal) {
        return t('titles.habitFormation');
      }
      if (isGroupGoal) {
        return t('titles.groupSetup');
      }
    }

    const baseTitles = [
      t('titles.selectGoalType'),
      t('titles.createNewGoal'),
      t('titles.breakIntoSteps'),
      t('titles.setDeadlines'),
      t('titles.giveGoalImage'),
      t('titles.finalSettings'),
      ...(userId ? [] : [t('titles.createAccount')]),
    ];

    return baseTitles[step - 1];
  };

  const resolveStepDescription = () => {
    if (step === 3) {
      if (isHabitGoal) {
        return t('descriptions.habitFormation');
      }
      if (isGroupGoal) {
        return t('descriptions.groupSetup');
      }
    }

    const baseDescriptions = [
      t('descriptions.selectGoalType'),
      t('descriptions.createStart'),
      t('descriptions.breakIntoSteps'),
      t('descriptions.setTiming'),
      t('descriptions.giveImage'),
      t('descriptions.finalStep'),
      ...(userId ? [] : [t('descriptions.accountCreation')]),
    ];

    return baseDescriptions[step - 1];
  };

  const update = (field: keyof GoalCreateWizardData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updateGroupSettings = (changes: Partial<GroupSettingsState>) => {
    setData((prev) => ({
      ...prev,
      groupSettings: {
        ...prev.groupSettings,
        ...changes,
      },
    }));
  };

  const addParticipant = (participant: string) => {
    setData((prev) => {
      if (prev.participantIds.includes(participant)) {
        return prev;
      }
      return {
        ...prev,
        participantIds: [...prev.participantIds, participant],
      };
    });
  };

  const removeParticipant = (participant: string) => {
    setData((prev) => ({
      ...prev,
      participantIds: prev.participantIds.filter((existing) => existing !== participant),
    }));
  };

  const handleValueChange = (rawValue: number) => {
    const fallbackValue = Number.isNaN(rawValue) ? GOAL_VALUE_MIN : rawValue;
    const normalizedValue = Math.min(GOAL_VALUE_MAX, Math.max(GOAL_VALUE_MIN, fallbackValue));
    update('value', normalizedValue);
  };

  const resolveImportanceLabel = (currentValue: number): string => {
    const importancePercent = (currentValue / GOAL_VALUE_MAX) * 100;
    if (importancePercent <= 20) {
      return t('importance.minimal');
    }
    if (importancePercent <= 40) {
      return t('importance.low');
    }
    if (importancePercent <= 55) {
      return t('importance.belowAverage');
    }
    if (importancePercent <= 70) {
      return t('importance.average');
    }
    if (importancePercent <= 85) {
      return t('importance.aboveAverage');
    }
    if (importancePercent <= 95) {
      return t('importance.high');
    }
    return t('importance.critical');
  };

  const updateAuthForm = (field: keyof AuthFormData, value: string) => {
    setAuthFormData((prev) => ({ ...prev, [field]: value }));
    // Сбрасываем ошибку для этого поля при вводе
    if (authErrors[field]) {
      setAuthErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Валидация формы при изменении полей
  const handleAuthFormChange = (field: keyof AuthFormData, value: string) => {
    updateAuthForm(field, value);
  };

  const validateAuthForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (isLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(authFormData.email);
      const isUsername = authFormData.email.length >= 3 && !authFormData.email.includes('@');

      // Показываем ошибку только если поле не пустое
      if (authFormData.email && !isEmail && !isUsername) {
        newErrors.email = tAuth('validation.emailOrUsernameRequired');
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Показываем ошибку только если email введен
      if (authFormData.email && !emailRegex.test(authFormData.email)) {
        newErrors.email = tAuth('validation.validEmailRequired');
      }

      // Показываем ошибку только если username введен
      if (authFormData.username && authFormData.username.length < 3) {
        newErrors.username = tAuth('validation.usernameMinLength');
      } else if (authFormData.username && !/^[a-zA-Z0-9_]+$/.test(authFormData.username)) {
        newErrors.username = tAuth('validation.usernameInvalidChars');
      }
    }

    // Показываем ошибку только если пароль введен
    if (authFormData.password && authFormData.password.length < 5) {
      newErrors.password = tAuth('validation.passwordMinLength');
    }

    // Показываем ошибку только если оба поля пароля введены
    if (
      !isLogin &&
      authFormData.password &&
      authFormData.confirmPassword &&
      authFormData.password !== authFormData.confirmPassword
    ) {
      newErrors.confirmPassword = tAuth('validation.passwordsNotMatch');
    }

    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async () => {
    if (!validateAuthForm()) {
      return;
    }

    setAuthLoading(true);
    setAuthErrors({});

    try {
      const { email, password, username } = authFormData;
      const { id } = await authUser(email, password, isLogin, username);

      await createGoalFromData(id);

      toast.success(isLogin ? tAuth('notifications.loginSuccess') : tAuth('notifications.registerSuccess'));
    } catch (error: any) {
      if (error?.response?.data) {
        const serverErrors = error.response.data as Record<string, string> | string;
        const normalized =
          typeof serverErrors === 'string' ? { server: serverErrors } : (serverErrors as Record<string, string>);
        setAuthErrors(normalized);
      } else {
        setAuthErrors({ server: t('common.networkError') });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async (codeResponse: CodeResponse): Promise<AuthResponse> => {
    try {
      const user = await googleLogin(codeResponse);

      await createGoalFromData(user.id);
      toast.success(tAuth('notifications.googleLoginSuccess'));
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(tAuth('notifications.googleLoginError'));
      throw error;
    }
  };

  // Общая функция для создания цели
  const createGoalFromData = async (currentUserId: string): Promise<void> => {
    // Проверяем, что все необходимые данные заполнены
    if (!data.goalName.trim()) {
      console.error('Goal name is required');
      return;
    }

    // Проверяем, что пользователь авторизован
    if (!currentUserId) {
      console.error('User must be authenticated');
      return;
    }

    try {
      const formDataToSend = new FormData();
      const selectedGoalType = data.goalType;
      const habitGoalSelected = selectedGoalType === 'challenge';
      const groupGoalSelected = selectedGoalType === 'group-challenge';

      // Основные поля (соответствуют DTO)
      formDataToSend.append('goalName', data.goalName.trim());
      formDataToSend.append('description', data.description?.trim() || '');
      formDataToSend.append('userId', currentUserId);
      formDataToSend.append('category', data.category || 'lifestyle');
      formDataToSend.append('privacy', data.privacy);
      formDataToSend.append('value', data.value.toString());
      formDataToSend.append('tutorialCompleted', 'true');

      // Тип цели
      if (habitGoalSelected) {
        formDataToSend.append('goalType', GoalType.Habit);

        // Параметры привычки
        formDataToSend.append('habitDuration', data.habitDuration.toString());
        formDataToSend.append('habitDaysOfWeek', JSON.stringify(data.habitDaysOfWeek));
      } else {
        formDataToSend.append('goalType', GoalType.Regular);
      }

      if (groupGoalSelected) {
        formDataToSend.append('isGroup', 'true');

        if (data.participantIds.length > 0) {
          formDataToSend.append('participantIds', JSON.stringify(data.participantIds));
        }

        const groupSettingsPayload: Partial<GroupSettingsState> = {};

        if (typeof data.groupSettings.allowMembersToInvite === 'boolean') {
          groupSettingsPayload.allowMembersToInvite = data.groupSettings.allowMembersToInvite;
        }
        if (typeof data.groupSettings.requireApproval === 'boolean') {
          groupSettingsPayload.requireApproval = data.groupSettings.requireApproval;
        }
        if (typeof data.groupSettings.maxParticipants === 'number') {
          groupSettingsPayload.maxParticipants = data.groupSettings.maxParticipants;
        }

        if (Object.keys(groupSettingsPayload).length > 0) {
          formDataToSend.append('groupSettings', JSON.stringify(groupSettingsPayload));
        }
      }

      // Даты
      if (data.startDate) {
        formDataToSend.append('startDate', data.startDate);
      }
      if (data.endDate && !noDeadline && !habitGoalSelected) {
        formDataToSend.append('endDate', data.endDate);
      }
      if (noDeadline || habitGoalSelected) {
        formDataToSend.append('noDeadline', 'true');
      }

      // Опциональные поля мотивации
      if (data.reward?.trim()) {
        formDataToSend.append('reward', data.reward.trim());
      }
      if (data.consequence?.trim()) {
        formDataToSend.append('consequence', data.consequence.trim());
      }

      // Шаги - форматируем под StepDto (только для обычных целей)
      if (!habitGoalSelected) {
        const validSteps = data.steps.filter((step) => step.trim().length > 0);
        const formattedSteps = validSteps.map((step, index) => ({
          id: `step-${index}`,
          text: step.trim(),
          isCompleted: false,
        }));
        formDataToSend.append('steps', JSON.stringify(formattedSteps));
      } else {
        // Для привычек создаем пустой массив шагов
        formDataToSend.append('steps', JSON.stringify([]));
      }

      // Изображение
      if (data.image) {
        formDataToSend.append('image', data.image);
      }

      console.log('Creating goal for user:', currentUserId);
      const createdGoal = await createGoal(formDataToSend);
      console.log('Goal created successfully:', createdGoal._id);

      toast.success(t('notifications.goalCreated'));
      router.push(`/goal/${createdGoal._id}`);
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
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
    if (!userId || !canContinue()) return;

    try {
      setSubmitting(true);

      await createGoalFromData(userId);
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
        return data.goalType.trim().length > 0;
      case 2:
        return data.goalName.trim().length > 0;
      case 3:
        // Для привычек проверяем, что выбран хотя бы один день недели
        if (data.goalType === 'challenge') {
          return data.habitDaysOfWeek.length > 0;
        }
        return true; // Шаги теперь необязательны для обычных целей
      case 4:
      case 5:
        return true; // Остальные поля опциональные
      case 6:
        return data.privacy !== undefined; // Требуем выбор приватности
      case 7:
        return !userId;
      default:
        return false;
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        step === totalSteps
          ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-gray-900 dark:to-teal-950'
          : 'bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-950 dark:via-gray-900 dark:to-indigo-950'
      }`}
    >
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-primary-200 via-primary-100 to-transparent blur-3xl opacity-60 dark:from-primary-900 dark:via-primary-800 dark:opacity-40" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-200 via-emerald-100 to-transparent blur-3xl opacity-60 dark:from-emerald-900 dark:via-emerald-800 dark:opacity-40" />
      </div>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Progress Indicator */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            {[
              { icon: faListCheck, label: t('steps.goalType') },
              { icon: faBullseye, label: t('steps.basics') },
              {
                icon:
                  data.goalType === 'challenge'
                    ? faFire
                    : data.goalType === 'group-challenge'
                    ? faUsers
                    : faListCheck,
                label:
                  data.goalType === 'challenge'
                    ? t('steps.habit')
                    : data.goalType === 'group-challenge'
                    ? t('steps.group')
                    : t('steps.steps'),
              },
              { icon: faCalendarAlt, label: t('steps.motivation') },
              { icon: faImage, label: t('steps.design') },
              { icon: faCheck, label: t('steps.finish') },
              ...(userId ? [] : [{ icon: faUserPlus, label: t('steps.account') }]),
            ].map((stepItem, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                      index + 1 === step
                        ? 'bg-primary-500 text-white dark:bg-primary-600'
                        : index + 1 < step
                        ? 'bg-green-600 text-white dark:bg-green-700'
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    <FontAwesomeIcon icon={stepItem.icon} className="text-sm" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      index + 1 <= step
                        ? index + 1 === step
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-green-700 dark:text-green-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {stepItem.label}
                  </span>
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`w-8 h-1 rounded mt-3 ${
                      index + 1 < step ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('stepIndicator', { step, totalSteps })}:{' '}
            {
              [
                t('stepDescriptions.goalTypeSelection'),
                t('stepDescriptions.basicInfo'),
                data.goalType === 'challenge'
                  ? t('stepDescriptions.habitSetup')
                  : data.goalType === 'group-challenge'
                  ? t('stepDescriptions.groupSetup')
                  : t('stepDescriptions.planningSteps'),
                t('stepDescriptions.motivationRewards'),
                t('stepDescriptions.photoCategory'),
                t('stepDescriptions.privacyComplexity'),
                ...(userId ? [] : [t('stepDescriptions.accountCreation')]),
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
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faListCheck} className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon icon={faBullseye} className="text-xs text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faUsers} className="text-xs text-white" />
                      </div>
                    </>
                  )}
                  {step === 2 && (
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
                  {step === 3 && (
                    <>
                      <div
                        className={`w-24 h-24 ${
                          isHabitGoal
                            ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500'
                            : isGroupGoal
                            ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500'
                            : 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600'
                        } rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300`}
                      >
                        <FontAwesomeIcon
                          icon={isHabitGoal ? faFire : isGroupGoal ? faUsers : faListCheck}
                          className="text-3xl text-white"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon
                          icon={isHabitGoal ? faCalendarCheck : isGroupGoal ? faUserPlus : faRoute}
                          className="text-xs text-white"
                        />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon
                          icon={isHabitGoal ? faStar : isGroupGoal ? faUsers : faTrophy}
                          className="text-xs text-white"
                        />
                      </div>
                    </>
                  )}
                  {step === 4 && (
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
                  {step === 5 && (
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
                  {step === 6 && (
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
                  {step === 7 && (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faUserPlus} className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <FontAwesomeIcon icon={faCheck} className="text-xs text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faStar} className="text-xs text-white" />
                      </div>
                    </>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{resolveStepTitle()}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{resolveStepDescription()}</p>
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
                {step === 7 && !userId ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faRoute} className="text-green-600 dark:text-green-400 text-sm" />
                      </div>
                      <span className="text-sm">{t('accountBenefits.progressTracking')}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-600 dark:text-blue-400 text-sm" />
                      </div>
                      <span className="text-sm">{t('accountBenefits.communitySupport')}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faTrophy} className="text-purple-600 dark:text-purple-400 text-sm" />
                      </div>
                      <span className="text-sm">{t('accountBenefits.achievementSystem')}</span>
                    </div>
                  </div>
                ) : step === 3 && isHabitGoal ? (
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg">
                    <FontAwesomeIcon icon={faLightbulb} className="text-purple-400 dark:text-purple-300 text-xl mb-3" />
                    <p className="text-purple-700 dark:text-purple-300 italic text-lg font-medium mb-2">
                      {t('quotes.habitQuote')}
                    </p>
                    <p className="text-purple-600 dark:text-purple-400 text-sm">— {t('authors.aristotle')}</p>
                  </div>
                ) : step === 3 && isGroupGoal ? (
                  <div className="space-y-4 text-left">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                          <FontAwesomeIcon icon={faHandshake} className="text-emerald-600 dark:text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {t('groupTips.title')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{t('groupTips.subtitle')}</p>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mt-0.5">
                            <FontAwesomeIcon icon={faFire} className="text-orange-600 dark:text-orange-400 text-sm" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {t('groupTips.benefits.motivation.title')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {t('groupTips.benefits.motivation.description')}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mt-0.5">
                            <FontAwesomeIcon icon={faChartLine} className="text-blue-600 dark:text-blue-400 text-sm" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {t('groupTips.benefits.progress.title')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {t('groupTips.benefits.progress.description')}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mt-0.5">
                            <FontAwesomeIcon
                              icon={faComments}
                              className="text-purple-600 dark:text-purple-400 text-sm"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {t('groupTips.benefits.experience.title')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {t('groupTips.benefits.experience.description')}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg text-center">
                      <FontAwesomeIcon
                        icon={faQuoteLeft}
                        className="text-primary-400 dark:text-primary-300 text-xl mb-3"
                      />
                      <p className="text-primary-700 dark:text-primary-300 italic text-lg font-medium mb-2">
                        {t('groupTips.quote')}
                      </p>
                      <p className="text-primary-500 dark:text-primary-400 text-sm">— {t('groupTips.quoteAuthor')}</p>
                    </div>
                  </div>
                ) : step === 3 ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FontAwesomeIcon icon={faLightbulb} className="text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                            {t('tips.canSkip')}
                          </span>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{t('tips.canSkipDescription')}</p>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg">
                      <FontAwesomeIcon
                        icon={faLightbulb}
                        className="text-yellow-500 dark:text-yellow-400 text-xl mb-3"
                      />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                        {t('tips.planningTips')}
                      </h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                        <li className="flex items-start">
                          <span className="text-primary-500 dark:text-primary-400 mr-2">•</span>
                          {t('tips.makeStepsSpecific')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 dark:text-primary-400 mr-2">•</span>
                          {t('tips.startWithSimple')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 dark:text-primary-400 mr-2">•</span>
                          {t('tips.stepsShouldBring')}
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 dark:text-primary-400 mr-2">•</span>
                          {t('tips.dontFearDetails')}
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg">
                    <FontAwesomeIcon
                      icon={faQuoteLeft}
                      className="text-primary-400 dark:text-primary-300 text-xl mb-3"
                    />
                    <p className="text-primary-700 dark:text-primary-300 italic text-lg font-medium mb-2">
                      {
                        [
                          t('quotes.goalWithoutPlan'),
                          t('quotes.thousandMilesJourney'),
                          t('quotes.bigJourneyStep'),
                          t('quotes.timeIsLife'),
                          t('quotes.dreamWithoutImage'),
                          t('quotes.perfectionAchieved'),
                        ][step === 3 ? 2 : step - 1]
                      }
                    </p>
                    <p className="text-primary-500 dark:text-primary-400 text-sm">
                      —{' '}
                      {
                        [
                          t('authors.saintExupery'),
                          t('authors.laoTzu'),
                          t('authors.confucius'),
                          t('authors.benjaminFranklin'),
                          t('authors.folkWisdom'),
                          t('authors.saintExupery'),
                        ][step === 3 ? 2 : step - 1]
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Section - Form */}
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
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
                        {/* Goal Type Selection */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-6">
                            {t('goalTypes.title')}
                          </label>

                          <div className="space-y-4">
                            <label
                              className={`cursor-pointer group block p-6 border-2 rounded-xl transition-all duration-300 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1 ${
                                data.goalType === 'deadline'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-lg'
                                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="goal-type"
                                value="deadline"
                                checked={data.goalType === 'deadline'}
                                onChange={(e) => update('goalType', e.target.value)}
                                className="sr-only"
                              />
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                                  <FontAwesomeIcon
                                    icon={faCalendarCheck}
                                    className="text-blue-600 dark:text-blue-400 text-xl"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                    {t('goalTypes.deadlineGoal')}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t('goalTypes.deadlineGoalDescription')}
                                  </p>
                                </div>
                              </div>
                            </label>

                            <label
                              className={`cursor-pointer group block p-6 border-2 rounded-xl transition-all duration-300 hover:border-orange-300 hover:shadow-lg transform hover:-translate-y-1 ${
                                data.goalType === 'challenge'
                                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-400 shadow-lg'
                                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="goal-type"
                                value="challenge"
                                checked={data.goalType === 'challenge'}
                                onChange={(e) => update('goalType', e.target.value)}
                                className="sr-only"
                              />
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-700 transition-colors">
                                  <FontAwesomeIcon
                                    icon={faFire}
                                    className="text-orange-600 dark:text-orange-400 text-xl"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                    {t('goalTypes.habitGoal')}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t('goalTypes.habitGoalDescription')}
                                  </p>
                                </div>
                              </div>
                            </label>

                            <label
                              className={`cursor-pointer group block p-6 border-2 rounded-xl transition-all duration-300 hover:border-emerald-300 hover:shadow-lg transform hover:-translate-y-1 ${
                                isGroupGoal
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-400 shadow-lg'
                                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="goal-type"
                                value="group-challenge"
                                checked={isGroupGoal}
                                onChange={(e) => update('goalType', e.target.value)}
                                className="sr-only"
                              />
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-xl flex items-center justify-center mr-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-700 transition-colors">
                                  <FontAwesomeIcon
                                    icon={faUsers}
                                    className="text-emerald-600 dark:text-emerald-400 text-xl"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                    {t('goalTypes.groupChallenge')}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t('goalTypes.groupChallengeDescription')}
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {/* Goal Title */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-3">
                            {t('fields.goalNameRequired')}
                          </label>
                          <input
                            type="text"
                            value={data.goalName}
                            onChange={(e) => update('goalName', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder={t('fields.goalNamePlaceholder')}
                            maxLength={80}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('fields.goalNameHelper')}</p>
                            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                              {data.goalName.length}/80
                            </span>
                          </div>
                        </div>

                        {/* Goal Description */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-3">
                            {t('fields.whyThisGoal')}
                          </label>
                          <textarea
                            value={data.description}
                            onChange={(e) => update('description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-base transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder={t('fields.descriptionPlaceholder')}
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {t('fields.descriptionHelper')}
                          </p>
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        {isHabitGoal ? (
                          <HabitSettings
                            habitDuration={data.habitDuration}
                            habitDaysOfWeek={data.habitDaysOfWeek}
                            onHabitDurationChange={(duration) => update('habitDuration', duration)}
                            onHabitDaysOfWeekChange={(days) => update('habitDaysOfWeek', days)}
                          />
                        ) : isGroupGoal ? (
                          <GroupGoalSettings
                            participantIds={data.participantIds}
                            groupSettings={data.groupSettings}
                            onParticipantAdd={addParticipant}
                            onParticipantRemove={removeParticipant}
                            onGroupSettingsChange={updateGroupSettings}
                          />
                        ) : (
                          <StepsManager
                            steps={data.steps}
                            onStepsChange={(steps) => update('steps', steps)}
                            goalName={data.goalName}
                          />
                        )}
                      </>
                    )}

                    {step === 4 && (
                      <>
                        {/* Timing Section - только для обычных целей */}
                        {data.goalType !== 'challenge' && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="text-primary-500 dark:text-primary-400 mr-2"
                              />
                              {t('fields.timeframe')}
                            </h3>

                            <div className={`grid gap-4 mb-4 ${noDeadline ? 'grid-cols-1' : 'grid-cols-2'}`}>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  {t('fields.startDate')}
                                </label>
                                <input
                                  type="date"
                                  value={data.startDate}
                                  onChange={(e) => update('startDate', e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              {!noDeadline && (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('fields.deadline')}
                                  </label>
                                  <input
                                    type="date"
                                    value={data.endDate}
                                    onChange={(e) => update('endDate', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                              <label htmlFor="no-deadline" className="text-sm text-gray-600 dark:text-gray-300">
                                {t('fields.noDeadline')}
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Reward */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-3">
                            <FontAwesomeIcon icon={faGift} className="mr-2 text-green-500 dark:text-green-400" />
                            {t('fields.rewardForSuccess')}
                          </label>
                          <input
                            type="text"
                            value={data.reward}
                            onChange={(e) => update('reward', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder={t('fields.rewardPlaceholder')}
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('fields.rewardHelper')}</p>
                        </div>

                        {/* Consequence */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-3">
                            <FontAwesomeIcon
                              icon={faExclamationTriangle}
                              className="mr-2 text-red-500 dark:text-red-400"
                            />
                            {t('fields.consequenceForFailure')}
                          </label>
                          <input
                            type="text"
                            value={data.consequence}
                            onChange={(e) => update('consequence', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder={t('fields.consequencePlaceholder')}
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {t('fields.consequenceHelper')}
                          </p>
                        </div>
                      </>
                    )}

                    {step === 5 && (
                      <>
                        {/* Goal Image */}
                        <ImageUploader image={data.image} onImageChange={(image) => update('image', image)} />

                        {/* Category */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-3">
                            <FontAwesomeIcon icon={faTags} className="mr-2 text-primary-500 dark:text-primary-400" />
                            {tGoals('category')}
                          </label>
                          <select
                            value={data.category || ''}
                            onChange={(e) => update('category', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('fields.categoryHelper')}</p>
                        </div>
                      </>
                    )}

                    {step === 6 && (
                      <>
                        {/* Goal Importance Slider */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-3">
                            {t('fields.goalImportanceRequired')}
                          </label>
                          <div className="space-y-4">
                            <div className="relative">
                              <input
                                type="range"
                                min={GOAL_VALUE_MIN}
                                max={GOAL_VALUE_MAX}
                                value={data.value}
                                onChange={(e) => handleValueChange(Number(e.target.value))}
                                className="w-full h-3 bg-gradient-to-r from-gray-200 via-yellow-300 to-red-500 rounded-lg appearance-none cursor-pointer"
                                style={{
                                  background: 'linear-gradient(to right, #e5e7eb 0%, #fde047 50%, #ef4444 100%)',
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {GOAL_VALUE_MARKS.map((mark) => (
                                  <span key={`goal-value-mark-${mark}`}>{mark}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-center space-y-1">
                              <label htmlFor="goal-value-input" className="sr-only">
                                {t('fields.goalImportance')}
                              </label>
                              <input
                                id="goal-value-input"
                                min={GOAL_VALUE_MIN}
                                max={GOAL_VALUE_MAX}
                                value={data.value}
                                onChange={(e) => handleValueChange(Number(e.target.value))}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-full text-3xl font-bold text-primary-600 dark:text-primary-400 text-center bg-transparent border-none focus:outline-none focus:ring-0"
                              />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {resolveImportanceLabel(data.value)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Privacy Settings */}
                        <div>
                          <label className="block text-lg font-bold text-gray-800 dark:text-white mb-3">
                            {t('fields.privacyLevelRequired')}
                          </label>
                          <div className="space-y-3">
                            <label
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-colors ${
                                data.privacy === PrivacyStatus.Private
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400'
                                  : 'border-gray-200 dark:border-gray-600'
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
                                  data.privacy === PrivacyStatus.Private
                                    ? 'border-primary-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {data.privacy === PrivacyStatus.Private && (
                                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faLock} className="text-gray-600 dark:text-gray-400 mr-2" />
                                  <span className="font-semibold text-gray-800 dark:text-white">
                                    {t('privacy.private')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {t('privacy.privateDescription')}
                                </p>
                              </div>
                            </label>

                            <label
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-colors ${
                                data.privacy === PrivacyStatus.Friends
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400'
                                  : 'border-gray-200 dark:border-gray-600'
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
                                  data.privacy === PrivacyStatus.Friends
                                    ? 'border-primary-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {data.privacy === PrivacyStatus.Friends && (
                                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faUsers} className="text-gray-600 dark:text-gray-400 mr-2" />
                                  <span className="font-semibold text-gray-800 dark:text-white">
                                    {t('privacy.friends')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {t('privacy.friendsDescription')}
                                </p>
                              </div>
                            </label>

                            <label
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-colors ${
                                data.privacy === PrivacyStatus.Public
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400'
                                  : 'border-gray-200 dark:border-gray-600'
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
                                  data.privacy === PrivacyStatus.Public
                                    ? 'border-primary-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {data.privacy === PrivacyStatus.Public && (
                                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faGlobe} className="text-gray-600 dark:text-gray-400 mr-2" />
                                  <span className="font-semibold text-gray-800 dark:text-white">
                                    {t('privacy.public')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {t('privacy.publicDescription')}
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {step === 7 && !userId && (
                      <>
                        {/* Auth tabs */}
                        <div className="flex mb-6">
                          <button
                            type="button"
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                              !isLogin
                                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                                : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-primary-600 dark:hover:text-primary-400'
                            }`}
                            onClick={() => {
                              setIsLogin(false);
                              setAuthErrors({});
                              // Сбросим поля формы при переключении
                              setAuthFormData({
                                email: '',
                                username: '',
                                password: '',
                                confirmPassword: '',
                              });
                            }}
                          >
                            {tAuth('register')}
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                              isLogin
                                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                                : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-primary-600 dark:hover:text-primary-400'
                            }`}
                            onClick={() => {
                              setIsLogin(true);
                              setAuthErrors({});
                              // Сбросим поля формы при переключении
                              setAuthFormData({
                                email: '',
                                username: '',
                                password: '',
                                confirmPassword: '',
                              });
                            }}
                          >
                            {tAuth('login')}
                          </button>
                        </div>

                        {/* Google Login */}
                        <div className="mb-6">
                          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                            <div className="w-full [&>button]:w-full [&>button]:bg-white dark:[&>button]:bg-gray-700 [&>button]:border-2 [&>button]:border-gray-200 dark:[&>button]:border-gray-600 [&>button]:text-gray-700 dark:[&>button]:text-gray-200 [&>button]:py-3 [&>button]:px-6 [&>button]:rounded-xl [&>button]:font-semibold [&>button]:text-sm [&>button]:hover:border-gray-300 dark:[&>button]:hover:border-gray-500 [&>button]:hover:bg-gray-50 dark:[&>button]:hover:bg-gray-600 [&>button]:transition-all [&>button]:duration-200 [&>button]:shadow-sm [&>button]:hover:shadow-md">
                              <GoogleLoginButton googleLogin={handleGoogleLogin} />
                            </div>
                          </GoogleOAuthProvider>
                        </div>

                        <div className="relative mb-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                              {tCommon('or')}
                            </span>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <FontAwesomeIcon icon={faUsers} className="text-primary-500 dark:text-primary-400 mr-2" />
                            {isLogin ? tAuth('emailOrUsername') : tAuth('email')}
                          </label>
                          <input
                            type={isLogin ? 'text' : 'email'}
                            value={authFormData.email}
                            onChange={(e) => handleAuthFormChange('email', e.target.value)}
                            className={`w-full px-3 py-3 border-2 rounded-lg text-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              authErrors.email
                                ? 'border-red-500'
                                : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                            }`}
                            placeholder={tAuth(`placeholders.${isLogin ? 'emailOrUsername' : 'email'}`)}
                            required
                          />
                          {authErrors.email && <p className="text-red-500 text-xs mt-1">{authErrors.email}</p>}
                        </div>

                        {/* Username (only for registration) */}
                        {!isLogin && (
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              <FontAwesomeIcon icon={faUsers} className="text-primary-500 dark:text-primary-400 mr-2" />
                              {tAuth('username')}
                            </label>
                            <input
                              type="text"
                              value={authFormData.username}
                              onChange={(e) => handleAuthFormChange('username', e.target.value)}
                              className={`w-full px-3 py-3 border-2 rounded-lg text-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                authErrors.username
                                  ? 'border-red-500'
                                  : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                              }`}
                              placeholder={tAuth('placeholders.username')}
                              required
                            />
                            {authErrors.username && <p className="text-red-500 text-xs mt-1">{authErrors.username}</p>}
                          </div>
                        )}

                        {/* Password */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <FontAwesomeIcon icon={faLock} className="text-primary-500 dark:text-primary-400 mr-2" />
                            {tAuth('password')}
                          </label>
                          <input
                            type="password"
                            value={authFormData.password}
                            onChange={(e) => handleAuthFormChange('password', e.target.value)}
                            className={`w-full px-3 py-3 border-2 rounded-lg text-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              authErrors.password
                                ? 'border-red-500'
                                : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                            }`}
                            placeholder="••••••••"
                            required
                          />
                          {authErrors.password && <p className="text-red-500 text-xs mt-1">{authErrors.password}</p>}
                        </div>

                        {/* Confirm Password (only for registration) */}
                        {!isLogin && (
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              <FontAwesomeIcon icon={faLock} className="text-primary-500 dark:text-primary-400 mr-2" />
                              {tAuth('confirmPassword')}
                            </label>
                            <input
                              type="password"
                              value={authFormData.confirmPassword}
                              onChange={(e) => handleAuthFormChange('confirmPassword', e.target.value)}
                              className={`w-full px-3 py-3 border-2 rounded-lg text-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                authErrors.confirmPassword
                                  ? 'border-red-500'
                                  : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                              }`}
                              placeholder="••••••••"
                              required
                            />
                            {authErrors.confirmPassword && (
                              <p className="text-red-500 text-xs mt-1">{authErrors.confirmPassword}</p>
                            )}
                          </div>
                        )}

                        {authErrors.server && <p className="text-red-500 text-xs mb-4">{authErrors.server}</p>}
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
                        className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white py-3 px-6 rounded-xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {t('buttons.continue')}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                      </button>
                      {(step === 3 || step === 4 || step === 5) && (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold text-sm transition-colors"
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
                            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold text-sm transition-colors"
                          >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            {t('buttons.back')}
                          </button>
                        )}
                      </div>
                    </>
                  ) : step === totalSteps && !userId ? (
                    <>
                      {/* Auth form submit button */}
                      <button
                        type="button"
                        onClick={handleAuthSubmit}
                        disabled={authLoading}
                        className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white py-3 px-6 rounded-xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {authLoading
                          ? tCommon('wait')
                          : isLogin
                          ? t('buttons.loginAndCreateGoal')
                          : t('buttons.registerAndCreateGoal')}
                        <FontAwesomeIcon icon={faCheck} className="ml-2" />
                      </button>
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold text-sm transition-colors"
                        >
                          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                          Назад
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Final submit button for goal creation */}
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canContinue() || submitting}
                        className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-3 px-6 rounded-xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {submitting ? t('buttons.creating') : t('buttons.createGoal')}
                        <FontAwesomeIcon icon={faCheck} className="ml-2" />
                      </button>
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold text-sm transition-colors"
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

        @media (prefers-color-scheme: dark) {
          input[type='range']::-webkit-slider-thumb {
            border: 3px solid #374151;
          }

          input[type='range']::-moz-range-thumb {
            border: 3px solid #374151;
          }
        }

        .dark input[type='range']::-webkit-slider-thumb {
          border: 3px solid #374151;
        }

        .dark input[type='range']::-moz-range-thumb {
          border: 3px solid #374151;
        }
      `}</style>
    </div>
  );
};

export default GoalCreateWizard;
