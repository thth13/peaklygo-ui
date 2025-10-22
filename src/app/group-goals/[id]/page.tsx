import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { AxiosInstance } from 'axios';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import { LeftSidebar } from '@/components/layout/sidebar';
import { getGoal, getGroupGoalStats } from '@/lib/api/goal';
import type { GroupGoalStats, Goal } from '@/types';
import { createServerApi } from '@/lib/serverAxios';
import { formatDate } from '@/lib/utils';
import { IMAGE_URL } from '@/constants';

interface GroupGoalPageProps {
  params: Promise<{ id: string }>;
}

interface ParticipantViewModel {
  id: string;
  name: string;
  role: string;
  invitationStatus: string;
  joinedAt?: string | Date;
  contributionScore: number;
  isCurrentUser: boolean;
}

interface ContributorViewModel {
  id: string;
  name: string;
  contributionScore: number;
}

async function fetchGroupGoal(id: string, apiInstance?: AxiosInstance): Promise<Goal | null> {
  try {
    const client = apiInstance ?? (await createServerApi());
    const goal = await getGoal(id, client);

    if (!goal?.isGroup) {
      return null;
    }

    return goal;
  } catch (error) {
    console.error('Failed to fetch group goal:', error);
    return null;
  }
}

async function fetchGroupGoalStats(goalId: string, apiInstance: AxiosInstance): Promise<GroupGoalStats | null> {
  try {
    return await getGroupGoalStats(goalId, apiInstance);
  } catch (error) {
    console.error('Failed to fetch group goal stats:', error);
    return null;
  }
}

export async function generateMetadata({ params }: GroupGoalPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations('groupGoal.meta');
  const goal = await fetchGroupGoal(id);

  if (!goal) {
    return {
      title: t('notFoundTitle'),
      description: t('notFoundDescription'),
      alternates: { canonical: `/group-goals/${id}` },
    };
  }

  const title = t('title', { name: goal.goalName });
  const description = goal.description?.trim()?.slice(0, 200) || t('defaultDescription');
  const imageUrl =
    goal.image && goal.image.startsWith('http') ? goal.image : goal.image ? `${IMAGE_URL}/${goal.image}` : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/group-goals/${id}` },
    openGraph: {
      title,
      description,
      url: `/group-goals/${id}`,
      type: 'article',
      images: imageUrl ? [{ url: imageUrl, alt: `${goal.goalName} cover` }] : undefined,
    },
    twitter: {
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function GroupGoalPage({ params }: GroupGoalPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations('groupGoal');
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value ?? null;

  const serverApi = await createServerApi();
  const [goal, stats] = await Promise.all([fetchGroupGoal(id, serverApi), fetchGroupGoalStats(id, serverApi)]);

  if (!goal) {
    notFound();
  }

  const placeholder = '—';
  const progressValue = Math.max(0, Math.min(100, Math.round(goal.progress ?? 0)));
  const buildFallbackName = (userId: string) =>
    userId ? t('participants.fallbackName', { suffix: userId.slice(-6) }) : t('participants.unknown');
  const participantsRaw =
    goal.participants?.map<ParticipantViewModel>((participant) => {
      const userEntity = participant.userId;
      const userId =
        typeof userEntity === 'string'
          ? userEntity
          : typeof userEntity === 'object' && userEntity !== null && '_id' in userEntity
          ? (userEntity._id as string)
          : '';
      const username =
        typeof userEntity === 'object' && userEntity !== null && 'username' in userEntity
          ? (userEntity.username as string | undefined)
          : undefined;

      const fallbackName = buildFallbackName(userId);

      return {
        id: userId,
        name: username ?? fallbackName,
        role: participant.role ?? 'member',
        invitationStatus: participant.invitationStatus ?? 'pending',
        joinedAt: participant.joinedAt,
        contributionScore: participant.contributionScore ?? 0,
        isCurrentUser: Boolean(currentUserId && userId && currentUserId === userId),
      };
    }) ?? [];

  const participants = [...participantsRaw].sort((a, b) => {
    const rolePriority = (role: string) => {
      if (role === 'owner') return 0;
      if (role === 'admin') return 1;
      return 2;
    };
    const statusPriority = (status: string) => {
      if (status === 'accepted') return 0;
      if (status === 'pending') return 1;
      return 2;
    };

    const roleDiff = rolePriority(a.role) - rolePriority(b.role);
    if (roleDiff !== 0) return roleDiff;

    const statusDiff = statusPriority(a.invitationStatus) - statusPriority(b.invitationStatus);
    if (statusDiff !== 0) return statusDiff;

    return a.name.localeCompare(b.name, locale);
  });

  const acceptedCount =
    stats?.activeParticipants ?? participants.filter((participant) => participant.invitationStatus === 'accepted').length;
  const pendingCount =
    stats?.pendingInvitations ?? participants.filter((participant) => participant.invitationStatus === 'pending').length;
  const totalParticipants =
    stats?.totalParticipants ?? participants.length ?? goal.participantIds?.length ?? 0;

  const owner = participants.find((participant) => participant.role === 'owner');

  const contributors: ContributorViewModel[] =
    stats?.topContributors.map((entry) => {
      const rawId =
        typeof entry.userId === 'string'
          ? entry.userId
          : entry.userId && typeof entry.userId === 'object' && '_id' in entry.userId
          ? (entry.userId._id as string)
          : '';
      const existingParticipant = participants.find((participant) => participant.id === rawId);
      const username =
        typeof entry.userId === 'object' && entry.userId !== null && 'username' in entry.userId
          ? (entry.userId.username as string | undefined)
          : undefined;

      const fallbackName = rawId ? buildFallbackName(rawId) : t('participants.anonymous');
      const name = existingParticipant?.name ?? username ?? fallbackName;

      return {
        id: rawId || name,
        name,
        contributionScore: entry.contributionScore,
      };
    }) ?? [];

  const startDateLabel = goal.startDate ? formatDate(goal.startDate, locale) : placeholder;
  const endDateLabel = goal.endDate
    ? formatDate(goal.endDate, locale)
    : goal.noDeadline
    ? t('details.noDeadline')
    : placeholder;
  const createdAtLabel = goal.createdAt ? formatDate(goal.createdAt, locale) : startDateLabel;

  const privacyLabel = (() => {
    switch (goal.privacy) {
      case 'private':
        return t('privacy.private');
      case 'friends':
        return t('privacy.friends');
      case 'public':
      default:
        return t('privacy.public');
    }
  })();

  const statusBadge = (() => {
    if (goal.isCompleted) {
      return {
        label: t('status.completed'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      };
    }
    if (goal.isArchived) {
      return {
        label: t('status.archived'),
        className: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      };
    }
    return {
      label: t('status.active'),
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };
  })();

  const groupSettings = goal.groupSettings ?? {};
  const allowMembersToInvite = groupSettings.allowMembersToInvite ?? false;
  const requireApproval = groupSettings.requireApproval ?? true;
  const maxParticipants = groupSettings.maxParticipants ?? null;

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-2 py-6 md:flex-row md:px-4">
      <LeftSidebar userId={currentUserId ?? undefined} />

      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Link
                href="/group-goals"
                className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                {t('breadcrumbs.back')}
              </Link>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
                {goal.category && (
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {goal.category}
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('details.createdAt', { date: createdAtLabel })}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{goal.goalName}</h1>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('details.descriptionTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {goal.description?.trim() || t('details.descriptionFallback')}
                </p>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('details.teamProgress')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{progressValue}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-3 rounded-full bg-primary-500 transition-all dark:bg-primary-400"
                      style={{ width: `${progressValue}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900 dark:bg-indigo-900/20 dark:text-indigo-200">
                    <div className="text-xs uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                      {t('details.startDate')}
                    </div>
                    <div className="mt-1 text-base font-semibold">{startDateLabel}</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
                    <div className="text-xs uppercase tracking-wide text-emerald-500 dark:text-emerald-300">
                      {t('details.endDate')}
                    </div>
                    <div className="mt-1 text-base font-semibold">{endDateLabel}</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                    <div className="text-xs uppercase tracking-wide text-amber-500 dark:text-amber-300">
                      {t('details.privacy')}
                    </div>
                    <div className="mt-1 text-base font-semibold">{privacyLabel}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('participants.title')}</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('participants.count', { accepted: acceptedCount, total: totalParticipants })}
                  </span>
                </div>

                {participants.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">{t('participants.empty')}</p>
                ) : (
                  <div className="space-y-3">
                    {participants.map((participant, index) => {
                      const roleLabel =
                        participant.role === 'owner'
                          ? t('participants.roles.owner')
                          : participant.role === 'admin'
                          ? t('participants.roles.admin')
                          : t('participants.roles.member');
                      const statusLabel =
                        participant.invitationStatus === 'accepted'
                          ? t('participants.status.accepted')
                          : participant.invitationStatus === 'pending'
                          ? t('participants.status.pending')
                          : ['declined', 'rejected', 'cancelled'].includes(participant.invitationStatus)
                          ? t('participants.status.declined')
                          : t('participants.status.other');
                      const statusColor =
                        participant.invitationStatus === 'accepted'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : participant.invitationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
                      const joinedText = participant.joinedAt
                        ? t('participants.joinedAt', { date: formatDate(participant.joinedAt, locale) })
                        : t('participants.noDate');

                      return (
                        <div
                          key={participant.id || `participant-${index}`}
                          className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-700 ${
                            participant.isCurrentUser ? 'border-primary-200 dark:border-primary-600' : ''
                          }`}
                        >
                          <div>
                            <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{participant.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{roleLabel}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                              {statusLabel}
                            </span>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{joinedText}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {contributors.length > 0 && (
                <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('contributors.title')}</h2>
                  <ul className="space-y-3">
                    {contributors.map((contributor, index) => (
                      <li
                        key={`${contributor.id}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">#{index + 1}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{contributor.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {contributor.contributionScore.toFixed(0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="space-y-6">
              <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('stats.title')}</h2>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>{t('stats.progress')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{progressValue}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('stats.participants')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{totalParticipants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('stats.active')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{acceptedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('stats.pending')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{pendingCount}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('settings.title')}</h2>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>{t('settings.owner')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{owner?.name ?? placeholder}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('settings.memberInvites')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {allowMembersToInvite ? t('settings.memberInvitesAllowed') : t('settings.memberInvitesRestricted')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('settings.approval')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {requireApproval ? t('settings.approvalRequired') : t('settings.approvalNotRequired')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('settings.teamLimit')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {maxParticipants ? t('settings.teamLimitValue', { count: maxParticipants }) : t('settings.teamLimitUnset')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('settings.goalValue')}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{goal.value ?? placeholder}</span>
                  </div>
                </div>
              </section>

              {(goal.reward || goal.consequence) && (
                <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('motivation.title')}</h2>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    {goal.reward && (
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{t('motivation.reward')}</div>
                        <p>{goal.reward}</p>
                      </div>
                    )}
                    {goal.consequence && (
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{t('motivation.consequence')}</div>
                        <p>{goal.consequence}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
