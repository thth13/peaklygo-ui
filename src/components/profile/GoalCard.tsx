'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStopPropagation } from '@/hooks/useStopPropagation';
import { faCalendar as faCalendarRegular, faEllipsisVertical, faCoins } from '@fortawesome/free-solid-svg-icons';
import { Goal } from '@/types';
import { formatDate } from '@/lib/utils';
import { IMAGE_URL } from '@/constants';
import Link from '@/components/Link';
import { archiveGoal } from '@/lib/api/goal';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

interface GoalCardProps {
  goal: Goal;
  onGoalArchived?: (goalId: string) => void;
  isArchived?: boolean;
}

export const GoalCard = ({ goal, onGoalArchived, isArchived = false }: GoalCardProps) => {
  const t = useTranslations('goals');
  const locale = useLocale();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const { stopPropagation } = useStopPropagation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleEdit = stopPropagation(() => {
    setIsMenuOpen(false);

    router.push(`/goal/${goal._id}/edit`);
  });

  const handleArchive = stopPropagation(async () => {
    setIsMenuOpen(false);
    setIsArchiving(true);

    try {
      await archiveGoal(goal._id);
      toast.success(t('archivedSuccess'));

      // Удаляем цель из списка если есть callback
      if (onGoalArchived) {
        onGoalArchived(goal._id);
      } else {
        // Откат к старому поведению
        router.refresh();
      }
    } catch (error) {
      toast.error(t('archiveError'));
      console.error('Error archiving goal:', error);
    } finally {
      setIsArchiving(false);
    }
  });

  return (
    <Link
      href={`/goal/${goal._id}`}
      className="group block overflow-hidden rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer mb-4"
    >
      {/* Image banner (only if image exists) */}
      {goal.image && (
        <div className="relative w-full h-48 md:h-56 lg:h-64 bg-gray-100 dark:bg-gray-700">
          <Image
            src={`${IMAGE_URL}/${goal.image}`}
            alt="goal image"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 ring-1 ring-black/5 dark:ring-white/10" />
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-sm ${
                goal.isCompleted
                  ? 'bg-green-100/90 dark:bg-green-900/70 text-green-700 dark:text-green-300'
                  : 'bg-primary-100/90 dark:bg-primary-900/70 text-primary-700 dark:text-primary-300'
              }`}
            >
              {goal.isCompleted ? t('achieved') : t('inProgress')}
            </span>
          </div>
          {/* Menu button */}
          {!isArchived && (
            <div className="absolute top-2 right-2">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={stopPropagation(() => setIsMenuOpen(!isMenuOpen))}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 p-2 rounded-full focus:outline-none shadow-sm"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} className="w-3" />
                </button>
                {isMenuOpen && (
                  <div
                    className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20"
                    onClick={stopPropagation()}
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={handleArchive}
                      disabled={isArchiving}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
                    >
                      {t('archiveGoal')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="mb-2">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 leading-snug flex-1">
              {goal.goalName}
            </h3>
            {!goal.image && (
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-sm ${
                    goal.isCompleted
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  }`}
                >
                  {goal.isCompleted ? t('achieved') : t('inProgress')}
                </span>
                {!isArchived && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={stopPropagation(() => setIsMenuOpen(!isMenuOpen))}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded focus:outline-none"
                      aria-haspopup="menu"
                      aria-expanded={isMenuOpen}
                    >
                      <FontAwesomeIcon icon={faEllipsisVertical} className="w-3" />
                    </button>
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-8 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20"
                        onClick={stopPropagation()}
                      >
                        <button
                          onClick={handleEdit}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={handleArchive}
                          disabled={isArchiving}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
                        >
                          {t('archiveGoal')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('created')} {formatDate(goal.startDate, locale)}
          </p>
        </div>

        {goal.description && <p className="text-gray-600 dark:text-gray-300 mb-4">{goal.description}</p>}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('progress')}</span>
            <span
              className={`text-sm font-medium ${
                goal.progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {goal.progress === 100 ? t('completed') + '!' : `${goal.progress}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
            <div
              className={`h-2 rounded-full ${
                goal.progress === 100 ? 'bg-green-500 dark:bg-green-400' : 'bg-primary-500 dark:bg-primary-400'
              }`}
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          {goal.endDate && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCalendarRegular} className="w-4 mr-2" />
              <span>
                {t('deadline')}: {formatDate(goal.endDate, locale)}
              </span>
            </div>
          )}

          <div className="flex items-center">
            <FontAwesomeIcon icon={faCoins} className="w-4 mr-2" />
            <span>
              {t('value')}: {goal.value} {t('points')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
