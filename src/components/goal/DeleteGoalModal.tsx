'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface DeleteGoalModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * DeleteGoalModal renders a confirmation dialog before removing a goal permanently.
 */
export const DeleteGoalModal: React.FC<DeleteGoalModalProps> = ({ isOpen, isDeleting, onClose, onConfirm }) => {
  const t = useTranslations('goals');
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
          disabled={isDeleting}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('deleteTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('deleteConfirm')}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-60"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t('deleting') : t('deleteGoal')}
          </button>
        </div>
      </div>
    </div>
  );
};
