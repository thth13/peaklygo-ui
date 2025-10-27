import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';

import { LeftSidebar } from '@/components/layout/sidebar';
import { GroupGoalHeader } from '@/components/group-goals/GroupGoalHeader';
import { GroupGoalHero } from '@/components/group-goals/GroupGoalHero';
import { TodayProgressClient } from '@/components/group-goals/TodayProgressClient';
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
import { formatDate } from '@/lib/utils';
import type { CheckIn, Goal } from '@/types';
import { IMAGE_URL } from '@/constants';
import {
  buildCheckInMap,
  getDisplayDates,
  getTodayCheckIns,
  calculateTodayCompletion,
  getUserTodayStatus,
  formatDateKey,
  countParticipantsByStatus,
  transformParticipantsToViews,
  transformTopContributors,
  transformActivityFeed,
  resolveImageUrl,
  clampProgress,
  getGoalLabels,
  findOwnerName,
  HERO_FALLBACK_IMAGE,
  type EnhancedParticipant,
} from '@/lib/group-goal';

interface GroupGoalPageProps {
  params: Promise<{ id: string }>;
}

const fetchGoal = async (goalId: string): Promise<Goal | null> => {
  try {
    const goal = await getGoal(goalId);
    return goal;
  } catch (error) {
    console.error('[GroupGoal] Failed to fetch goal', error);
    return null;
  }
};

const fetchGroupStats = async (goalId: string) => {
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

  const stats = await fetchGroupStats(id);

  // Базовые данные
  const participants = (goal.participants ?? []) as EnhancedParticipant[];
  const allCheckIns = (goal.checkIns ?? []) as CheckIn[];
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Обработка дат и чекинов
  const displayedDates = getDisplayDates(allCheckIns, today);
  const checkInByDate = buildCheckInMap(allCheckIns);
  const todaysCheckIns = getTodayCheckIns(allCheckIns, today);

  // Трансформация участников
  const participantViews = transformParticipantsToViews({
    participants,
    displayedDates,
    todayKey,
    checkInByDate,
    t: t as unknown as (key: string, params?: Record<string, unknown>) => string,
    locale,
  });

  // Статистика участников
  const { accepted: acceptedCount, pending: pendingCount } = countParticipantsByStatus(participants);
  const totalParticipants = stats?.totalParticipants ?? participants.length;
  const activeParticipants = stats?.activeParticipants ?? acceptedCount;
  const pendingInvitations = stats?.pendingInvitations ?? pendingCount;

  // Прогресс и визуальные данные
  const heroImage = resolveImageUrl(goal.image, IMAGE_URL) ?? HERO_FALLBACK_IMAGE;
  const progressValue = clampProgress(goal.progress);

  // Прогресс за сегодня
  const todayProgress = calculateTodayCompletion(todaysCheckIns, totalParticipants);
  const currentUserTodayStatus = getUserTodayStatus(todaysCheckIns, currentUserId);

  // Трансформация данных для компонентов
  const topContributors = transformTopContributors({
    stats,
    participantViews,
    t: t as unknown as (key: string, params?: Record<string, unknown>) => string,
  });
  const activityFeed = transformActivityFeed({
    todayCheckIns: todaysCheckIns,
    participantViews,
    t: t as unknown as (key: string, params?: Record<string, unknown>) => string,
    locale,
  });

  // Лейблы для UI
  const labels = getGoalLabels(
    goal,
    t as unknown as (key: string, params?: Record<string, unknown>) => string,
    formatDate,
    locale,
  );
  const ownerName = findOwnerName(participantViews, t('participants.roles.owner'), t('participants.anonymous'));

  return (
    <main className="mx-auto mt-6 flex max-w-7xl flex-col gap-6 px-2 md:flex-row md:px-4">
      <LeftSidebar userId={currentUserId} />

      <div className="flex-1 space-y-6 md:px-2 lg:px-6">
        <GroupGoalHeader
          goalName={goal.goalName}
          statusLabel={labels.status}
          privacyLabel={labels.privacy}
          createdLabel={labels.created}
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
              startDateLabel={labels.startDate}
              endDateLabel={labels.endDate}
              privacyLabel={labels.privacy}
              startDateTitle={t('details.startDate')}
              endDateTitle={t('details.endDate')}
              privacyTitle={t('details.privacy')}
            />

            <TodayProgressClient
              todayLabel={`Сегодня, ${formatDate(today, locale)}`}
              todaysCompleted={todayProgress.completed}
              todaysTotal={todayProgress.total}
              todaysCompletion={todayProgress.percentage}
              reward={goal.reward}
              consequence={goal.consequence}
              goalId={id}
              currentUserStatus={currentUserTodayStatus}
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
              ownerName={ownerName}
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
