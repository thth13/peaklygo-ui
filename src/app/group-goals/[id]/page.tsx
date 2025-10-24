import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { isSameDay, subDays } from 'date-fns';

import { LeftSidebar } from '@/components/layout/sidebar';
import { GroupGoalHeader } from '@/components/group-goals/GroupGoalHeader';
import { GroupGoalHero } from '@/components/group-goals/GroupGoalHero';
import { TodayProgress } from '@/components/group-goals/TodayProgress';
import { ProgressTable } from '@/components/group-goals/ProgressTable';
import { ParticipantsList } from '@/components/group-goals/ParticipantsList';
import { GroupChat } from '@/components/group-goals/GroupChat';
import { GroupGoalStats as GroupGoalStatsComponent } from '@/components/group-goals/GroupGoalStats';
import { ActivityFeed } from '@/components/group-goals/ActivityFeed';
import { TopContributors } from '@/components/group-goals/TopContributors';
import { MotivationSection } from '@/components/group-goals/MotivationSection';
import { GroupSettings } from '@/components/group-goals/GroupSettings';
import { GroupActions } from '@/components/group-goals/GroupActions';
import { getGoal, getGroupGoalStats } from '@/lib/api/goal';
import { formatDate, formatDateWithTime } from '@/lib/utils';
import type { CheckIn, CheckInStatus, Goal, GoalParticipant, GroupGoalStats } from '@/types';
import { IMAGE_URL } from '@/constants';

interface GroupGoalPageProps {
  params: Promise<{ id: string }>;
}

interface ParticipantProfile {
  name?: string;
  avatar?: string;
  user?: string;
  username?: string;
}

interface ParticipantView {
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

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80';

const formatDateKey = (date: Date | string): string => {
  const normalized = typeof date === 'string' ? new Date(date) : date;
  return normalized.toISOString().split('T')[0];
};

const resolveImageUrl = (image?: string | null): string | null => {
  if (!image) {
    return null;
  }
  return image.startsWith('http') ? image : `${IMAGE_URL}/${image}`;
};

const fetchGoal = async (goalId: string): Promise<Goal | null> => {
  try {
    const goal = await getGoal(goalId);
    return goal;
  } catch (error) {
    console.error('[GroupGoal] Failed to fetch goal', error);
    return null;
  }
};

const fetchGroupStats = async (goalId: string): Promise<GroupGoalStats | null> => {
  try {
    const stats = await getGroupGoalStats(goalId);
    return stats;
  } catch (error) {
    console.warn('[GroupGoal] Failed to fetch stats', error);
    return null;
  }
};

export async function generateMetadata({ params }: GroupGoalPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations('groupGoal');

  try {
    const goal = await getGoal(id);
    const title = t('meta.title', { name: goal.goalName });
    const description = goal.description?.trim()?.slice(0, 200) || t('meta.defaultDescription');

    return {
      title,
      description,
      alternates: { canonical: `/group-goals/${id}` },
      openGraph: {
        title,
        description,
        url: `/group-goals/${id}`,
        type: 'article',
      },
      twitter: {
        title,
        description,
      },
    };
  } catch {
    return {
      title: t('meta.notFoundTitle'),
      description: t('meta.notFoundDescription'),
      alternates: { canonical: `/group-goals/${id}` },
    };
  }
}

export default async function GroupGoalPage({ params }: GroupGoalPageProps) {
  const { id } = await params;
  const t = await getTranslations('groupGoal');
  const locale = await getLocale();
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;

  const goal = await fetchGoal(id);
  if (!goal) {
    notFound();
  }

  const [stats] = await Promise.all([fetchGroupStats(id)]);

  const participants = (goal.participants ?? []) as Array<GoalParticipant & { profile?: ParticipantProfile }>;
  const allCheckIns = (goal.checkIns ?? []) as CheckIn[];
  const today = new Date();
  const todayKey = formatDateKey(today);

  const uniqueDateKeys = Array.from(new Set(allCheckIns.map((entry) => formatDateKey(entry.date)))).sort();
  const lastSevenDates = uniqueDateKeys.slice(-7);
  const fallbackDates =
    lastSevenDates.length > 0
      ? lastSevenDates
      : Array.from({ length: 5 }, (_, index) => formatDateKey(subDays(today, 4 - index)));
  const displayedDates = fallbackDates.sort();

  const checkInByDate = new Map<string, Map<string, CheckInStatus>>();
  for (const checkIn of allCheckIns) {
    const dateKey = formatDateKey(checkIn.date);
    const mapForDate = checkInByDate.get(dateKey) ?? new Map<string, CheckInStatus>();
    mapForDate.set(checkIn.userId, checkIn.status);
    checkInByDate.set(dateKey, mapForDate);
  }

  const getParticipantId = (participant: GoalParticipant, fallbackIndex: number): string => {
    if (typeof participant.userId === 'string' && participant.userId) {
      return participant.userId;
    }
    if (participant.userId && typeof participant.userId === 'object' && '_id' in participant.userId) {
      return participant.userId._id;
    }
    return `participant-${fallbackIndex}`;
  };

  const resolveParticipantName = (
    participant: GoalParticipant & { profile?: ParticipantProfile },
    index: number,
  ): string => {
    if (participant.profile?.name) {
      return participant.profile.name;
    }
    if (participant.profile?.username) {
      return participant.profile.username;
    }
    if (typeof participant.userId === 'object' && participant.userId?.username) {
      return participant.userId.username;
    }
    if (participant.profile?.user) {
      return participant.profile.user;
    }
    return t('participants.fallbackName', { suffix: index + 1 });
  };

  const resolveParticipantAvatar = (participant: GoalParticipant & { profile?: ParticipantProfile }): string | null => {
    const avatarCandidate = participant.profile?.avatar;
    return resolveImageUrl(avatarCandidate);
  };

  const resolveRoleLabel = (participant: GoalParticipant): string => {
    const roleValue = typeof participant.role === 'string' ? participant.role.toLowerCase() : '';
    if (roleValue === 'owner') {
      return t('participants.roles.owner');
    }
    if (roleValue === 'admin') {
      return t('participants.roles.admin');
    }
    return t('participants.roles.member');
  };

  const resolveStatusLabel = (participant: GoalParticipant): string => {
    const statusValue =
      typeof participant.invitationStatus === 'string' ? participant.invitationStatus.toLowerCase() : '';
    if (statusValue === 'accepted') {
      return t('participants.status.accepted');
    }
    if (statusValue === 'pending') {
      return t('participants.status.pending');
    }
    if (statusValue === 'declined') {
      return t('participants.status.declined');
    }
    return t('participants.status.other');
  };

  const resolveJoinedLabel = (participant: GoalParticipant): string => {
    if (!participant.joinedAt) {
      return t('participants.noDate');
    }
    return t('participants.joinedAt', { date: formatDate(participant.joinedAt, locale) });
  };

  const participantViews: ParticipantView[] = participants.map((participant, index) => {
    const participantId = getParticipantId(participant, index);
    const statusesByDate = displayedDates.map((dateKey) => checkInByDate.get(dateKey)?.get(participantId) ?? null);
    const totalCompleted = statusesByDate.filter((status) => status === 'completed').length;
    const totalTracked = statusesByDate.filter((status) => Boolean(status)).length;
    const todaysStatus = checkInByDate.get(todayKey)?.get(participantId) ?? null;

    return {
      id: participantId,
      name: resolveParticipantName(participant, index),
      avatarUrl: resolveParticipantAvatar(participant),
      roleLabel: resolveRoleLabel(participant),
      statusLabel: resolveStatusLabel(participant),
      joinedLabel: resolveJoinedLabel(participant),
      completionRate: totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : null,
      todaysStatus,
      statusesByDate,
    };
  });

  const acceptedCount = participants.filter(
    (participant) =>
      typeof participant.invitationStatus === 'string' && participant.invitationStatus.toLowerCase() === 'accepted',
  ).length;
  const pendingCount = participants.filter(
    (participant) =>
      typeof participant.invitationStatus === 'string' && participant.invitationStatus.toLowerCase() === 'pending',
  ).length;

  const totalParticipants = stats?.totalParticipants ?? participants.length;
  const activeParticipants = stats?.activeParticipants ?? acceptedCount;
  const pendingInvitations = stats?.pendingInvitations ?? pendingCount;

  const heroImage = resolveImageUrl(goal.image) ?? HERO_FALLBACK;
  const progressValue = Math.max(0, Math.min(100, Math.round(goal.progress ?? 0)));

  const todaysCheckIns = allCheckIns.filter((checkIn) => isSameDay(new Date(checkIn.date), today));
  const todaysCompleted = todaysCheckIns.filter((checkIn) => checkIn.status === 'completed').length;
  const todaysTotal = todaysCheckIns.length || participants.length || totalParticipants || 1;
  const todaysCompletion = Math.round((todaysCompleted / todaysTotal) * 100);

  const topContributors = (stats?.topContributors ?? []).map((entry, index) => {
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

  const activityFeed = todaysCheckIns
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((checkIn) => {
      const participantView = participantViews.find((view) => view.id === checkIn.userId);
      let statusText = 'отметился';
      if (checkIn.status === 'missed') {
        statusText = 'пропустил отметку';
      } else if (checkIn.status === 'pending') {
        statusText = 'ожидает подтверждение';
      }
      return {
        id: `${checkIn.userId}-${formatDateKey(checkIn.date)}`,
        text: `${participantView?.name ?? t('participants.anonymous')} ${statusText}`,
        date: formatDateWithTime(checkIn.date, locale),
      };
    });

  const privacyLabel = goal.privacy ? t(`privacy.${goal.privacy}`) : t('privacy.public');
  const statusLabel = goal.isCompleted
    ? t('status.completed')
    : goal.isArchived
    ? t('status.archived')
    : t('status.active');

  const startDateLabel = goal.startDate ? formatDate(goal.startDate, locale) : '—';
  const endDateLabel = goal.noDeadline
    ? t('details.noDeadline')
    : goal.endDate
    ? formatDate(goal.endDate, locale)
    : '—';
  const createdLabel = goal.createdAt
    ? t('details.createdAt', { date: formatDate(goal.createdAt, locale) })
    : goal.startDate
    ? t('details.createdAt', { date: formatDate(goal.startDate, locale) })
    : '';

  return (
    <main className="mx-auto mt-6 flex max-w-7xl flex-col gap-6 px-2 md:flex-row md:px-4">
      <LeftSidebar userId={currentUserId} />

      <div className="flex-1 space-y-6 md:px-2 lg:px-6">
        <GroupGoalHeader
          goalName={goal.goalName}
          statusLabel={statusLabel}
          privacyLabel={privacyLabel}
          createdLabel={createdLabel}
          backText={t('breadcrumbs.back')}
          inviteText="Пригласить"
          settingsText="Настройки"
        />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <GroupGoalHero
              heroImage={heroImage}
              goalName={goal.goalName}
              totalParticipants={totalParticipants}
              progressValue={progressValue}
              progressText={t('details.teamProgress')}
              description={goal.description}
              descriptionTitle={t('details.descriptionTitle')}
              descriptionFallback={t('details.descriptionFallback')}
              startDateLabel={startDateLabel}
              endDateLabel={endDateLabel}
              privacyLabel={privacyLabel}
              startDateTitle={t('details.startDate')}
              endDateTitle={t('details.endDate')}
              privacyTitle={t('details.privacy')}
            />

            <TodayProgress
              todayLabel={`Сегодня, ${formatDate(today, locale)}`}
              todaysCompleted={todaysCompleted}
              todaysTotal={todaysTotal}
              todaysCompletion={todaysCompletion}
              completionLabel="выполнение"
              completedText="из"
              checkInButtonText="Отметить участие"
              reward={goal.reward}
              consequence={goal.consequence}
              rewardTitle="Групповая награда"
              rewardFallback="Добавьте награду, чтобы мотивировать команду"
              consequenceTitle="Штраф за пропуск"
              consequenceFallback="Опишите, что происходит при пропуске"
            />

            <ProgressTable
              title="Таблица прогресса участников"
              subtitle={`Последние ${displayedDates.length} дней`}
              emptyText={t('participants.empty')}
              displayedDates={displayedDates}
              todayKey={todayKey}
              participantViews={participantViews}
              completedText="Выполнено"
              missedText="Пропуск"
              pendingText="Ожидание"
              showAllText="Показать все дни"
            />

            <ParticipantsList
              title={`${t('participants.title')} (${totalParticipants})`}
              subtitle={t('participants.count', { accepted: acceptedCount, total: totalParticipants })}
              emptyText={t('participants.empty')}
              inviteText="Пригласить еще"
              showAllText="Показать всех участников"
              participantViews={participantViews}
            />

            <GroupChat
              title="Чат участников"
              subtitle="Обсуждайте прогресс, делитесь советами и поддерживайте друг друга."
              emptyText="Добавьте первых участников, чтобы начать общение."
              inputPlaceholder="Написать сообщение..."
              participantViews={participantViews}
            />
          </div>

          <div className="space-y-6">
            <GroupGoalStatsComponent
              title={t('stats.title')}
              progressLabel={t('stats.progress')}
              participantsLabel={t('stats.participants')}
              activeLabel={t('stats.active')}
              pendingLabel={t('stats.pending')}
              progressValue={progressValue}
              totalParticipants={totalParticipants}
              activeParticipants={activeParticipants}
              pendingInvitations={pendingInvitations}
            />

            <ActivityFeed
              title="Текущая активность"
              emptyText="Пока нет отметок за сегодня."
              showAllText="Показать всю активность"
              activityItems={activityFeed}
            />

            <TopContributors
              title={t('contributors.title')}
              emptyText="Лидеры появятся после первых отметок."
              subtitleText="Вклад в команду"
              contributors={topContributors}
              locale={locale}
            />

            <MotivationSection
              title={t('motivation.title')}
              rewardTitle={t('motivation.reward')}
              consequenceTitle={t('motivation.consequence')}
              reward={goal.reward}
              consequence={goal.consequence}
              rewardFallback="Добавьте награду за общее выполнение цели."
              consequenceFallback="Опишите, что случится при невыполнении цели."
            />

            <GroupSettings
              title={t('settings.title')}
              ownerLabel={t('settings.owner')}
              memberInvitesLabel={t('settings.memberInvites')}
              approvalLabel={t('settings.approval')}
              teamLimitLabel={t('settings.teamLimit')}
              goalValueLabel={t('settings.goalValue')}
              ownerName={
                participantViews.find((participant) => participant.roleLabel === t('participants.roles.owner'))?.name ||
                t('participants.anonymous')
              }
              memberInvitesValue={
                goal.groupSettings?.allowMembersToInvite
                  ? t('settings.memberInvitesAllowed')
                  : t('settings.memberInvitesRestricted')
              }
              approvalValue={
                goal.groupSettings?.requireApproval ? t('settings.approvalRequired') : t('settings.approvalNotRequired')
              }
              teamLimitValue={
                goal.groupSettings?.maxParticipants
                  ? t('settings.teamLimitValue', { count: goal.groupSettings.maxParticipants })
                  : t('settings.teamLimitUnset')
              }
              goalValue={goal.value ?? '—'}
              editButtonText="Изменить настройки"
            />

            <GroupActions
              title="Действия"
              createPostText="Создать пост"
              shareText="Поделиться группой"
              exportText="Экспорт статистики"
              leaveText="Покинуть группу"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
