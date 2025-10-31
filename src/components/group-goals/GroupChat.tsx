'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { ProgressEntry } from '@/types';
import { getGroupProgressEntries, createGroupProgressEntry } from '@/lib/api/group-progress';
import { formatTimeAgo } from '@/lib/utils';
import { IMAGE_URL } from '@/constants';
import { useTranslations } from 'next-intl';
import { useUserProfile } from '@/context/UserProfileContext';

interface GroupChatProps {
  goalId: string;
}

export function GroupChat({ goalId }: GroupChatProps) {
  const [messages, setMessages] = useState<ProgressEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const t = useTranslations('timeAgo');
  const { profile } = useUserProfile();

  const title = 'Чат участников';
  const subtitle = 'Обсуждайте прогресс, делитесь советами и поддерживайте друг друга.';
  const emptyText = 'Пока нет сообщений. Напишите первым!';
  const inputPlaceholder = 'Написать сообщение...';

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const entries = await getGroupProgressEntries(goalId, 1, 20);
        // Сортируем по дате создания (старые сверху, новые внизу)
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setMessages(sortedEntries);
      } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [goalId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const newEntry = await createGroupProgressEntry(goalId, inputText);

      // Добавляем профиль пользователя к новому сообщению
      const entryWithProfile: ProgressEntry = {
        ...newEntry,
        profile: profile
          ? {
              _id: profile._id,
              name: profile.name,
              avatar: profile.avatar,
              user: typeof profile.user === 'string' ? profile.user : profile.user._id,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, entryWithProfile]);
      setInputText('');

      // Прокрутка вниз после отправки
      setTimeout(() => {
        const chatContainer = document.getElementById('group-chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>

      <div id="group-chat-messages" className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
            Загрузка сообщений...
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
            {emptyText}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="flex items-start gap-3">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 flex-shrink-0">
                {message.profile?.avatar ? (
                  <Image
                    src={`${IMAGE_URL}/${message.profile.avatar}`}
                    alt={message.profile.name || 'User avatar'}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600">
                    {message.profile?.name?.slice(0, 1).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {message.profile?.name || 'Аноним'}
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 break-words">{message.content}</div>
                <div className="mt-2 text-xs text-gray-400">{formatTimeAgo(message.createdAt, t)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder={inputPlaceholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!inputText.trim() || sending}
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </article>
  );
}
