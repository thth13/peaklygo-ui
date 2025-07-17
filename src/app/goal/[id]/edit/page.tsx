'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';
import { ImagePreviewer } from '@/components/ImagePreviewer';
import { Steps } from '@/components/Steps';
import { getGoal, updateGoal } from '@/lib/api/goal';
import { useUserProfile } from '@/context/UserProfileContext';
import { useRouter, useParams } from 'next/navigation';

interface Step {
  id: string;
  text: string;
}

enum PrivaciyStatus {
  Private = 'private',
  Friends = 'friends',
  Public = 'public',
}

export interface GoalFormData {
  goalName: string;
  description: string;
  category: string;
  customCategory: string;
  startDate: string;
  endDate: string | null;
  noDeadline: boolean;
  privacy: PrivaciyStatus;
  reward: string;
  consequence: string;
  value: number;
  image: File | null;
}

const categories = [
  { id: 'health', name: 'Здоровье', icon: faHeart, color: 'text-red-500' },
  { id: 'finance', name: 'Финансы', icon: faCoins, color: 'text-yellow-500' },
  { id: 'development', name: 'Саморазвитие', icon: faBrain, color: 'text-purple-500' },
  { id: 'work', name: 'Работа', icon: faBriefcase, color: 'text-blue-500' },
  { id: 'education', name: 'Образование', icon: faGraduationCap, color: 'text-green-500' },
  { id: 'relationships', name: 'Отношения', icon: faUsers, color: 'text-pink-500' },
  { id: 'sport', name: 'Спорт', icon: faTrophy, color: 'text-orange-500' },
  { id: 'custom', name: 'Своя категория', icon: faPlus, color: 'text-gray-500' },
];

const GoalEditPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const { profile } = useUserProfile();

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<GoalFormData>({
    goalName: '',
    description: '',
    category: '',
    customCategory: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
    noDeadline: false,
    privacy: PrivaciyStatus.Public,
    reward: '',
    consequence: '',
    value: 100,
    image: null,
  });

  const [stepsState, setStepsState] = useState<Step[]>([]);

  useEffect(() => {
    const loadGoalData = async () => {
      try {
        const goal = await getGoal(goalId);

        setFormData({
          goalName: goal.goalName,
          description: goal.description || '',
          category: goal.category,
          customCategory: '',
          startDate: new Date(goal.startDate).toISOString().slice(0, 10),
          endDate: goal.endDate ? new Date(goal.endDate).toISOString().slice(0, 10) : null,
          noDeadline: goal.noDeadline || false,
          privacy: goal.privacy,
          reward: goal.reward || '',
          consequence: goal.consequence || '',
          value: goal.value,
          image: null,
        });

        setStepsState(
          goal.steps.map((step) => ({
            id: step.id,
            text: step.text,
            isCompleted: step.isCompleted,
          })),
        );

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading goal:', error);
        setIsLoading(false);
      }
    };

    if (goalId) {
      loadGoalData();
    }
  }, [goalId]);

  const handleInputChange = (field: keyof GoalFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStepChange = (id: string, text: string) => {
    setStepsState((prev) => prev.map((step) => (step.id === id ? { ...step, text } : step)));
  };

  const addStep = () => {
    const newId = Date.now().toString();
    setStepsState((prev) => [...prev, { id: newId, text: '' }]);
  };

  const removeStep = (id: string) => {
    setStepsState((prev) => prev.filter((step) => step.id !== id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (profile) {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && key !== 'steps' && key !== 'endDate') {
          formDataToSend.append(key, value);
        }
      });

      if (formData.endDate) {
        formDataToSend.append('endDate', formData.endDate);
      }

      formDataToSend.append('steps', JSON.stringify(stepsState));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      formDataToSend.append('userId', profile.user);
      await updateGoal(goalId, formDataToSend);

      router.push(`/goal/${goalId}`);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto mt-6 px-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Загрузка цели...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <div className="bg-gray-50 dark:bg-gray-900 font-sans min-h-screen transition-colors">
        {/* Main Content */}
        <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Редактирование цели</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Обновите данные вашей цели</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Goal Name */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Название цели
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      placeholder="Например, Пробежать полумарафон"
                      type="text"
                      maxLength={80}
                      value={formData.goalName}
                      onChange={(e) => handleInputChange('goalName', e.target.value)}
                      required
                    />
                    <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Сформулируйте конкретную и измеримую цель</span>
                      <span>{formData.goalName.length}/80</span>
                    </div>
                  </div>

                  {/* Goal Description */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Описание цели
                    </label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent min-h-[120px] transition-colors"
                      placeholder="Я давно мечтаю стать выносливее и проверить себя..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Опишите, почему эта цель важна для вас и что она даст
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Категория
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-h-[90px] group ${
                            formData.category === category.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
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
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                          placeholder="Введите свою категорию"
                          type="text"
                          value={formData.customCategory}
                          onChange={(e) => handleInputChange('customCategory', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Upload */}
                  <ImagePreviewer handleInputChange={handleInputChange} image={formData.image} />

                  {/* steps */}
                  <div>
                    <Steps
                      steps={stepsState}
                      onStepChange={handleStepChange}
                      onAddStep={addStep}
                      onRemoveStep={removeStep}
                    />
                  </div>

                  {/* Timeframe */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Временные рамки
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Дата начала
                        </label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                        />
                      </div>
                      {!formData.noDeadline && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Дата завершения
                          </label>
                          <input
                            type="date"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                            value={formData.endDate || ''}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4"
                          checked={formData.noDeadline}
                          onChange={(e) => handleInputChange('noDeadline', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Без конкретного дедлайна</span>
                      </label>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Уровень приватности
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <input
                          type="radio"
                          name="privacy"
                          value="private"
                          className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4"
                          checked={formData.privacy === 'private'}
                          onChange={(e) => handleInputChange('privacy', e.target.value)}
                        />
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faLock} className="text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">Приватная</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Только вы видите эту цель</p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <input
                          type="radio"
                          name="privacy"
                          value="friends"
                          className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4"
                          checked={formData.privacy === 'friends'}
                          onChange={(e) => handleInputChange('privacy', e.target.value)}
                        />
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserGroup} className="text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">Для друзей</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Только ваши друзья могут видеть</p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <input
                          type="radio"
                          name="privacy"
                          value="public"
                          className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4"
                          checked={formData.privacy === 'public'}
                          onChange={(e) => handleInputChange('privacy', e.target.value)}
                        />
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faGlobe} className="text-green-600 dark:text-green-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">Публичная</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Все пользователи могут видеть и поддерживать
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Goal Value */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Ценность цели
                    </label>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Награда за достижение
                          </label>
                          <input
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                            placeholder="Например: Новые кроссовки"
                            type="text"
                            value={formData.reward}
                            onChange={(e) => handleInputChange('reward', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Последствия невыполнения
                          </label>
                          <input
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                            placeholder="Например: Пожертвование на благотворительность"
                            type="text"
                            value={formData.consequence}
                            onChange={(e) => handleInputChange('consequence', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Ценность цели
                        </label>
                        <div className="px-3">
                          <input
                            type="range"
                            min="0"
                            max="500"
                            value={formData.value}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            onChange={(e) => handleInputChange('value', parseInt(e.target.value))}
                          />
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <span>Низкая</span>
                            <div className="text-center mt-2">
                              <span className="text-2xl font-medium text-blue-600 dark:text-blue-400">
                                {formData.value}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400"> баллов</span>
                            </div>
                            <span>Высокая</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Чем сложнее цель, тем больше баллов вы получите за её достижение
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => router.push(`/goal/${goalId}`)}
                      className="bg-gray-600 dark:bg-gray-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Сохранить изменения
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faQuoteLeft} className="text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Мотивация дня</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        Каждое утро у тебя два выбора: продолжать спать с мечтой или проснуться и начать её достигать.
                      </p>
                    </div>

                    <div className="p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faLightbulb} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Советы</span>
                      </div>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 dark:text-green-400 text-xs mt-1" />
                          <span>Формулируйте цели конкретно и измеримо</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 dark:text-green-400 text-xs mt-1" />
                          <span>Разбивайте большие цели на маленькие шаги</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 dark:text-green-400 text-xs mt-1" />
                          <span>Устанавливайте реалистичные сроки</span>
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
    </main>
  );
};

export default GoalEditPage;
