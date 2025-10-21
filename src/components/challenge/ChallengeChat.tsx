'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChallengeMessage } from '@/types';

interface ChallengeChatProps {
  challengeId: string;
}

export default function ChallengeChat({ challengeId }: ChallengeChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChallengeMessage[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Sarah Wilson',
      userAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      message: 'Сегодня было сложно, но справилась! Кто-то еще борется с тягой к сладкому?',
      createdAt: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '2',
      userId: '2',
      userName: 'Emma Davis',
      userAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
      message: '@Sarah Да! Помогает пить больше воды и есть фрукты 🍎',
      createdAt: new Date(Date.now() - 10 * 60000),
    },
    {
      id: '3',
      userId: '3',
      userName: 'Mike Chen',
      userAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      message: 'Вчера сорвался 😔 Но сегодня новый день! Не сдаемся!',
      createdAt: new Date(Date.now() - 5 * 60000),
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement send message API call
      setMessage('');
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} минут назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} часов назад`;
    return `${Math.floor(hours / 24)} дней назад`;
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Чат участников</h3>

      <div className="mb-4 max-h-64 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            <Image src={msg.userAvatar} alt={msg.userName} width={32} height={32} className="rounded-full" />
            <div className="flex-1">
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                <div className="mb-1 text-sm font-medium text-gray-800 dark:text-white">{msg.userName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{msg.message}</div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(msg.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Написать сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={handleSendMessage}
          className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}
