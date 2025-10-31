import { isSameDay, subDays } from 'date-fns';
import type { CheckIn, CheckInStatus } from '@/types';

export const formatDateKey = (date: Date | string): string => {
  const normalized = typeof date === 'string' ? new Date(date) : date;
  return normalized.toISOString().split('T')[0];
};

export const buildCheckInMap = (checkIns: CheckIn[]) => {
  const checkInByDate = new Map<string, Map<string, CheckInStatus>>();

  for (const checkIn of checkIns) {
    const dateKey = formatDateKey(checkIn.date);
    const mapForDate = checkInByDate.get(dateKey) ?? new Map<string, CheckInStatus>();
    mapForDate.set(checkIn.userId, checkIn.status);
    checkInByDate.set(dateKey, mapForDate);
  }

  return checkInByDate;
};

export const getDisplayDates = (checkIns: CheckIn[], today: Date, count = 7): string[] => {
  return Array.from({ length: count }, (_, index) => formatDateKey(subDays(today, count - 1 - index)));
};

export const getTodayCheckIns = (checkIns: CheckIn[], today: Date) => {
  return checkIns.filter((checkIn) => isSameDay(new Date(checkIn.date), today));
};

export const calculateTodayCompletion = (todayCheckIns: CheckIn[], totalParticipants: number) => {
  const completed = todayCheckIns.filter((checkIn) => checkIn.status === 'completed').length;
  // Используем общее количество участников, а не количество чекинов
  const total = totalParticipants || 1;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
};

export const getUserTodayStatus = (todayCheckIns: CheckIn[], userId: string | undefined): CheckInStatus | null => {
  if (!userId) return null;

  return todayCheckIns.find((checkIn) => checkIn.userId === userId)?.status ?? null;
};
