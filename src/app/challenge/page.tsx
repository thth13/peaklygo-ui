import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'upcoming';
  currentDay?: number;
  totalDays: number;
  participantsCount: number;
  image?: string;
}

export const metadata: Metadata = {
  title: 'Челленджи — PeaklyGo',
  description: 'Присоединяйтесь к групповым челленджам и достигайте целей вместе с друзьями',
};

async function getChallenges(): Promise<Challenge[]> {
  // TODO: Implement API call
  return [
    {
      id: '1',
      name: '30 дней без сахара',
      description: 'Групповой вызов на 30 дней полного отказа от сахара',
      category: 'Здоровье',
      status: 'active',
      currentDay: 15,
      totalDays: 30,
      participantsCount: 12,
    },
    {
      id: '2',
      name: 'Читать каждый день',
      description: '21 день ежедневного чтения минимум 30 минут',
      category: 'Саморазвитие',
      status: 'active',
      currentDay: 8,
      totalDays: 21,
      participantsCount: 25,
    },
    {
      id: '3',
      name: 'Бег по утрам',
      description: '14 дней утренних пробежек',
      category: 'Спорт',
      status: 'upcoming',
      totalDays: 14,
      participantsCount: 8,
    },
  ];
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Челленджи</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Присоединяйтесь к групповым челленджам и достигайте целей вместе
          </p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
          <i className="fa-solid fa-plus mr-2"></i>
          Создать челлендж
        </button>
      </div>

      <div className="mb-6 flex space-x-2">
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white">Все</button>
        <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          Активные
        </button>
        <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          Мои
        </button>
        <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          Завершенные
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            href={`/challenge/${challenge.id}`}
            className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">{challenge.name}</h3>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{challenge.description}</p>
              </div>
            </div>

            <div className="mb-4 flex items-center space-x-2">
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                {challenge.category}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  challenge.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : challenge.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {challenge.status === 'active' ? 'Активный' : challenge.status === 'upcoming' ? 'Скоро' : 'Завершен'}
              </span>
            </div>

            {challenge.status === 'active' && challenge.currentDay && (
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Прогресс</span>
                  <span className="font-medium dark:text-gray-200">
                    День {challenge.currentDay}/{challenge.totalDays}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: `${(challenge.currentDay / challenge.totalDays) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <i className="fa-solid fa-users mr-2"></i>
                <span>{challenge.participantsCount} участников</span>
              </div>
              <div className="text-primary-600 dark:text-primary-400">
                {challenge.status === 'active' ? 'Участвовать' : 'Подробнее'} →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {challenges.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl text-gray-300">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">Нет доступных челленджей</h3>
          <p className="text-gray-600 dark:text-gray-400">Станьте первым, кто создаст челлендж!</p>
        </div>
      )}
    </div>
  );
}
