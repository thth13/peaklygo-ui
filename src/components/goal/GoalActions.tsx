'use client';

import React, { useState } from 'react';
import { useProgressBlogContext } from '@/context/ProgressBlogContext';
import { Goal } from '@/types';
import toast from 'react-hot-toast';
import { ShareGoal } from './ShareGoal';
import { ArchiveGoalModal } from './ArchiveGoalModal';
import { archiveGoal } from '@/lib/api/goal';
import { useRouter } from 'next/navigation';

interface GoalActionsProps {
  goal: Goal;
  currentUserId?: string;
}

export const GoalActions: React.FC<GoalActionsProps> = ({ goal, currentUserId }) => {
  const { createEntry } = useProgressBlogContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [newEntry, setNewEntry] = useState({ content: '' });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createEntry(newEntry.content);
      setNewEntry({ content: '' });
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Ошибка создания записи');
      console.error('Error creating progress entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveGoal = () => {
    setIsArchiveModalOpen(true);
  };

  const confirmArchive = async () => {
    setIsArchiving(true);
    setIsArchiveModalOpen(false);

    try {
      await archiveGoal(goal._id);
      toast.success('Цель успешно архивирована');
      router.push('/profile/' + goal.userId);
    } catch (error) {
      toast.error('Ошибка архивирования цели');
      console.error('Error archiving goal:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  const isOwner = currentUserId === goal.userId;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Действия</h3>
      <div className="space-y-3">
        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Записать в блог
          </button>
        )}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-500 py-2 px-4 rounded-lg text-sm transition-colors"
        >
          Поделиться целью
        </button>
        {isOwner && (
          <button
            onClick={handleArchiveGoal}
            disabled={isArchiving}
            className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500 py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isArchiving ? 'Архивируем...' : 'Архивировать цель'}
          </button>
        )}
      </div>

      {/* Modal */}
      {isOwner && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Новая запись в блог</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full min-h-[100px] border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Поделитесь своим прогрессом..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ content: e.target.value })}
                disabled={isSubmitting}
                maxLength={1000}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOwner && (
        <ArchiveGoalModal
          isOpen={isArchiveModalOpen}
          isArchiving={isArchiving}
          onClose={() => setIsArchiveModalOpen(false)}
          onConfirm={confirmArchive}
        />
      )}

      <ShareGoal isShareModalOpen={isShareModalOpen} setIsShareModalOpen={setIsShareModalOpen} goal={goal} />
    </div>
  );
};
