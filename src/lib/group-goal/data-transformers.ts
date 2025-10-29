import type { CheckIn, CheckInStatus, GroupGoalStats } from '@/types';
import type { EnhancedParticipant, ParticipantView } from './participant-utils';
import {
  extractParticipantId,
  extractParticipantName,
  extractParticipantAvatar,
  getRoleLabel,
  getStatusLabel,
  getJoinedLabel,
  calculateCompletionRate,
} from './participant-utils';
import { formatDateKey } from './checkin-utils';
import { formatDate, formatDateWithTime } from '@/lib/utils';
import { IMAGE_URL } from '@/constants';

interface TransformParticipantsParams {
  participants: EnhancedParticipant[];
  displayedDates: string[];
  todayKey: string;
  checkInByDate: Map<string, Map<string, CheckInStatus>>;
  t: (key: string, params?: Record<string, unknown>) => string;
  locale: string;
}

export const transformParticipantsToViews = ({
  participants,
  displayedDates,
  todayKey,
  checkInByDate,
  t,
  locale,
}: TransformParticipantsParams): ParticipantView[] => {
  return participants.map((participant, index) => {
    const participantId = extractParticipantId(participant, index);
    const statusesByDate = displayedDates.map((dateKey) => checkInByDate.get(dateKey)?.get(participantId) ?? null);
    const todaysStatus = checkInByDate.get(todayKey)?.get(participantId) ?? null;

    return {
      id: participantId,
      name: extractParticipantName(participant, t, index),
      avatarUrl: extractParticipantAvatar(participant, IMAGE_URL),
      roleLabel: getRoleLabel(participant, t),
      statusLabel: getStatusLabel(participant, t),
      joinedLabel: getJoinedLabel(participant, t, formatDate, locale),
      completionRate: calculateCompletionRate(statusesByDate),
      todaysStatus,
      statusesByDate,
    };
  });
};

interface TransformTopContributorsParams {
  stats: GroupGoalStats | null;
  participantViews: ParticipantView[];
  t: (key: string, params?: Record<string, unknown>) => string;
}

export const transformTopContributors = ({ stats, participantViews, t }: TransformTopContributorsParams) => {
  return (stats?.topContributors ?? []).map((entry, index) => {
    const contributorId =
      typeof entry.userId === 'string'
        ? entry.userId
        : entry.userId && typeof entry.userId === 'object' && '_id' in entry.userId
        ? entry.userId._id
        : `contributor-${index}`;

    const participantView = participantViews.find((view) => view.id === contributorId);

    return {
      id: contributorId,
      name: participantView?.name ?? t('participants.anonymous'),
      avatarUrl: participantView?.avatarUrl ?? null,
      contributionScore: entry.contributionScore ?? 0,
    };
  });
};

interface TransformActivityFeedParams {
  allCheckIns: CheckIn[];
  participantViews: ParticipantView[];
  t: (key: string, params?: Record<string, unknown>) => string;
  locale: string;
  limit?: number;
}

export const transformActivityFeed = ({
  allCheckIns,
  participantViews,
  t,
  locale,
  limit = 5,
}: TransformActivityFeedParams) => {
  const getStatusText = (status: CheckInStatus): string => {
    const statusMap: Record<CheckInStatus, string> = {
      completed: 'отметился',
      missed: 'пропустил отметку',
      pending: 'ожидает подтверждение',
    };
    return statusMap[status] ?? 'отметился';
  };

  return allCheckIns
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((checkIn) => {
      const participantView = participantViews.find((view) => view.id === checkIn.userId);
      const name = participantView?.name ?? t('participants.anonymous');
      const statusText = getStatusText(checkIn.status);

      return {
        id: `${checkIn.userId}-${formatDateKey(checkIn.date)}`,
        text: `${name} ${statusText}`,
        date: formatDateWithTime(checkIn.date, locale),
      };
    });
};
