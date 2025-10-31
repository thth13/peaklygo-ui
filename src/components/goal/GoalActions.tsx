'use client';

import React, { useState } from 'react';
import { useProgressBlogContext } from '@/context/ProgressBlogContext';
import { Goal } from '@/types';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { ShareGoal } from './ShareGoal';
import { ArchiveGoalModal } from './ArchiveGoalModal';
import { DeleteGoalModal } from './DeleteGoalModal';
import { archiveGoal, deleteGoal, unarchiveGoal } from '@/lib/api/goal';
import { useRouter } from 'next/navigation';

interface GoalActionsProps {
  goal: Goal;
  currentUserId?: string;
}

export const GoalActions: React.FC<GoalActionsProps> = ({ goal, currentUserId }) => {
  const { createEntry } = useProgressBlogContext();
  const t = useTranslations('goals');
  const tCommon = useTranslations('common');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      toast.error(t('blogCreateError'));
      console.error('Error creating progress entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveGoal = () => {
    setIsArchiveModalOpen(true);
  };

  const handleUnarchiveGoal = async () => {
    setIsUnarchiving(true);

    try {
      await unarchiveGoal(goal._id);
      toast.success(t('unarchivedSuccess'));
      router.refresh();
    } catch (error) {
      toast.error(t('unarchiveError'));
      console.error('Error unarchiving goal:', error);
    } finally {
      setIsUnarchiving(false);
    }
  };

  const confirmArchive = async () => {
    setIsArchiving(true);
    setIsArchiveModalOpen(false);

    try {
      await archiveGoal(goal._id);
      toast.success(t('archivedSuccess'));
      router.push('/profile/' + goal.userId);
    } catch (error) {
      toast.error(t('archiveError'));
      console.error('Error archiving goal:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteGoal = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setIsDeleteModalOpen(false);

    try {
      await deleteGoal(goal._id);
      toast.success(t('deletedSuccess'));
      router.push('/profile/' + goal.userId);
    } catch (error) {
      toast.error(t('deleteError'));
      console.error('Error deleting goal:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = currentUserId === goal.userId;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('actions')}</h3>
      <div className="space-y-3">
        {isOwner && goal.isCompleted && (
          <button
            onClick={() => router.push(`/goal/${goal._id}/certificate`)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            🏆 {t('getCertificate')}
          </button>
        )}
        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {t('writeToBlog')}
          </button>
        )}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-500 py-2 px-4 rounded-lg text-sm transition-colors"
        >
          {t('shareGoal')}
        </button>
        {isOwner && !goal.isArchived && (
          <button
            onClick={handleArchiveGoal}
            disabled={isArchiving}
            className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500 py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isArchiving ? t('archiving') : t('archiveGoal')}
          </button>
        )}
        {isOwner && goal.isArchived && (
          <button
            onClick={handleUnarchiveGoal}
            disabled={isUnarchiving}
            className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-500 py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUnarchiving ? t('unarchiving') : t('unarchiveGoal')}
          </button>
        )}
        {isOwner && (
          <button
            onClick={handleDeleteGoal}
            disabled={isDeleting}
            className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500 py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? t('deleting') : t('deleteGoal')}
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
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('newBlogEntry')}</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full min-h-[100px] border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('shareProgress')}
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
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('saving') : tCommon('save')}
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

      {isOwner && (
        <DeleteGoalModal
          isOpen={isDeleteModalOpen}
          isDeleting={isDeleting}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      <ShareGoal isShareModalOpen={isShareModalOpen} setIsShareModalOpen={setIsShareModalOpen} goal={goal} />
    </div>
  );
};
