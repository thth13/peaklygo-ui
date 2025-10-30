'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { GOALS_PER_PAGE, IMAGE_URL } from '@/constants';
import { getMyGroupGoals } from '@/lib/api/goal';
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

const FALLBACK_GRADIENTS = [
  'from-rose-500 via-orange-400 to-amber-300',
  'from-sky-500 via-cyan-400 to-teal-300',
  'from-fuchsia-500 via-violet-400 to-purple-300',
  'from-emerald-500 via-green-400 to-lime-300',
  'from-indigo-500 via-blue-400 to-sky-300',
  'from-amber-500 via-yellow-400 to-lime-200',
  'from-pink-500 via-rose-400 to-orange-300',
  'from-slate-600 via-indigo-500 to-slate-400',
  'from-cyan-500 via-teal-400 to-blue-300',
  'from-stone-500 via-stone-400 to-stone-300',
];

const getFallbackGradient = (goal: GroupGoal, fallbackIndex: number): string => {
  const seedParts: string[] = [];

  if (goal._id) {
    seedParts.push(goal._id);
  }
  if (goal.goalName) {
    seedParts.push(goal.goalName);
  }
  if (goal.category) {
    seedParts.push(goal.category);
  }
  if (goal.createdAt) {
    seedParts.push(new Date(goal.createdAt).toISOString());
  }

  if (!seedParts.length) {
    return FALLBACK_GRADIENTS[fallbackIndex % FALLBACK_GRADIENTS.length];
  }

  const seed = seedParts.join('|');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }

  const gradientIndex = Math.abs(hash + fallbackIndex * 7) % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[gradientIndex];
};

const clampProgress = (value?: number): number => {
  return Math.max(0, Math.min(100, Math.round(value ?? 0)));
};

const tryFormatDate = (value?: Date | string): string | null => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return format(date, 'dd MMM yyyy');
};

const formatParticipantsLabel = (count: number, locale?: string): string => {
  if (locale?.startsWith('ru') || locale?.startsWith('ua')) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 < 11 || mod100 > 14) {
      if (mod10 === 1) {
        return `${count} участник`;
      }
      if (mod10 >= 2 && mod10 <= 4) {
        return `${count} участника`;
      }
    }
    return `${count} участников`;
  }

  if (locale?.startsWith('hi')) {
    return `${count} प्रतिभागी`;
  }

  return `${count} ${count === 1 ? 'participant' : 'participants'}`;
};

export const GroupGoalsList: React.FC = () => {
  const t = useTranslations('groupGoal.list');
  const locale = useLocale();
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
    const baseClasses =
      'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm';

    if (goal.isCompleted) {
      return <span className={`${baseClasses} bg-emerald-500/90`}>{t('status.completed')}</span>;
    }

    if (goal.isArchived) {
      return <span className={`${baseClasses} bg-gray-500/80`}>{t('status.archived')}</span>;
    }

    return <span className={`${baseClasses} bg-primary-500/90`}>{t('status.active')}</span>;
  };

  const renderGoalProgress = (progressValue: number) => {
    return (
      <div>
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          <span>{t('progress')}</span>
          <span className="text-gray-900 dark:text-gray-100">{progressValue}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          ></div>
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
        {goals.map((goal, index) => {
          const participantsCount = goal.participants?.length ?? 1;
          const participantsLabel = formatParticipantsLabel(participantsCount, locale);
          const gradientClass = getFallbackGradient(goal, index);
          const progressValue = clampProgress(goal.progress);
          const startDateLabel = tryFormatDate(goal.startDate);
          const endDateLabel = tryFormatDate(goal.endDate);
          const timelineLabel = [startDateLabel, endDateLabel].filter(Boolean).join(' • ');

          return (
            <Link key={goal._id} href={`/group-goals/${goal._id}`} className="group block h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/80 shadow-md backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/80">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {goal.image ? (
                    <Image
                      src={`${IMAGE_URL}/${goal.image}`}
                      alt={goal.goalName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 360px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientClass} text-white`}
                    >
                      <i className="fa-solid fa-mountain-sun text-4xl opacity-70"></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    {goal.category && (
                      <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        {goal.category}
                      </span>
                    )}
                    {renderGoalStatus(goal)}
                  </div>
                  <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <i className="fa-solid fa-users text-sm"></i>
                      {participantsLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-600 dark:text-white">
                      {goal.goalName}
                    </h3>
                    {goal.description && (
                      <p
                        className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {renderGoalProgress(progressValue)}

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {timelineLabel ? (
                      <span className="flex items-center gap-2">
                        <i className="fa-regular fa-calendar"></i>
                        {timelineLabel}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-gauge-high"></i>
                        {progressValue}% {t('progress')}
                      </span>
                    )}
                    <span className="flex items-center gap-2 text-primary-600 transition-all duration-200 group-hover:gap-3 group-hover:text-primary-500 dark:text-primary-400">
                      {t('viewGoal')}
                      <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
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
