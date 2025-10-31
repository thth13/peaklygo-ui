import type { GoalParticipant, CheckInStatus } from '@/types';

interface ParticipantProfile {
  name?: string;
  avatar?: string;
  user?: string;
  username?: string;
}

export interface EnhancedParticipant extends GoalParticipant {
  profile?: ParticipantProfile;
}

export interface ParticipantView {
  id: string;
  name: string;
  avatarUrl: string | null;
  roleLabel: string;
  statusLabel: string;
  joinedLabel: string;
  completionRate: number | null;
  todaysStatus: CheckInStatus | null;
  statusesByDate: (CheckInStatus | null)[];
}

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

export const extractParticipantId = (participant: GoalParticipant, fallbackIndex: number): string => {
  if (typeof participant.userId === 'string' && participant.userId) {
    return participant.userId;
  }
  if (participant.userId && typeof participant.userId === 'object' && '_id' in participant.userId) {
    return participant.userId._id;
  }
  return `participant-${fallbackIndex}`;
};

export const extractParticipantName = (participant: EnhancedParticipant, t: TranslationFn, index: number): string => {
  const { profile, userId } = participant;

  if (profile?.name) return profile.name;
  if (profile?.username) return profile.username;
  if (typeof userId === 'object' && userId?.username) return userId.username;
  if (profile?.user) return profile.user;

  return t('participants.fallbackName', { suffix: index + 1 });
};

export const extractParticipantAvatar = (participant: EnhancedParticipant, imageUrl: string): string | null => {
  const avatar = participant.profile?.avatar;
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `${imageUrl}/${avatar}`;
};

export const getRoleLabel = (participant: GoalParticipant, t: TranslationFn): string => {
  const role = typeof participant.role === 'string' ? participant.role.toLowerCase() : '';

  const roleMap: Record<string, string> = {
    owner: t('participants.roles.owner'),
    admin: t('participants.roles.admin'),
  };

  return roleMap[role] ?? t('participants.roles.member');
};

export const getStatusLabel = (participant: GoalParticipant, t: TranslationFn): string => {
  const status = typeof participant.invitationStatus === 'string' ? participant.invitationStatus.toLowerCase() : '';

  const statusMap: Record<string, string> = {
    accepted: t('participants.status.accepted'),
    pending: t('participants.status.pending'),
    declined: t('participants.status.declined'),
  };

  return statusMap[status] ?? t('participants.status.other');
};

export const getJoinedLabel = (
  participant: GoalParticipant,
  t: TranslationFn,
  formatDate: (date: Date | string, locale: string) => string,
  locale: string,
): string => {
  if (!participant.joinedAt) {
    return t('participants.noDate');
  }
  return t('participants.joinedAt', { date: formatDate(participant.joinedAt, locale) });
};

export const calculateCompletionRate = (statusesByDate: (CheckInStatus | null)[]): number | null => {
  const totalCompleted = statusesByDate.filter((status) => status === 'completed').length;
  const totalTracked = statusesByDate.filter((status) => Boolean(status)).length;

  return totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : null;
};

export const countParticipantsByStatus = (participants: GoalParticipant[]) => {
  const accepted = participants.filter(
    (p) => typeof p.invitationStatus === 'string' && p.invitationStatus.toLowerCase() === 'accepted',
  ).length;

  const pending = participants.filter(
    (p) => typeof p.invitationStatus === 'string' && p.invitationStatus.toLowerCase() === 'pending',
  ).length;

  return { accepted, pending };
};
