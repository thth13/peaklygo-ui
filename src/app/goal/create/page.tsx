'use client';
import React, { JSX, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Upload,
  Heart,
  DollarSign,
  Zap,
  Briefcase,
  GraduationCap,
  Users,
  Plus,
  Trash2,
  LucideIcon,
} from 'lucide-react';

interface Category {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

interface FormData {
  goalName: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  hasDeadline: boolean;
  goalImage: File | null;
  steps: string[];
  trackingType: 'checklist' | 'manual' | 'numeric';
  targetValue: string;
  unit: string;
  reminders: {
    daily: boolean;
    weekly: boolean;
    beforeDeadline: boolean;
  };
  enableWordValue: boolean;
  rewards: string[];
  privacy: 'private' | 'friends' | 'public';
  makeChallenge: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    friendComments: boolean;
  };
  publicationSettings: {
    allowComments: boolean;
    showInFeed: boolean;
    autoPublishAchievements: boolean;
  };
  tags: string[];
}

const GoalCreationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    // Шаг 1: Основная информация
    goalName: '',
    category: 'health',
    description: '',
    startDate: '',
    endDate: '',
    hasDeadline: true,
    goalImage: null,

    // Шаг 2: Шаги и метрики
    steps: ['', ''],
    trackingType: 'checklist',
    targetValue: '',
    unit: '',
    reminders: {
      daily: false,
      weekly: false,
      beforeDeadline: false,
    },
    enableWordValue: false,
    rewards: [''],

    // Шаг 3: Настройки и приватность
    privacy: 'friends',
    makeChallenge: false,
    notifications: {
      email: true,
      push: false,
      friendComments: true,
    },
    publicationSettings: {
      allowComments: true,
      showInFeed: true,
      autoPublishAchievements: false,
    },
    tags: ['спорт', 'здоровье'],
  });

  const categories: Category[] = [
    { id: 'health', icon: Heart, label: 'Здоровье', color: 'text-red-500' },
    { id: 'finance', icon: DollarSign, label: 'Финансы', color: 'text-yellow-500' },
    { id: 'personal', icon: Zap, label: 'Саморазвитие', color: 'text-purple-500' },
    { id: 'work', icon: Briefcase, label: 'Работа', color: 'text-blue-500' },
    { id: 'education', icon: GraduationCap, label: 'Образование', color: 'text-green-500' },
    { id: 'relationships', icon: Users, label: 'Отношения', color: 'text-pink-500' },
  ];

  const updateFormData = <K extends keyof FormData>(field: K, value: any): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedFormData = <P extends keyof FormData, K extends keyof FormData[P]>(
    parent: P,
    field: K,
    value: FormData[P][K],
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        //@ts-ignore
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const addStep = (): void => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  };

  const updateStep = (index: number, value: string): void => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    updateFormData('steps', newSteps);
  };

  const removeStep = (index: number): void => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    updateFormData('steps', newSteps);
  };

  const addReward = (): void => {
    setFormData((prev) => ({
      ...prev,
      rewards: [...prev.rewards, ''],
    }));
  };

  const updateReward = (index: number, value: string): void => {
    const newRewards = [...formData.rewards];
    newRewards[index] = value;
    updateFormData('rewards', newRewards);
  };

  const removeReward = (index: number): void => {
    const newRewards = formData.rewards.filter((_, i) => i !== index);
    updateFormData('rewards', newRewards);
  };

  const addTag = (tag: string): void => {
    if (tag && !formData.tags.includes(tag)) {
      updateFormData('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string): void => {
    updateFormData(
      'tags',
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const nextStep = (): void => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = (): void => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getProgressPercentage = (): number => {
    return (currentStep / 3) * 100;
  };

  const handleFormSubmit = (): void => {
    console.log('Form submitted:', formData);
    alert('Цель создана!');
  };
  const renderStep1 = (): JSX.Element => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          1
        </div>
        <h2 className="text-xl font-semibold">Основная информация</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Название цели <span className="text-red-500">*обязательно</span>
        </label>
        <input
          type="text"
          placeholder="Например, Пробежать полумарафон"
          value={formData.goalName}
          onChange={(e) => updateFormData('goalName', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="text-right text-sm text-gray-500 mt-1">0/80</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Категория</label>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => updateFormData('category', category.id)}
                className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                  formData.category === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <IconComponent className={`w-6 h-6 ${category.color}`} />
                <span className="text-sm">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Описание / Зачем эта цель?</label>
        <textarea
          placeholder="Я давно мечтаю стать выносливее и проверить себя."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="text-sm text-gray-600 mt-2">Опишите, почему эта цель важна для вас</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Дата начала</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormData('startDate', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Дата дедлайна</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => updateFormData('endDate', e.target.value)}
            disabled={!formData.hasDeadline}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="noDeadline"
              checked={!formData.hasDeadline}
              onChange={(e) => updateFormData('hasDeadline', !e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="noDeadline" className="ml-2 text-sm">
              Без дедлайна
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Фото или обложка цели (опционально)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-blue-500 hover:text-blue-600 cursor-pointer">Загрузить файл или перетащите</p>
          <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF до 10МБ</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          2
        </div>
        <h2 className="text-xl font-semibold">Шаги и метрики</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Подцели / Чек-лист шагов</label>
        <div className="space-y-3">
          {formData.steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Например: ${index === 0 ? 'Купить беговые кроссовки' : 'Составить план тренировок'}`}
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {formData.steps.length > 1 && (
                <button onClick={() => removeStep(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addStep} className="mt-3 flex items-center space-x-2 text-blue-500 hover:text-blue-600">
          <Plus className="w-4 h-4" />
          <span>Добавить шаг</span>
        </button>
        <p className="text-sm text-gray-600 mt-2">Разбейте цель на конкретные выполнимые шаги</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Отслеживание прогресса</label>
        <div className="space-y-3">
          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="trackingType"
              value="checklist"
              checked={formData.trackingType === 'checklist'}
              onChange={(e) => updateFormData('trackingType', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">По чек-листу</div>
              <div className="text-sm text-gray-600">
                Прогресс будет рассчитываться автоматически на основе выполненных шагов
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="trackingType"
              value="manual"
              checked={formData.trackingType === 'manual'}
              onChange={(e) => updateFormData('trackingType', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">Вручную</div>
              <div className="text-sm text-gray-600">Вы будете отмечать прогресс самостоятельно</div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="trackingType"
              value="numeric"
              checked={formData.trackingType === 'numeric'}
              onChange={(e) => updateFormData('trackingType', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">Числовая метрика</div>
              <div className="text-sm text-gray-600">Отслеживание по числовому показателю</div>
              {formData.trackingType === 'numeric' && (
                <div className="flex space-x-3 mt-3">
                  <input
                    type="number"
                    placeholder="Целевое значение"
                    value={formData.targetValue}
                    onChange={(e) => updateFormData('targetValue', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Единица измерения"
                    value={formData.unit}
                    onChange={(e) => updateFormData('unit', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Напоминания</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.reminders.daily}
              onChange={(e) => updateNestedFormData('reminders', 'daily', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Ежедневные напоминания</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.reminders.weekly}
              onChange={(e) => updateNestedFormData('reminders', 'weekly', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Еженедельный отчет о прогрессе</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.reminders.beforeDeadline}
              onChange={(e) => updateNestedFormData('reminders', 'beforeDeadline', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Напоминание за 3 дня до дедлайна</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Награды за промежуточные результаты</label>
        <div className="space-y-3">
          {formData.rewards.map((reward, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                placeholder={index === 0 ? '25% выполнения' : 'Купить новую книгу'}
                value={reward}
                onChange={(e) => updateReward(index, e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.rewards.length > 1 && (
                <button onClick={() => removeReward(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addReward} className="mt-3 flex items-center space-x-2 text-blue-500 hover:text-blue-600">
          <Plus className="w-4 h-4" />
          <span>Добавить награду</span>
        </button>
        <p className="text-sm text-gray-600 mt-2">Запланируйте награды для поддержания мотивации</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          3
        </div>
        <h2 className="text-xl font-semibold">Настройки и приватность</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Уровень приватности</label>
        <div className="space-y-3">
          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="privacy"
              value="private"
              checked={formData.privacy === 'private'}
              onChange={(e) => updateFormData('privacy', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">🔒 Приватная</div>
              <div className="text-sm text-gray-600">Только вы можете видеть эту цель и ваш прогресс</div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="privacy"
              value="friends"
              checked={formData.privacy === 'friends'}
              onChange={(e) => updateFormData('privacy', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">👥 Только для друзей</div>
              <div className="text-sm text-gray-600">Ваши друзья могут видеть цель и поддерживать вас</div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="privacy"
              value="public"
              checked={formData.privacy === 'public'}
              onChange={(e) => updateFormData('privacy', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">🌍 Публичная</div>
              <div className="text-sm text-gray-600">Все пользователи могут видеть вашу цель и прогресс</div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Сделать из цели челлендж</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.makeChallenge}
            onChange={(e) => updateFormData('makeChallenge', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Уведомления</label>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email уведомления</div>
              <div className="text-sm text-gray-600">Получать уведомления на почту</div>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.email}
              onChange={(e) => updateNestedFormData('notifications', 'email', e.target.checked)}
              className="w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push уведомления</div>
              <div className="text-sm text-gray-600">Уведомления в браузере</div>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.push}
              onChange={(e) => updateNestedFormData('notifications', 'push', e.target.checked)}
              className="w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Комментарии друзей</div>
              <div className="text-sm text-gray-600">Уведомления о поддержке от друзей</div>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.friendComments}
              onChange={(e) => updateNestedFormData('notifications', 'friendComments', e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Обложка цели (опционально)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-blue-500 hover:text-blue-600 cursor-pointer text-sm">
            Перетащите изображение сюда или выберите файл
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG до 5МБ</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Настройки публикации</label>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Разрешить комментарии</div>
              <div className="text-sm text-gray-600">Другие пользователи могут оставлять комментарии</div>
            </div>
            <input
              type="checkbox"
              checked={formData.publicationSettings.allowComments}
              onChange={(e) => updateNestedFormData('publicationSettings', 'allowComments', e.target.checked)}
              className="w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Показывать в ленте активности</div>
              <div className="text-sm text-gray-600">Цель будет видна в общей ленте</div>
            </div>
            <input
              type="checkbox"
              checked={formData.publicationSettings.showInFeed}
              onChange={(e) => updateNestedFormData('publicationSettings', 'showInFeed', e.target.checked)}
              className="w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Автопубликация достижений</div>
              <div className="text-sm text-gray-600">Автоматически делиться прогрессом</div>
            </div>
            <input
              type="checkbox"
              checked={formData.publicationSettings.autoPublishAchievements}
              onChange={(e) => updateNestedFormData('publicationSettings', 'autoPublishAchievements', e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Теги (опционально)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
            >
              <span>{tag}</span>
              <button onClick={() => removeTag(tag)} className="text-blue-600 hover:text-blue-800">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Добавить тег"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={(e) => {
              const input = e.target as HTMLInputElement;
              addTag(input.value);
              input.value = '';
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">Теги помогут другим пользователям найти похожие цели</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Заголовок и прогрессбар */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Создание цели</h1>

        {/* Прогрессбар */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Прогресс</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Индикаторы шагов */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className={`text-sm ${currentStep === 1 ? 'font-medium' : 'text-gray-500'}`}>
              Основная информация
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span className={`text-sm ${currentStep === 2 ? 'font-medium' : 'text-gray-500'}`}>Шаги и метрики</span>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </div>
            <span className={`text-sm ${currentStep === 3 ? 'font-medium' : 'text-gray-500'}`}>
              Настройки и приватность
            </span>
          </div>
        </div>
      </div>

      {/* Мотивирующая цитата */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <blockquote className="text-sm text-gray-700 italic">
          {currentStep === 1 &&
            'Каждое утро у тебя два выбора: продолжать спать с мечтой или проснуться и начать её достигать.'}
          {currentStep === 2 && 'Большие цели достигаются маленькими шагами каждый день.'}
          {currentStep === 3 && 'Успех — это не финальная точка, а путь, который ты выбираешь каждый день.'}
        </blockquote>
        <cite className="block mt-2 text-xs text-blue-600">Мотивирующая цитата дня</cite>
      </div>

      {/* Контент текущего шага */}
      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Навигационные кнопки */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
          )}

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Сохранить черновик</button>

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Сбросить</button>
        </div>

        <button
          onClick={currentStep === 3 ? () => alert('Цель создана!') : nextStep}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <span>{currentStep === 3 ? 'Создать цель' : 'Далее'}</span>
          {currentStep < 3 && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default GoalCreationForm;
