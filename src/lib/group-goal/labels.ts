import type { GroupGoal } from '@/types';

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

interface GoalLabels {
  privacy: string;
  status: string;
  startDate: string;
  endDate: string;
  created: string;
}

export const getGoalLabels = (
  goal: GroupGoal,
  t: TranslationFn,
  formatDate: (date: Date | string, locale: string) => string,
  locale: string,
): GoalLabels => {
  const privacy = goal.privacy ? t(`privacy.${goal.privacy}`) : t('privacy.public');

  const status = goal.isCompleted ? t('status.completed') : goal.isArchived ? t('status.archived') : t('status.active');

  const startDate = goal.startDate ? formatDate(goal.startDate, locale) : '—';

  const endDate = goal.endDate ? formatDate(goal.endDate, locale) : '—';

  const created = goal.createdAt
    ? t('details.createdAt', { date: formatDate(goal.createdAt, locale) })
    : goal.startDate
    ? t('details.createdAt', { date: formatDate(goal.startDate, locale) })
    : '';

  return { privacy, status, startDate, endDate, created };
};

export const findOwnerName = (
  participantViews: Array<{ roleLabel: string; name: string }>,
  ownerRoleLabel: string,
  fallbackName: string,
): string => {
  return participantViews.find((p) => p.roleLabel === ownerRoleLabel)?.name || fallbackName;
};
