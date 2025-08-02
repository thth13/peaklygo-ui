import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import Link from '@/components/Link';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { ActivityTypeLabels, ActivityTypeColors, Goal } from '@/types';
import { getGoal } from '@/lib/api/goal';
import { formatDate } from '@/lib/utils';
import { GoalProgress } from '@/components/goal/GoalProgress';
import { cookies } from 'next/headers';
import { GoalActions } from '@/components/goal/GoalActions';
import { ProgressBlogProvider } from '@/context/ProgressBlogContext';

interface GoalPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params;

  // Get userId from cookies on the server
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;

  const goal = await fetchGoal(id);
  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Цель не найдена</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Возможно, цель была удалена или вы не имеете к ней доступа
          </p>
          <Link
            href="/profile"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Вернуться к целям
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
        return 'Приватная';
      case 'friends':
        return 'Для друзей';
      case 'public':
        return 'Публичная';
      default:
        return 'Публичная';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Левая боковая панель */}
          <LeftSidebar />

          <ProgressBlogProvider goalId={id}>
            {/* Основная область */}
            <div className="flex-1 px-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors">
                {/* Заголовок */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Link
                        href="/"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-2 transition-colors"
                      >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                        <span className="text-sm">Назад к целям</span>
                      </Link>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/goal/${id}/edit`}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        <span>Редактировать</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{goal.goalName}</h1>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        {goal.category}
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                        {goal.isCompleted ? 'Завершено' : 'В процессе'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Создано {formatDate(goal.startDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <GoalProgress goal={goal} goalId={id} currentUserId={currentUserId} />
              </div>
            </div>

            {/* Правая боковая панель */}
            <div className="w-1/4 pl-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Статистика</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Ценность цели</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{goal.value} баллов</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Дней прошло</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{daysPassed}</span>
                  </div>
                  {goal.endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Дней осталось</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{daysLeft}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Этапов завершено</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {completedSteps} из {goal.steps.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Приватность</span>
                    <span className={`px-2 py-1 rounded text-sm ${getPrivacyColor()}`}>{getPrivacyLabel()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Последняя активность</h3>
                <div className="space-y-3">
                  {goal.activity?.slice(-5).map((item, index) => {
                    const colors = ActivityTypeColors[item.activityType];
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 ${colors.light} ${colors.dark} rounded-full mt-2`}></div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {ActivityTypeLabels[item.activityType]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <GoalActions goal={goal} />
            </div>
          </ProgressBlogProvider>
        </div>
      </div>
    </div>
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
