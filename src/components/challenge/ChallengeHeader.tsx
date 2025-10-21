'use client';

import { Challenge } from '@/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface ChallengeHeaderProps {
  challenge: Challenge;
}

export default function ChallengeHeader({ challenge }: ChallengeHeaderProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="mb-6">
      <button
        onClick={() => router.back()}
        className="mb-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i>
        Назад к челленджам
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{challenge.name}</h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {challenge.category}
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
              Активный
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{challenge.participantsCount} участников</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            <i className="fa-solid fa-user-plus mr-2"></i>
            Пригласить друзей
          </button>
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
            <i className="fa-solid fa-check mr-2"></i>
            Отметить сегодня
          </button>
        </div>
      </div>
    </div>
  );
}
