'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface RatingLevel {
  nameKey: string;
  min: number;
  barClass: string;
  textClass: string;
}

interface RatingInfo {
  level: RatingLevel;
  currentMin: number;
  nextMin: number | null;
  progressPercent: number;
}

interface RatingSummaryProps {
  rating: number;
}

const RATING_LEVELS: readonly RatingLevel[] = [
  {
    nameKey: 'novice',
    min: 0,
    barClass: 'bg-gray-400 dark:bg-gray-500',
    textClass: 'text-gray-600 dark:text-gray-300',
  },
  {
    nameKey: 'bronze',
    min: 500,
    barClass: 'bg-amber-500 dark:bg-amber-400',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    nameKey: 'silver',
    min: 1000,
    barClass: 'bg-slate-400 dark:bg-slate-300',
    textClass: 'text-slate-600 dark:text-slate-300',
  },
  {
    nameKey: 'gold',
    min: 1500,
    barClass: 'bg-yellow-500 dark:bg-yellow-400',
    textClass: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    nameKey: 'platinum',
    min: 2500,
    barClass: 'bg-emerald-500 dark:bg-emerald-400',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    nameKey: 'diamond',
    min: 4000,
    barClass: 'bg-cyan-500 dark:bg-cyan-400',
    textClass: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    nameKey: 'master',
    min: 6000,
    barClass: 'bg-violet-500 dark:bg-violet-400',
    textClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    nameKey: 'legend',
    min: 8000,
    barClass: 'bg-fuchsia-600 dark:bg-fuchsia-500',
    textClass: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
] as const;

function getRatingInfo(rating: number): RatingInfo {
  const sortedLevels: readonly RatingLevel[] = [...RATING_LEVELS].sort((a, b) => a.min - b.min);
  let currentIndex: number = 0;

  for (let i: number = 0; i < sortedLevels.length; i += 1) {
    if (rating >= sortedLevels[i].min) {
      currentIndex = i;
    } else {
      break;
    }
  }

  const level: RatingLevel = sortedLevels[currentIndex];
  const nextLevel = sortedLevels[currentIndex + 1];
  const currentMin: number = level.min;
  const nextMin: number | null = nextLevel ? nextLevel.min : null;
  const progressPercent: number =
    nextMin === null ? 100 : Math.max(0, Math.min(100, ((rating - currentMin) / (nextMin - currentMin)) * 100));

  return { level, currentMin, nextMin, progressPercent };
}

export const RatingSummary = ({ rating }: RatingSummaryProps) => {
  const [displayRating, setDisplayRating] = useState<number>(rating);
  const [ratingInfo, setRatingInfo] = useState<RatingInfo>(() => getRatingInfo(rating));
  const animationFrame = useRef<number | null>(null);
  const t = useTranslations('rating');

  useEffect(() => {
    const start = performance.now();
    const duration = 500;
    const initialRating = displayRating;
    const delta = rating - initialRating;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentRating = Math.round(initialRating + delta * easedProgress);
      setDisplayRating(currentRating);
      setRatingInfo(getRatingInfo(currentRating));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [rating, displayRating]);

  useEffect(() => {
    const handleUserUpdate = (event: Event) => {
      const { detail } = event as CustomEvent<{ rating?: number }>;
      if (typeof detail.rating !== 'number') {
        return;
      }
      setDisplayRating(detail.rating);
      setRatingInfo(getRatingInfo(detail.rating));
    };

    window.addEventListener('user:update', handleUserUpdate);

    return () => {
      window.removeEventListener('user:update', handleUserUpdate);
    };
  }, []);

  const ratingLabel = useMemo(() => `${displayRating}`, [displayRating]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600 dark:text-gray-300 font-medium">{t('title')}</span>
        <div className="flex items-center space-x-2">
          <span className={`${ratingInfo.level.textClass} font-bold text-xl transition-all`}>{ratingLabel}</span>
          <span className={`${ratingInfo.level.textClass} text-xs px-2 py-0.5 rounded-full border border-current`}>
            {t(`levels.${ratingInfo.level.nameKey}`)}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
        <div
          className={`${ratingInfo.level.barClass} h-2 rounded-full transition-all`}
          style={{ width: `${ratingInfo.progressPercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{ratingInfo.currentMin}</span>
        <span>{ratingInfo.nextMin === null ? 'MAX' : ratingInfo.nextMin}</span>
      </div>
    </div>
  );
};
