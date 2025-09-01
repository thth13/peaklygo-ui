'use client';

import React from 'react';

interface ArchiveGoalModalProps {
  isOpen: boolean;
  isArchiving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ArchiveGoalModal: React.FC<ArchiveGoalModalProps> = ({ isOpen, isArchiving, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
          disabled={isArchiving}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Архивирование цели</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Вы уверены, что хотите архивировать эту цель? Архивированная цель будет скрыта из основного списка.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-60"
            onClick={onClose}
            disabled={isArchiving}
          >
            Отмена
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={isArchiving}
          >
            {isArchiving ? 'Архивируем...' : 'Архивировать'}
          </button>
        </div>
      </div>
    </div>
  );
};
