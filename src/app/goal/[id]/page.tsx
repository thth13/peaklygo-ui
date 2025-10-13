import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faEdit } from '@fortawesome/free-solid-svg-icons';
import Link from '@/components/Link';
import { LeftSidebar } from '@/components/layout/sidebar';
import { getActivityTypeLabel, ActivityTypeColors, Goal } from '@/types';
import { getGoal } from '@/lib/api/goal';
import { formatDate } from '@/lib/utils';
import { GoalProgress } from '@/components/goal/GoalProgress';
import { CompletionBanner } from '@/components/goal/CompletionBanner';
import { cookies } from 'next/headers';
import { GoalActions } from '@/components/goal/GoalActions';
import { ProgressBlogProvider } from '@/context/ProgressBlogContext';
import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { IMAGE_URL } from '@/constants';

interface GoalPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations();

  try {
    const goal = await getGoal(id);

    const title = `${goal.goalName} — ${t('goals.pageTitle')} | PeaklyGo`;
    const description = goal.description?.trim()?.slice(0, 200) || t('goals.meta.fallbackDescription');

    const imageUrl = goal.image ? (goal.image.startsWith('http') ? goal.image : `${IMAGE_URL}/${goal.image}`) : null;

    return {
      title,
      description,
      alternates: { canonical: `/goal/${id}` },
      openGraph: {
        title,
        description,
        url: `/goal/${id}`,
        type: 'article',
        images: imageUrl ? [{ url: imageUrl, alt: `${goal.goalName} image` }] : undefined,
      },
      twitter: {
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: `${t('goals.pageTitle')} — PeaklyGo`,
      description: t('goals.meta.fallbackDescription'),
      alternates: { canonical: `/goal/${id}` },
    };
  }
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params;
  const t = await getTranslations();
  const locale = await getLocale();

  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;

  const goal = await fetchGoal(id);
  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('goals.notFound')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t('goals.notFoundDescription')}</p>
          <Link
            href="/profile"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {t('goals.backToGoals')}
          </Link>
        </div>
      </div>
    );
  }

  const getDaysLeft = () => {
    if (!goal.endDate) return null;
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysPassed = () => {
    const today = new Date();
    const startDate = new Date(goal.startDate);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getCompletedSteps = () => {
    return goal.steps.filter((step) => step.isCompleted).length;
  };

  const getPrivacyLabel = () => {
    switch (goal.privacy) {
      case 'private':
        return t('goals.privacy.private');
      case 'friends':
        return t('goals.privacy.friends');
      case 'public':
        return t('goals.privacy.public');
      default:
        return t('goals.privacy.public');
    }
  };

  const getPrivacyColor = () => {
    switch (goal.privacy) {
      case 'private':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'friends':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'public':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      default:
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
    }
  };

  const daysLeft = getDaysLeft();
  const daysPassed = getDaysPassed();
  const completedSteps = getCompletedSteps();

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex flex-col lg:flex-row">
      {/* Левая боковая панель */}
      <LeftSidebar userId={goal.userId} />

      <ProgressBlogProvider goalId={id}>
        {/* Основная область */}
        <div className="w-full lg:w-1/2 px-0 lg:px-6 mb-6 lg:mb-0">
          {/* Плашка поздравления с завершением цели */}
          <CompletionBanner goal={goal} />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors">
            {/* Заголовок */}
            <div className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/profile/${goal.userId}`}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                    <span className="text-sm">{t('navigation.backToGoals')}</span>
                  </Link>
                </div>
                {currentUserId === goal.userId && !goal.isCompleted && (
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/goal/${id}/edit`}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      <span>{t('common.edit')}</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {goal.goalName}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {/* <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    {goal.category}
                  </span> */}
                  {goal.isCompleted ? (
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <FontAwesomeIcon icon={faCheck} className="w-3 h-3 mr-2" />
                      {t('goals.status.completed')}
                    </span>
                  ) : (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      {t('goals.status.inProgress')}
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('goals.created')} {formatDate(goal.startDate, locale)}
                  </span>
                </div>
              </div>
            </div>

            {/* Компоненты привычки */}
            <GoalProgress goal={goal} goalId={id} currentUserId={currentUserId} />
          </div>
        </div>

        {/* Правая боковая панель */}
        <div className="w-full lg:w-1/4 px-0 lg:pl-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 mb-6 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('goals.statistics')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('goals.goalValue')}</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {goal.value} {t('goals.points')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('goals.daysPassed')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{daysPassed}</span>
              </div>
              {goal.endDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('goals.daysLeft')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{daysLeft}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('goals.stepsCompleted')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {completedSteps} из {goal.steps.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('goals.privacy.label')}</span>
                <span className={`px-2 py-1 rounded text-sm ${getPrivacyColor()}`}>{getPrivacyLabel()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 mb-6 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('goals.lastActivity')}</h3>
            <div className="space-y-3">
              {goal.activity?.slice(-5).map((item, index) => {
                const colors = ActivityTypeColors[item.activityType] || {
                  light: 'bg-gray-500',
                  dark: 'dark:bg-gray-400',
                };
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${colors.light} ${colors.dark} rounded-full mt-2`}></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {getActivityTypeLabel(item.activityType, (key: string) => t(key))}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.date, locale)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <GoalActions goal={goal} currentUserId={currentUserId} />
        </div>
      </ProgressBlogProvider>
    </main>
  );
}

async function fetchGoal(id: string): Promise<Goal | null> {
  try {
    const goal = await getGoal(id);
    return goal;
  } catch (err) {
    console.error('Failed to fetch goal:', err);
    return null;
  }
}
