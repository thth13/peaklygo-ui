'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
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
  faGripVertical,
  faTrash,
  faCloudArrowUp,
  faQuoteLeft,
  faLightbulb,
  faCheck,
  faBell as faBellRegular,
} from '@fortawesome/free-solid-svg-icons';

interface Subgoal {
  id: string;
  text: string;
}

interface GoalFormData {
  name: string;
  description: string;
  category: string;
  customCategory: string;
  subgoals: Subgoal[];
  startDate: string;
  endDate: string;
  noDeadline: boolean;
  privacy: 'private' | 'friends' | 'public';
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
  { id: 'custom', name: 'Своя категория', icon: faPlus, color: 'text-gray-500' },
  { id: 'sport', name: 'Спорт', icon: faTrophy, color: 'text-orange-500' },
];

const GoalCreationPage: React.FC = () => {
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    description: '',
    category: '',
    customCategory: '',
    subgoals: [
      { id: '1', text: 'Купить беговые кроссовки' },
      { id: '2', text: 'Составить план тренировок' },
    ],
    startDate: '',
    endDate: '',
    noDeadline: false,
    privacy: 'public',
    reward: '',
    consequence: '',
    value: 100,
    image: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof GoalFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubgoalChange = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      subgoals: prev.subgoals.map((subgoal) => (subgoal.id === id ? { ...subgoal, text } : subgoal)),
    }));
  };

  const addSubgoal = () => {
    const newId = Date.now().toString();
    setFormData((prev) => ({
      ...prev,
      subgoals: [...prev.subgoals, { id: newId, text: '' }],
    }));
  };

  const removeSubgoal = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subgoals: prev.subgoals.filter((subgoal) => subgoal.id !== id),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('image', file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted:', formData);
    // Здесь будет логика отправки данных
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FontAwesomeIcon icon={faBullseye} className="text-blue-600 text-2xl mr-2" />
                <span className="text-xl font-semibold text-gray-900">Goal Accomplishment</span>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-6">
                <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
                  Goal Placement
                </span>
                <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
                  Progress Blog
                </span>
                <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
                  Word Value
                </span>
                <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
                  Challenges
                </span>
                <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
                  Group Goals
                </span>
              </nav>
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500">
                <FontAwesomeIcon icon={faBellRegular} className="text-lg" />
              </button>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  {/* <Image
                    className="h-8 w-8 rounded-full"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                    alt="User avatar"
                    width={32}
                    height={32}
                  /> */}
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">Анна К.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Создание новой цели</h1>
            <p className="mt-2 text-gray-600">Создайте цель, которая будет мотивировать вас к достижению результата</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Goal Name */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Название цели
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Например, Пробежать полумарафон"
                    type="text"
                    maxLength={80}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>Сформулируйте конкретную и измеримую цель</span>
                    <span>{formData.name.length}/80</span>
                  </div>
                </div>

                {/* Goal Description */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">Описание цели</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                    placeholder="Я давно мечтаю стать выносливее и проверить себя..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Опишите, почему эта цель важна для вас и что она даст
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">Категория</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg hover:bg-gray-50 transition-all min-h-[90px] group ${
                          formData.category === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleInputChange('category', category.id)}
                      >
                        <FontAwesomeIcon
                          icon={category.icon}
                          className={`${category.color} text-2xl mb-2 group-hover:scale-110 transition-transform`}
                        />
                        <span className="text-sm text-gray-700 font-medium text-center">{category.name}</span>
                      </button>
                    ))}
                  </div>
                  {formData.category === 'custom' && (
                    <div className="mt-3">
                      <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите свою категорию"
                        type="text"
                        value={formData.customCategory}
                        onChange={(e) => handleInputChange('customCategory', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Subgoals */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">Подцели и шаги</label>
                  <div className="space-y-3">
                    {formData.subgoals.map((subgoal) => (
                      <div key={subgoal.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 cursor-move" />
                        <input
                          className="flex-1 border-none outline-none"
                          placeholder="Введите шаг..."
                          value={subgoal.text}
                          onChange={(e) => handleSubgoalChange(subgoal.id, e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeSubgoal(subgoal.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    onClick={addSubgoal}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Добавить шаг
                  </button>
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">Временные рамки</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Дата начала</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        disabled={formData.noDeadline}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Дата завершения</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        disabled={formData.noDeadline}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={formData.noDeadline}
                        onChange={(e) => handleInputChange('noDeadline', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-600">Без конкретного дедлайна</span>
                    </label>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">Уровень приватности</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="privacy"
                        value="private"
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={formData.privacy === 'private'}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLock} className="text-gray-600" />
                          <span className="font-medium text-gray-900">Приватная</span>
                        </div>
                        <p className="text-sm text-gray-500">Только вы видите эту цель</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="privacy"
                        value="friends"
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={formData.privacy === 'friends'}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUserGroup} className="text-blue-600" />
                          <span className="font-medium text-gray-900">Для друзей</span>
                        </div>
                        <p className="text-sm text-gray-500">Только ваши друзья могут видеть</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="privacy"
                        value="public"
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={formData.privacy === 'public'}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faGlobe} className="text-green-600" />
                          <span className="font-medium text-gray-900">Публичная</span>
                        </div>
                        <p className="text-sm text-gray-500">Все пользователи могут видеть и поддерживать</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Goal Value */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">Ценность цели</label>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Награда за достижение</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Например: Новые кроссовки"
                          type="text"
                          value={formData.reward}
                          onChange={(e) => handleInputChange('reward', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Последствия невыполнения</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Например: Пожертвование на благотворительность"
                          type="text"
                          value={formData.consequence}
                          onChange={(e) => handleInputChange('consequence', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Ценность цели (в баллах)</label>
                      <div className="px-3">
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={formData.value}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          onChange={(e) => handleInputChange('value', parseInt(e.target.value))}
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>0</span>
                          <span className="font-medium text-blue-600">{formData.value}</span>
                          <span>500</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Чем выше ценность, тем больше мотивации для достижения цели
                      </p>
                    </div>
                  </div>
                </div>

                {/* Goal Image */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">Фото цели</label>
                  <div
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-1 text-center">
                      <FontAwesomeIcon icon={faCloudArrowUp} className="mx-auto text-gray-400 text-4xl" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          Загрузить фото
                        </span>
                        <p className="pl-1">или перетащите сюда</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF до 10MB</p>
                      {formData.image && <p className="text-sm text-green-600 font-medium">{formData.image.name}</p>}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Создать цель
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faQuoteLeft} className="text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">Мотивация дня</span>
                    </div>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      Каждое утро у тебя два выбора: продолжать спать с мечтой или проснуться и начать её достигать.
                    </p>
                  </div>

                  <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faLightbulb} className="text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Советы</span>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs mt-1" />
                        <span>Формулируйте цели конкретно и измеримо</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs mt-1" />
                        <span>Разбивайте большие цели на маленькие шаги</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs mt-1" />
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
  );
};

export default GoalCreationPage;
