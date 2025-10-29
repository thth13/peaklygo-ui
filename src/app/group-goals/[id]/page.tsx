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
import { getGroupGoal, getGroupGoalStats } from '@/lib/api/goal';
import { formatDate } from '@/lib/utils';
import type { CheckIn, GroupGoal } from '@/types';
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

const fetchGoal = async (goalId: string): Promise<GroupGoal | null> => {
  try {
    const goal = await getGroupGoal(goalId);
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
    const goal = await getGroupGoal(id);
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
    allCheckIns: allCheckIns,
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
          goalId={id}
        />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <GroupGoalHero
              heroImage={heroImage}
              goalName={goal.goalName}
              totalParticipants={totalParticipants}
              progressValue={progressValue}
              description={goal.description}
              startDateLabel={labels.startDate}
              endDateLabel={labels.endDate}
              privacyLabel={labels.privacy}
            />

            <TodayProgressClient
              todaysCompleted={todayProgress.completed}
              todaysTotal={todayProgress.total}
              todaysCompletion={todayProgress.percentage}
              reward={goal.reward}
              consequence={goal.consequence}
              goalId={id}
              currentUserStatus={currentUserTodayStatus}
            />

            <ProgressTable
              displayedDates={displayedDates}
              todayKey={todayKey}
              participantViews={participantViews}
              challengeStartDate={goal.startDate}
            />

            {/* <ParticipantsList
              participantViews={participantViews}
              totalParticipants={totalParticipants}
              acceptedCount={acceptedCount}
              goalId={id}
            /> */}

            <GroupChat participantViews={participantViews} goalId={id} />
          </div>

          <div className="space-y-6">
            <GroupGoalStatsComponent
              progressValue={progressValue}
              totalParticipants={totalParticipants}
              activeParticipants={activeParticipants}
              pendingInvitations={pendingInvitations}
            />

            <ActivityFeed activityItems={activityFeed} />

            {/* <TopContributors contributors={topContributors} locale={locale} /> */}

            {/* <MotivationSection reward={goal.reward} consequence={goal.consequence} /> */}

            <GroupSettings
              ownerName={ownerName}
              allowMembersToInvite={goal.groupSettings?.allowMembersToInvite ?? false}
              requireApproval={goal.groupSettings?.requireApproval ?? false}
              maxParticipants={goal.groupSettings?.maxParticipants ?? undefined}
              goalValue={goal.value ?? '—'}
            />

            <GroupActions />
          </div>
        </section>
      </div>
    </main>
  );
}
