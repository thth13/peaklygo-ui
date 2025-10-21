'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ParticipantProgress {
  id: string;
  name: string;
  avatar: string;
  isCurrentUser: boolean;
  days: { [key: number]: 'completed' | 'failed' | 'pending' };
  total: string;
}

interface ChallengeProgressTableProps {
  challengeId: string;
}

export default function ChallengeProgressTable({ challengeId }: ChallengeProgressTableProps) {
  const [participants, setParticipants] = useState<ParticipantProgress[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
      isCurrentUser: true,
      days: { 11: 'completed', 12: 'completed', 13: 'failed', 14: 'completed', 15: 'completed' },
      total: '13/15',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      isCurrentUser: false,
      days: { 11: 'completed', 12: 'completed', 13: 'completed', 14: 'completed', 15: 'failed' },
      total: '14/15',
    },
    {
      id: '3',
      name: 'Mike Chen',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      isCurrentUser: false,
      days: { 11: 'completed', 12: 'failed', 13: 'failed', 14: 'completed', 15: 'completed' },
      total: '11/15',
    },
    {
      id: '4',
      name: 'Emma Davis',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
      isCurrentUser: false,
      days: { 11: 'completed', 12: 'completed', 13: 'completed', 14: 'completed', 15: 'completed' },
      total: '15/15',
    },
    {
      id: '5',
      name: 'David Brown',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
      isCurrentUser: false,
      days: { 11: 'failed', 12: 'completed', 13: 'completed', 14: 'failed', 15: 'pending' },
      total: '10/14',
    },
  ]);

  const visibleDays = [11, 12, 13, 14, 15, 16, 17];
  const currentDay = 15;

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Таблица прогресса участников</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="px-2 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Участник</th>
              {visibleDays.map((day) => (
                <th
                  key={day}
                  className={`px-1 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 ${
                    day === currentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {day}
                </th>
              ))}
              <th className="px-1 py-3 text-center font-medium text-gray-600 dark:text-gray-400">Всего</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr
                key={participant.id}
                className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <td className="px-2 py-3">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={participant.avatar}
                      alt={participant.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span
                      className={`font-medium ${
                        participant.isCurrentUser ? 'text-primary-600 dark:text-primary-400' : 'dark:text-gray-200'
                      }`}
                    >
                      {participant.name}
                    </span>
                  </div>
                </td>
                {visibleDays.map((day) => {
                  const status = participant.days[day];
                  return (
                    <td
                      key={day}
                      className={`px-1 py-3 text-center ${day === currentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      {status === 'completed' && <i className="fa-solid fa-check text-green-500"></i>}
                      {status === 'failed' && <i className="fa-solid fa-times text-red-500"></i>}
                      {status === 'pending' && (
                        <span className="text-gray-400">
                          <i className="fa-solid fa-clock"></i>
                        </span>
                      )}
                      {!status && <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </td>
                  );
                })}
                <td className="px-1 py-3 text-center font-bold text-green-600 dark:text-green-400">
                  {participant.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <i className="fa-solid fa-check mr-1 text-green-500"></i>
            <span>Выполнено</span>
          </div>
          <div className="flex items-center">
            <i className="fa-solid fa-times mr-1 text-red-500"></i>
            <span>Не выполнено</span>
          </div>
          <div className="flex items-center">
            <i className="fa-solid fa-clock mr-1 text-gray-400"></i>
            <span>Ожидание</span>
          </div>
        </div>
        <button className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          Показать все дни
        </button>
      </div>
    </div>
  );
}
