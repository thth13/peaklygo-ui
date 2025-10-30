'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getMyGroupGoals } from '@/lib/api/goal';
import { GOALS_PER_PAGE } from '@/constants';
import type { GroupGoal, PaginatedGroupGoalsResponse } from '@/types';

interface PaginationState {
  page: number;
  hasNextPage: boolean;
  total: number;
}

const isPaginatedGoalsResponse = (
  data: GroupGoal[] | PaginatedGroupGoalsResponse,
): data is PaginatedGroupGoalsResponse => {
  return data && typeof data === 'object' && 'goals' in data;
};

export const GroupGoalsList: React.FC = () => {
  const t = useTranslations('groupGoal.list');
  const [goals, setGoals] = useState<GroupGoal[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    hasNextPage: false,
    total: 0,
  });
  const isMountedRef = useRef(false);

  useEffect(() => {
    // React Strict Mode runs effects twice, so set the flag inside the effect
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateStateSafely = useCallback((updater: () => void) => {
    if (!isMountedRef.current) {
      return;
    }
    updater();
  }, []);

  const fetchGoals = useCallback(
    async (pageToLoad: number, append = false) => {
      updateStateSafely(() => {
        setError(null);
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsInitialLoading(true);
        }
      });

      try {
        const response = await getMyGroupGoals({
          page: pageToLoad,
          limit: GOALS_PER_PAGE,
        });

        updateStateSafely(() => {
          if (isPaginatedGoalsResponse(response)) {
            setGoals((prev) => (append ? [...prev, ...response.goals] : response.goals));
            setPagination({
              page: response.page,
              hasNextPage: response.hasNextPage,
              total: response.total,
            });
          } else {
            setGoals((prev) => (append ? [...prev, ...response] : response));
            setPagination({
              page: pageToLoad,
              hasNextPage: false,
              total: response.length,
            });
          }
        });
      } catch (err) {
        console.error('Failed to load group goals', err);
        updateStateSafely(() => {
          setError(t('error'));
        });
      } finally {
        updateStateSafely(() => {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsInitialLoading(false);
          }
        });
      }
    },
    [updateStateSafely],
  );

  useEffect(() => {
    fetchGoals(1).catch((err) => console.error('Initial group goals load failed', err));
  }, [fetchGoals]);

  const handleRetry = () => {
    fetchGoals(1).catch((err) => console.error('Retry group goals load failed', err));
  };

  const handleLoadMore = () => {
    fetchGoals(pagination.page + 1, true).catch((err) => console.error('Load more group goals failed', err));
  };

  const renderGoalStatus = (goal: GroupGoal) => {
    if (goal.isCompleted) {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
          {t('status.completed')}
        </span>
      );
    }
    if (goal.isArchived) {
      return (
        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {t('status.archived')}
        </span>
      );
    }
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        {t('status.active')}
      </span>
    );
  };

  const renderGoalProgress = (goal: GroupGoal) => {
    const progressValue = Math.max(0, Math.min(100, Math.round(goal.progress ?? 0)));
    return (
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('progress')}</span>
          <span className="font-medium dark:text-gray-200">{progressValue}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-2 rounded-full bg-primary-500" style={{ width: `${progressValue}%` }}></div>
        </div>
      </div>
    );
  };

  if (isInitialLoading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-gray-600 dark:text-gray-300">{t('loading')}</span>
      </div>
    );
  }

  if (error && goals.length === 0) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/30">
        <p className="mb-4 text-red-600 dark:text-red-300">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl text-gray-300">
          <i className="fa-solid fa-people-group"></i>
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">{t('empty')}</h3>
        <p className="text-gray-600 dark:text-gray-400">{t('emptyDescription')}</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Link
            key={goal._id}
            href={`/group-goals/${goal._id}`}
            className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">{goal.goalName}</h3>
                {goal.description && (
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{goal.description}</p>
                )}
              </div>
              <div>{renderGoalStatus(goal)}</div>
            </div>

            {renderGoalProgress(goal)}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <i className="fa-solid fa-users mr-2"></i>
                <span>
                  {goal.participants?.length ?? 1} {t('participants')}
                </span>
              </div>
              <div className="text-primary-600 dark:text-primary-400">{t('viewGoal')}</div>
            </div>
          </Link>
        ))}
      </div>

      {pagination.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-400"
          >
            {isLoadingMore ? t('loadingMore') : t('loadMore')}
          </button>
        </div>
      )}
    </>
  );
};
