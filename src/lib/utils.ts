import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export function formatDate(date: Date | string, locale: string = 'ua'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return format(d, 'd MMMM yyyy', { locale: locale === 'en' ? undefined : uk });
}

export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const formatTimeAgo = (date: Date, t: (key: string, values?: any) => string): string => {
  const now = new Date();
  const entryDate = new Date(date);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDayStart = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

  const diffInDays = Math.floor((todayStart.getTime() - entryDayStart.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return t('today');
  if (diffInDays === 1) return t('yesterday');
  if (diffInDays < 7) return t('daysAgo', { days: diffInDays });
  if (diffInDays < 14) return t('oneWeekAgo');
  const weeks = Math.floor(diffInDays / 7);
  return t('weeksAgo', { weeks });
};

export const getDayColor = (day: number): string => {
  if (day >= 60) return 'bg-blue-500 text-white';
  if (day >= 40) return 'bg-gray-500 text-white';
  return 'bg-green-500 text-white';
};
