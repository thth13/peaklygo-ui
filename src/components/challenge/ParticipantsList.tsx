'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChallengeParticipant } from '@/types';

interface ParticipantsListProps {
  challengeId: string;
}

export default function ParticipantsList({ challengeId }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([
    {
      id: '1',
      name: 'Emma Davis',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
      completedDays: 15,
      totalDays: 15,
      successRate: 100,
      currentStreak: 15,
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      completedDays: 14,
      totalDays: 15,
      successRate: 93,
      currentStreak: 4,
    },
    {
      id: '3',
      name: 'Alex Johnson',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
      completedDays: 13,
      totalDays: 15,
      successRate: 87,
      currentStreak: 2,
      isCurrentUser: true,
    },
    {
      id: '4',
      name: 'Mike Chen',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      completedDays: 11,
      totalDays: 15,
      successRate: 73,
      currentStreak: 1,
    },
  ]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Участники</h3>

      <div className="space-y-3">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className={`flex items-center justify-between rounded-lg p-3 ${
              participant.isCurrentUser
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src={participant.avatar}
                  alt={participant.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <div>
                <div
                  className={`font-medium ${
                    participant.isCurrentUser ? 'text-primary-600 dark:text-primary-400' : 'dark:text-gray-200'
                  }`}
                >
                  {participant.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {participant.completedDays}/{participant.totalDays} дней • {participant.successRate}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-orange-600 dark:text-orange-400">
                <i className="fa-solid fa-fire mr-1"></i>
                <span className="text-sm font-bold">{participant.currentStreak}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
